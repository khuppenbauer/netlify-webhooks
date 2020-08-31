const dotenv = require('dotenv').config();
const axios = require('axios');
const mime = require('mime-types');
const mongoose = require('mongoose');
const db = require('./database/mongodb');
const Token = require('./models/token');
const files = require('./methods/files');
const tracks = require('./methods/tracks');

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

const saveEntries = async (entries, event) => {
  const promises = entries
    .filter((entry) => entry['.tag'] === 'file')
    .map(async (entry) => {
      const data = await downloadEntry(entry.id);
      const mimeType = mime.lookup(entry.name);
      const extension = mime.extension(mimeType);
      const track = {
        gpxFile: entry.path_display,
        foreignKey: entry.id,
        _id: mongoose.Types.ObjectId(),
      };
      const metaData = {
        ...entry,
        foreignKey: entry.id,
        mimeType,
        extension,
        track: track._id,
      };
      if (extension === 'gpx') {
        await tracks.create(track);
      }
      await files.create(data, metaData, event);
    });
  await Promise.all(promises);
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

const executeChanges = async (account, event) => {
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
    await saveEntries(data.entries, event);
  }
  const promises = tokens.map(async (token) => {
    url = '2/files/list_folder/continue';
    body = {
      cursor: token.token,
    };
    data = await listFolders(url, body);
    await Token.findByIdAndUpdate(token._id, { token: data.cursor });
    await saveEntries(data.entries, event);
  })
  await Promise.all(promises);
};

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const data = JSON.parse(event.body);
    const { list_folder: listFolder } = data;
    const { accounts } = listFolder;
    const promises = accounts.map(async (account) => {
      await executeChanges(account, event);
    });
    await Promise.all(promises);
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
