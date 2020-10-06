const dotenv = require('dotenv').config();
const axios = require('axios');

const dropboxUploadUrl = 'https://content.dropboxapi.com/2/files/upload';

module.exports = async (data, path) => {
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
      Authorization: `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify(args),
    },
    data,
  });
  return res.data;
};
