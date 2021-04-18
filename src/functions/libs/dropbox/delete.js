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
  let res;
  try {
    res = await axios({
      method: 'post',
      url: dropboxDeleteUrl,
      headers: {
        Authorization: `Bearer ${dropboxAccessToken}`,
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(args),
    });
    await request.log(res, startTime);
  } catch (error) {
    await request.log(error.response, startTime);
    throw error;
  }
  return res.data;
};
