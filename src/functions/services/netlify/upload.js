const dotenv = require('dotenv').config();
const axios = require('axios');
const File = require('../../models/file');
const filesLib = require('../../libs/files');
const dropboxLib = require('../../libs/dropbox');
const request = require('../request');

const netlifyBaseUrl = 'https://api.netlify.com/api/v1/';
const token = process.env.NETLIFY_ACCESS_TOKEN;

const uploadFiles = async (id, sha1, path_display, data) => {
  const netlifyFileUploadEndpoint = `deploys/${id}/files/${path_display}`;
  const startTime = new Date().getTime();
  let res;
  try {
    res = await axios({
      method: 'put',
      url: `${netlifyBaseUrl}${netlifyFileUploadEndpoint}`,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
      },
      data,
    });
    await request.log(res, startTime);
  } catch (error) {
    await request.log(error.response, startTime);
    throw error;
  }
  return res;
};

module.exports = async (event, message) => {
  const data = JSON.parse(event.body);
  const {
    id,
    sha1,
    path_display,
    externalUrl,
    foreignKey,
  } = data;
  let fileData;
  if (externalUrl) {
    fileData = await filesLib.data(externalUrl, 'string');
  } else {
    fileData = await dropboxLib.download(foreignKey);
  }
  const res = await uploadFiles(id, sha1, path_display, fileData);
  if (res.status === 200) {
    await File.updateOne({ path_display }, { status: 'deployed' });
    await filesLib.message(event, message, data);
  }
};
