const dotenv = require('dotenv').config();
const axios = require('axios');
const request = require('../../services/request');

const dropboxUploadUrl = 'https://content.dropboxapi.com/2/files/upload';
const dropboxAccessToken = process.env.DROPBOX_ACCESS_TOKEN;

module.exports = async (data, path) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const startTime = new Date().getTime();
  const args = {
    path,
    mode: 'add',
    autorename: true,
    mute: false,
    strict_conflict: false,
  };
  const res = await axios({
    method: 'post',
    url: dropboxUploadUrl,
    headers: {
      Authorization: `Bearer ${dropboxAccessToken}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify(args),
    },
    data,
  });
  await request.log(res, startTime);
  return res.data;
};
