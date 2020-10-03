const axios = require('axios');
const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const File = require('../../models/file');
const dropbox = require('../dropbox');

const netlifyBaseUrl = 'https://api.netlify.com/api/v1/';
const netlifyDeployEndpoint = `sites/${process.env.NETLIFY_CDN_ID}/deploys`
const token = process.env.NETLIFY_ACCESS_TOKEN;

const uploadFiles = async (id, sha1, pathDisplay, data) => {
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

const syncFiles = async () => {
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
  if (res.data.required) {
    const missingFiles = await File.find(
      {
        sha1: {
          $in: res.data.required,
        },
      },
    );
    await missingFiles.reduce(async (lastPromise, item) => {
      const accum = await lastPromise;
      const { foreignKey, sha1, path_display: pathDisplay } = item;
      const data = await dropbox.download(foreignKey);
      await uploadFiles(res.data.id, sha1, pathDisplay, data);
      return [...accum, {}];
    }, Promise.resolve([]));
  }
  return res.data;
};

module.exports = async (metaData) => {
  await syncFiles();
  return {
    statusCode: 200,
    body: 'Ok',
  };
};
