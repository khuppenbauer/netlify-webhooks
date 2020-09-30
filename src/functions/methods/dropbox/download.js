const dotenv = require('dotenv').config();
const axios = require('axios');

const dropboxDownloadUrl = 'https://content.dropboxapi.com/2/files/download';
const dropboxAccessToken = process.env.DROPBOX_ACCESS_TOKEN;

module.exports = async (id) => {
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
  if (typeof res.data === 'object') {
    return JSON.stringify(res.data);
  }
  return res.data;
};
