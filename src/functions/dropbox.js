const dotenv = require('dotenv').config();
const crypto = require('crypto');
const axios = require('axios');
const mime = require('mime-types');
const path = require('path');
const mongoose = require('mongoose');
const db = require('./database/mongodb');
const Token = require('./models/token');
const File = require('./models/file');
const files = require('./methods/files');
const messages = require('./methods/messages');
const dropbox = require('./methods/dropbox');

const dropboxRpcEndpoint = 'https://api.dropboxapi.com/';
const dropboxAccessToken = process.env.DROPBOX_ACCESS_TOKEN;

const replaceAll = async (str, mapObj) => {
  const regex = new RegExp(Object.keys(mapObj).join('|'), 'gi');
  return str.replace(regex, function(matched) {
    return mapObj[matched.toLowerCase()];
  });
};

const saveFile = async (entry, event, message) => {
  const { dir } = path.parse(entry.path_display);
  const data = await dropbox.download(entry.id);
  const mimeType = mime.lookup(entry.name);
  const extension = mime.extension(mimeType);
  const sha1 = crypto
    .createHash('sha1')
    .update(data)
    .digest('hex');
  const metaData = {
    ...entry,
    foreignKey: entry.id,
    mimeType,
    extension,
    sha1,
  };
  delete metaData['.tag'];
  const messageObject = {
    ...event,
    body: JSON.stringify(metaData),
  };
  await files.create(metaData);
  const mapObj = { '{{dir}}': dir.replace('/',''), '{{extension}}': extension };
  const eventMessage = await replaceAll(message, mapObj);
  await messages.create(messageObject, { foreignKey: entry.id, app: 'dropbox', event: eventMessage });

}

const saveEntries = async (entries, event, message) => {
  await entries.reduce(async (lastPromise, entry) => {
    const accum = await lastPromise;
    if (entry['.tag'] === 'deleted') {
      await File.deleteMany({ path_display: entry.path_display });
    } else if (entry['.tag'] === 'file') {
      await saveFile(entry, event, message);
    }
    return [...accum, {}];
  }, Promise.resolve([]));
};

const listFolders = async (url, body) => {
  const res = await axios({
    method: 'post',
    url,
    headers: {
      Authorization: `Bearer ${dropboxAccessToken}`,
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(body),
  });
  return res.data;
};

const executeChanges = async (account, event, message) => {
  const tokens = await Token.find({
    app: 'dropbox',
    account,
  });
  let url;
  let body;
  let data;
  if (tokens.length === 0) {
    url = `${dropboxRpcEndpoint}2/files/list_folder`;
    body = {
      path: '',
      recursive: true,
      include_deleted: true,
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
    await saveEntries(data.entries, event, message);
  }
  await tokens.reduce(async (lastPromise, token) => {
    const accum = await lastPromise;
    url = `${dropboxRpcEndpoint}2/files/list_folder/continue`;
    body = {
      cursor: token.token,
    };
    data = await listFolders(url, body);
    await saveEntries(data.entries, event, message);
    await Token.findByIdAndUpdate(token._id, { token: data.cursor });
    return [...accum, {}];
  }, Promise.resolve([]));
};

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const data = JSON.parse(event.body);
    const { list_folder: listFolder } = data;
    const { accounts } = listFolder;
    const message = 'save_{{dir}}_{{extension}}_file';

    await accounts.reduce(async (lastPromise, account) => {
      const accum = await lastPromise;
      await executeChanges(account, event, message);
      return [...accum, {}];
    }, Promise.resolve([]));
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
