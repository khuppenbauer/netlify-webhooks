const dotenv = require('dotenv').config();
const axios = require('axios');

const dropboxDownloadUrl = 'https://content.dropboxapi.com/2/files/download';
const dropboxAccessToken = process.env.DROPBOX_ACCESS_TOKEN;

module.exports = async (id, type) => {
  const args = {
    path: id,
  };
  const headers = {
    Authorization: `Bearer ${dropboxAccessToken}`,
    'Content-Type': 'application/octet-stream',
    'Dropbox-API-Arg': JSON.stringify(args),
  };
  if (type === 'binary') {
    const data = await axios
      .get(dropboxDownloadUrl, {
        responseType: 'arraybuffer',
        headers,
      })
      .then((response) => Buffer.from(response.data, 'binary'));
    return data;
  }
  const res = await axios({
    method: 'post',
    url: dropboxDownloadUrl,
    headers,
  });
  const { data } = res;
  if (typeof data === 'object') {
    return JSON.stringify(data);
  }
  return data;
};
