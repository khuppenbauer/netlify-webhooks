const axios = require('axios');
const File = require('./models/file');
const dropbox = require('./services/dropbox');
const netlify = require('./services/netlify');
const filesLib = require('./libs/files');

const netlifyBaseUrl = 'https://api.netlify.com/api/v1/';
const netlifyDeployEndpoint = `sites/${process.env.NETLIFY_CDN_ID}/deploys`
const token = process.env.NETLIFY_ACCESS_TOKEN;

const processEntries = async (event, message, entries) => {
  await Object.values(entries).reduce(async (lastPromise, entry) => {
    const accum = await lastPromise;
    const { tag, path_display } = entry;
    if (tag === 'deleted') {
      await File.deleteMany({ path_display });
    } else if (tag === 'file') {
      const messageObject = {
        ...event,
        body: JSON.stringify(entry),
      };
      await dropbox.sync(messageObject);
    }
    return [...accum, {}];
  }, Promise.resolve([]));
};

const upload = async (event, message, id, required) => {
  const query = {
    sha1: {
      $in: required,
    },
  };
  const missingFiles = await File.find(query);
  await missingFiles.reduce(async (lastPromise, item) => {
    const accum = await lastPromise;
    const {
      name,
      path_display,
      foreignKey,
      sha1,
      extension,
      externalUrl,
    } = item;
    const messageObject = {
      ...event,
      body: JSON.stringify({
        id,
        name,
        path_display,
        foreignKey,
        sha1,
        extension,
        externalUrl,
      }),
    };
    await netlify.upload(messageObject, message);
    return [...accum, {}];
  }, Promise.resolve([]));
  await File.updateMany(query, { status: 'deployed' });
}

const syncFiles = async (event, uploadMessage) => {
  const files = await File.find({});
  const filesData = files.reduce(
    (acc, item) => (acc[item.path_display] = item.sha1, acc),
    {},
  );
  const body = {
    files: filesData,
  };
  const res = await axios({
    method: 'post',
    url: `${netlifyBaseUrl}${netlifyDeployEndpoint}`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(body),
  });
  const { id, required } = res.data;
  if (required.length > 0) {
    await upload(event, uploadMessage, id, required);
  }
  const query = {
    sha1: {
      $nin: required,
    },
    status: 'new',
  };
  const deployedFiles = await File.find(query);
  await deployedFiles.reduce(async (lastPromise, file) => {
    const { extension, path_display } = file;
    const accum = await lastPromise;
    await filesLib.message(event, uploadMessage, { extension, path_display });
    return [...accum, {}];
  }, Promise.resolve([]));
  await File.updateMany(query, { status: 'deployed' });
  return res.data;
};

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const syncMessage = 'create_file';
    const uploadMessage = 'upload_{{dir}}_{{extension}}_file';
    const entries = await dropbox.list(event);
    const entriesObject = JSON.parse(JSON.stringify(entries[0]).replace(/\.tag/gi, 'tag'));
    await processEntries(event, syncMessage, entriesObject);
    await syncFiles(event, uploadMessage);
    return {
      statusCode: 200,
      body: 'Ok',
    };
  }
  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};
