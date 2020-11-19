const axios = require('axios');
const File = require('./models/file');
const netlify = require('./services/netlify');
const filesLib = require('./libs/files');

const netlifyBaseUrl = 'https://api.netlify.com/api/v1/';
const netlifyDeployEndpoint = `sites/${process.env.NETLIFY_CDN_ID}/deploys`
const token = process.env.NETLIFY_ACCESS_TOKEN;

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
}

const syncFiles = async (event, uploadMessage) => {
  const files = await File.find({});
  const newFiles = files.filter((file) => file.status === 'new');
  if (newFiles.length === 0) {
    return;
  }
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
  await newFiles.reduce(async (lastPromise, file) => {
    const accum = await lastPromise;
    const {
      _id,
      name,
      path_display,
      foreignKey,
      sha1,
      extension,
      externalUrl,
    } = file;
    if (required.indexOf(sha1) === -1) {
      const messageObject = {
        ...event,
        body: JSON.stringify({
          name,
          path_display,
          foreignKey,
          sha1,
          extension,
          externalUrl,
        }),
      };
      await filesLib.message(messageObject, uploadMessage, { extension, path_display });
      await File.findByIdAndUpdate(_id, { status: 'deployed' });
    }
    return [...accum, {}];
  }, Promise.resolve([]));
};

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const uploadMessage = 'upload_{{dir}}_{{extension}}_file';
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
