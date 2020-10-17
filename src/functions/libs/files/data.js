const dotenv = require('dotenv').config();
const axios = require('axios');

module.exports = async (url, type) => {
  const data = await axios
    .get(url, {
      responseType: 'arraybuffer',
    })
    .then((response) => Buffer.from(response.data, 'binary'));
  if (type === 'binary') {
    return data;
  }
  const base64 = data.toString('base64');
  return Buffer.from(base64, 'base64');
};
