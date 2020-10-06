const dotenv = require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Token = require('../../models/token');
const File = require('../../models/file');
const messages = require('../../methods/messages');

const dropboxRpcEndpoint = 'https://api.dropboxapi.com/';
const dropboxAccessToken = process.env.DROPBOX_ACCESS_TOKEN;

const createMessages = async (event, message, entries, cursor, token) => {
  await entries.reduce(async (lastPromise, entry) => {
    const accum = await lastPromise;
    if (entry['.tag'] === 'deleted') {
      await File.deleteMany({ path_display: entry.path_display });
    } else if (entry['.tag'] === 'file') {
      const body = {
        ...entry,
        token,
        cursor,
      };
      delete body['.tag'];
      const messageObject = {
        ...event,
        body: JSON.stringify(body),
      };
      await messages.create(messageObject, { foreignKey: entry.id, app: 'dropbox', event: message });
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

const executeChanges = async (event, message, account) => {
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
    await createMessages(event, message, data.entries, data.cursor);
  }
  await tokens.reduce(async (lastPromise, token) => {
    const accum = await lastPromise;
    url = `${dropboxRpcEndpoint}2/files/list_folder/continue`;
    body = {
      cursor: token.token,
    };
    data = await listFolders(url, body);
    await createMessages(event, message, data.entries, data.cursor, token.token);
    await Token.findByIdAndUpdate(token._id, { token: data.cursor });
    return [...accum, {}];
  }, Promise.resolve([]));
};

module.exports = async (event, message) => {
  const data = JSON.parse(event.body);
  const { list_folder: listFolder } = data;
  const { accounts } = listFolder;
  await accounts.reduce(async (lastPromise, account) => {
    const accum = await lastPromise;
    await executeChanges(event, message, account);
    return [...accum, {}];
  }, Promise.resolve([]));
  return data;
};
