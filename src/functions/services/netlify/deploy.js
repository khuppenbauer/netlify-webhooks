const axios = require('axios');
const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const File = require('../../models/file');
const Message = require('../../models/message');
const messages = require('../../methods/messages');
const filesLib = require('../../libs/files');

const netlifyBaseUrl = 'https://api.netlify.com/api/v1/';
const netlifyDeployEndpoint = `sites/${process.env.NETLIFY_CDN_ID}/deploys`
const token = process.env.NETLIFY_ACCESS_TOKEN;

const createUploadMessage = async (event, message, id, required) => {
  const missingFiles = await File.find(
    {
      sha1: {
        $in: required,
      },
    },
  );
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
    const messageData = {
      foreignKey: path_display,
      app: 'netlify',
      event: message,
    };
    const existing = await Message.find(messageData);
    if (existing.length === 0) {
      await messages.create(messageObject, messageData);
    }
    return [...accum, {}];
  }, Promise.resolve([]));
}

const createDeployment = async (event, deployMessage, uploadMessage) => {
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
    await createUploadMessage(event, deployMessage, id, required);
  } else {
    const data = JSON.parse(event.body);
    await filesLib.message(event, uploadMessage, data);
  }
  return res.data;
};

module.exports = async (event, deployMessage, uploadMessage) => {
  await createDeployment(event, deployMessage, uploadMessage);
};
