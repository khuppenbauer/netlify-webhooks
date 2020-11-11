const dotenv = require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Token = require('../../models/token');
const Message = require('../../models/message');
const messages = require('../../methods/messages');
const processEntries = require('./process');

const dropboxRpcEndpoint = 'https://api.dropboxapi.com/';
const dropboxAccessToken = process.env.DROPBOX_ACCESS_TOKEN;
const chunk = 50;

const createMessage = async (event, message, entries) => {
  const body = JSON.stringify(entries).replace(/\.tag/gi, 'tag');
  const messageObject = {
    ...event,
    body,
  };
  const foreignKey = crypto
    .createHash('sha1')
    .update(body)
    .digest('hex');
  const messageData = {
    foreignKey,
    app: 'dropbox',
    event: message,
  };
  const existing = await Message.find(messageData);
  if (existing.length === 0) {
    await messages.create(messageObject, messageData);
  }
}

const chunkEntries = async (event, parseMessage, processMessage, entries) => {
  if (entries.length < chunk) {
    const entriesObject = JSON.stringify(entries).replace(/\.tag/gi, 'tag');
    return processEntries({ ...event, body: entriesObject }, processMessage);
  }
  let i;
  let j;
  let chunkArray;
  for (i = 0, j = entries.length; i < j; i += chunk) {
    chunkArray = entries.slice(i, i + chunk);
    createMessage(event, parseMessage, chunkArray);
  }
  return true;
};

const executeDropboxApi = async (url, body) => {
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

const prepareListFolders = async (event, parseMessage, processMessage, cursor) => {
  const url = `${dropboxRpcEndpoint}2/files/list_folder/continue`;
  const data = await executeDropboxApi(url, { cursor });
  const { cursor: newCursor, entries, has_more: hasMore } = data;
  await chunkEntries(event, parseMessage, processMessage, entries);
  if (hasMore) {
    const foreignKey = new Date().getTime();
    await messages.create(event, { foreignKey, app: 'dropbox', event: 'changes' });
  }
  return newCursor;
};

const executeChanges = async (event, parseMessage, processMessage, account) => {
  const tokens = await Token.find({
    app: 'dropbox',
    account,
  });
  if (tokens.length === 0) {
    const url = `${dropboxRpcEndpoint}2/files/list_folder`;
    const body = {
      path: '',
      recursive: true,
      include_deleted: true,
    };
    const data = await executeDropboxApi(url, body);
    const { cursor, entries, has_more: hasMore } = data;
    await Token.create(
      {
        _id: mongoose.Types.ObjectId(),
        app: 'dropbox',
        account,
        token: cursor,
      },
    );
    await chunkEntries(event, parseMessage, processMessage, entries);
    if (hasMore) {
      const foreignKey = new Date().getTime();
      await messages.create(event, { foreignKey, app: 'dropbox', event: 'changes' });
    }
  } else {
    const { token: cursor, _id } = tokens[0];
    const newToken = await prepareListFolders(event, parseMessage, processMessage, cursor);
    await Token.findByIdAndUpdate(_id, { token: newToken });
  }
};

module.exports = async (event, parseMessage, processMessage) => {
  const data = JSON.parse(event.body);
  const { list_folder: listFolder } = data;
  const { accounts } = listFolder;
  await accounts.reduce(async (lastPromise, account) => {
    const accum = await lastPromise;
    await executeChanges(event, parseMessage, processMessage, account);
    return [...accum, {}];
  }, Promise.resolve([]));
};
