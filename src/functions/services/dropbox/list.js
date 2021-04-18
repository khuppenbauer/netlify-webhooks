const dotenv = require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Token = require('../../models/token');
const messages = require('../../methods/messages');
const request = require('../request');

const dropboxRpcEndpoint = 'https://api.dropboxapi.com/';
const dropboxAccessToken = process.env.DROPBOX_ACCESS_TOKEN;

const executeDropboxApi = async (url, body) => {
  const startTime = new Date().getTime();
  let res;
  try {
    res = await axios({
      method: 'post',
      url,
      headers: {
        Authorization: `Bearer ${dropboxAccessToken}`,
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(body),
    });
    await request.log(res, startTime);
  } catch (error) {
    await request.log(error.response, startTime);
    throw error;
  }
  return res.data;
};

const prepareListFolders = async (event, cursor) => {
  const url = `${dropboxRpcEndpoint}2/files/list_folder/continue`;
  const data = await executeDropboxApi(url, { cursor });
  const { has_more: hasMore } = data;
  if (hasMore) {
    const foreignKey = new Date().getTime();
    await messages.create(event, { foreignKey, app: 'dropbox', event: 'changes' });
  }
  return data;
};

const executeChanges = async (event, account) => {
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
    if (hasMore) {
      const foreignKey = new Date().getTime();
      await messages.create(event, { foreignKey, app: 'dropbox', event: 'changes' });
    }
    return entries;
  }
  const { token: cursor, _id } = tokens[0];
  const data = await prepareListFolders(event, cursor);
  const { cursor: newToken, entries } = data;
  await Token.findByIdAndUpdate(_id, { token: newToken });
  return entries;
};

module.exports = async (event) => {
  const data = JSON.parse(event.body);
  const { list_folder: listFolder } = data;
  const { accounts } = listFolder;
  return accounts.reduce(async (lastPromise, account) => {
    const accum = await lastPromise;
    const changes = await executeChanges(event, account);
    return [...accum, changes];
  }, Promise.resolve([]));
};
