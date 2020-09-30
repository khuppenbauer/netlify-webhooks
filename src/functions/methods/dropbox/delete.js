const dotenv = require('dotenv').config();
const axios = require('axios');

const dropboxDeleteUrl = 'https://api.dropboxapi.com/2/files/delete_v2';

module.exports = async (path) => {
  const args = {
    path,
  };
  await axios({
    method: 'post',
    url: dropboxDeleteUrl,
    headers: {
      Authorization: `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(args),
  });
  return {
    statusCode: 204,
    headers: {
      'Content-Type': 'application/json',
    },
  };
};
