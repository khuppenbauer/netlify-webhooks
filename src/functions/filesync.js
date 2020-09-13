const dotenv = require('dotenv').config();
const axios = require('axios');
const path = require('path');
const mongoose = require('mongoose');
const db = require('./database/mongodb');
const File = require('./models/file');
const messages = require('./methods/messages');

const uploadFiles = async (id, hashes, filesMetaData, event) => {
  const netlifyBaseUrl = 'https://api.netlify.com/api/v1/';
  const token = process.env.NETLIFY_ACCESS_TOKEN;
  let netlifyFileUploadEndpoint;
  const promises = hashes.map(async (hash) => {
    if (filesMetaData[hash]) {
      const {
        path_display,
        data,
        foreignKey,
        extension,
        track,
      } = filesMetaData[hash];
      netlifyFileUploadEndpoint = `deploys/${id}/files/${path_display}`;
      const base64Data = Buffer.from(data, 'base64');
      const fileData = base64Data.toString('base64') === data ? base64Data : data;
      await axios({
        method: 'put',
        url: `${netlifyBaseUrl}${netlifyFileUploadEndpoint}`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/octet-stream',
        },
        data: fileData,
      });
      const { name } = path.parse(path_display);
      const message = {
        ...event,
        body: JSON.stringify({name, path_display, track}),
      };
      await messages.create(message, { foreignKey, app: 'netlify', event: `deploy_${extension}_file` });
    }
  })
  await Promise.all(promises);
};

const syncFiles = async (filesMetaData, event) => {
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
    await uploadFiles(res.data.id, res.data.required, filesMetaData, event);
  }
  return res.data;
};

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const filesMetaData = JSON.parse(event.body);
    const res = await syncFiles(filesMetaData, event);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(res),
    };
  }
  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};
