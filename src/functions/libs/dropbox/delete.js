const dotenv = require('dotenv').config();
const axios = require('axios');
const request = require('../../services/request');

const dropboxDeleteUrl = 'https://api.dropboxapi.com/2/files/delete_v2';
const dropboxAccessToken = process.env.DROPBOX_ACCESS_TOKEN;

module.exports = async (path) => {
  const startTime = new Date().getTime();
  const args = {
    path,
  };
  const res = await axios({
    method: 'post',
    url: dropboxDeleteUrl,
    headers: {
      Authorization: `Bearer ${dropboxAccessToken}`,
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(args),
  });
  await request.log(res, startTime);
  return res.data;
};
