const dotenv = require('dotenv').config();
const axios = require('axios');
const request = require('../../services/request');

const dropboxDownloadUrl = 'https://content.dropboxapi.com/2/files/download';
const dropboxAccessToken = process.env.DROPBOX_ACCESS_TOKEN;

module.exports = async (id) => {
  const startTime = new Date().getTime();
  const args = {
    path: id,
  };
  const res = await axios({
    method: 'post',
    url: dropboxDownloadUrl,
    headers: {
      Authorization: `Bearer ${dropboxAccessToken}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify(args),
    },
  });
  const { data } = res;
  if (typeof data === 'object') {
    return JSON.stringify(data);
  }
  return data;
};
