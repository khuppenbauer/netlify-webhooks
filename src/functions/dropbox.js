const dotenv = require('dotenv').config();
const crypto = require('crypto');
const axios = require('axios');
const mime = require('mime-types');
const mongoose = require('mongoose');
const db = require('./database/mongodb');
const Token = require('./models/token');
const File = require('./models/file');
const messages = require('./methods/messages');

const downloadEntry = async (id) => {
  const downloadUrl = 'https://content.dropboxapi.com/2/files/download';
  const token = process.env.DROPBOX_ACCESS_TOKEN;
  const args = {
    path: id,
  };
  const res = await axios({
    method: 'post',
    url: downloadUrl,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify(args),
    },
  });
  return res.data;
};

const uploadFiles = async (id, hashes, entriesData) => {
  const netlifyBaseUrl = 'https://api.netlify.com/api/v1/';
  const token = process.env.NETLIFY_ACCESS_TOKEN;
  let netlifyFileUploadEndpoint;
  let data;
  const promises = hashes.map(async (hash) => {
    if (entriesData[hash]) {
      const entry = entriesData[hash];
      netlifyFileUploadEndpoint = `deploys/${id}/files/${entry.path}`;
      data = entry.data;
    } else {
      const filterQuery = {
        sha1: hash,
      };
      const files = await File.find(filterQuery, null, { limit: 1 });
      netlifyFileUploadEndpoint = `deploys/${id}/files/${files[0].path_display}`;
      data = await downloadEntry(files[0].foreignKey);
    }
    await axios({
      method: 'put',
      url: `${netlifyBaseUrl}${netlifyFileUploadEndpoint}`,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
      },
      data,
    });
  })
  await Promise.all(promises);
};

const syncFiles = async (entriesData) => {
  const netlifyBaseUrl = 'https://api.netlify.com/api/v1/';
  const netlifyDeployEndpoint = `sites/${process.env.NETLIFY_CDN_ID}/deploys`
  const token = process.env.NETLIFY_ACCESS_TOKEN;
  const files = await File.find({});
  const filesData = {};
  files.forEach((file) => {
    filesData[file.path_display] = file.sha1;
  });
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
  if (res.data.required) {
    await uploadFiles(res.data.id, res.data.required, entriesData);
  }
  return res.data;
};

const saveEntries = async (entries, entriesData, event) => {
  const promises = entries
    .filter((entry) => entry['.tag'] === 'file')
    .map(async (entry) => {
      const data = await downloadEntry(entry.id);
      const sha1 = crypto
        .createHash('sha1')
        .update(data)
        .digest('hex');
      const mimeType = mime.lookup(entry.name);
      const extension = mime.extension(mimeType);
      entriesData[sha1] = { data, path: entry.path_display };
      const file = await File.create(
        {
          ...entry,
          foreignKey: entry.id,
          sha1,
          mimeType,
          extension,
          _id: mongoose.Types.ObjectId(),
        },
      );
      event['body'] = JSON.stringify(file);
      await messages.create(event, { foreignKey: entry.id, app: 'dropbox', event: `deploy_${extension}_file` });
    });
  await Promise.all(promises);
  return entriesData;
};

const listFolders = async (url, body) => {
  const dropboxRpcEndpoint = 'https://api.dropboxapi.com/';
  const dropboxAccessToken = process.env.DROPBOX_ACCESS_TOKEN;
  const res = await axios({
    method: 'post',
    url: `${dropboxRpcEndpoint}${url}`,
    headers: {
      Authorization: `Bearer ${dropboxAccessToken}`,
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(body),
  });
  return res.data;
};

const executeChanges = async (account, entriesData, event) => {
  const tokenQuery = {
    app: 'dropbox',
    account,
  };
  const tokens = await Token.find(tokenQuery);
  let url;
  let body;
  let data;
  if (tokens.length === 0) {
    url = '2/files/list_folder';
    body = {
      path: '',
      recursive: true,
    };
    data = await listFolders(url, body);
    await Token.create(
      {
        _id: mongoose.Types.ObjectId(),
        app: 'dropbox',
        account,
        token: data.cursor,
      },
    );
    entriesData = await saveEntries(data.entries, entriesData, event);
  }
  const promises = tokens.map(async (token) => {
    url = '2/files/list_folder/continue';
    body = {
      cursor: token.token,
    };
    data = await listFolders(url, body);
    await Token.findByIdAndUpdate(token._id, { token: data.cursor });
    entriesData = await saveEntries(data.entries, entriesData, event);
  })
  await Promise.all(promises);
  return entriesData;
};

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const data = JSON.parse(event.body);
    const { list_folder: listFolder } = data;
    const { accounts } = listFolder;
    let entriesData = {};
    const promises = accounts.map(async (account) => {
      entriesData = await executeChanges(account, entriesData, event);
    });
    await Promise.all(promises);
    await new Promise((r) => setTimeout(r, 1000));
    await syncFiles(entriesData);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  }
  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};
