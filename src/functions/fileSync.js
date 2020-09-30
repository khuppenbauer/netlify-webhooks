const dotenv = require('dotenv').config();
const files = require('./methods/files');

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    await files.sync();
    return {
      statusCode: 200,
      body: 'Ok',
    };
  }
  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};
