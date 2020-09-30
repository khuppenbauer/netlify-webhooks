const axios = require('axios');
const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const File = require('../../models/file');

const netlifyBaseUrl = 'https://api.netlify.com/api/v1/';
const netlifyDeployEndpoint = `sites/${process.env.NETLIFY_CDN_ID}/deploys`
const token = process.env.NETLIFY_ACCESS_TOKEN;

const uploadFiles = async (id, sha1, metaData, data) => {
  const {
    path_display: pathDisplay,
  } = metaData;
  const netlifyFileUploadEndpoint = `deploys/${id}/files/${pathDisplay}`;
  const base64Data = Buffer.from(data, 'base64');
  const fileData = base64Data.toString('base64') === data ? base64Data : data;
  return axios({
    method: 'put',
    url: `${netlifyBaseUrl}${netlifyFileUploadEndpoint}`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
    },
    data: fileData,
  });
};

const syncFiles = async (event, metaData, data) => {
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
    await uploadFiles(res.data.id, res.data.required, metaData, data);
  }
  return res.data;
};

module.exports = async (event, metaData, data) => {
  const res = await syncFiles(event, metaData, data);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metaData),
  };
};
