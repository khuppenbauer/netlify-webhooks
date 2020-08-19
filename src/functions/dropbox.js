const dotenv = require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const db = require('./database/mongodb');
const Token = require('./models/token');
const File = require('./models/file');

const saveEntries = async (entries) => {
  entries
    .filter((entry) => entry['.tag'] === 'file')
    .map((entry) => (
      File.create(
        {
          ...entry,
          foreignKey: entry.id,
          _id: mongoose.Types.ObjectId(),
        },
      )
    ));
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

const executeChanges = async (account) => {
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
    await saveEntries(data.entries);
  }
  const promises = tokens.map(async (token) => {
    url = '2/files/list_folder/continue';
    body = {
      cursor: token.token,
    };
    data = await listFolders(url, body);
    await Token.findByIdAndUpdate(token._id, { token: data.cursor });
    await saveEntries(data.entries);
  })
  return Promise.all(promises);
};

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const data = JSON.parse(event.body);
    const { list_folder: listFolder } = data;
    const { accounts } = listFolder;
    const promises = accounts.map(async (account) => {
      const promise = await executeChanges(account);
      return promise;
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
