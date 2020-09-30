const dotenv = require('dotenv').config();
const messages = require('./methods/messages');

exports.handler = async (event) => {
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
        'X-Content-Type-Options': 'nosniff',
      },
      body: event.queryStringParameters.challenge,
    };
  } if (event.httpMethod === 'POST') {
    const VERIFY_SIGNATURE = process.env.DROPBOX_SIGNATURE;
    const signature = event.headers['x-dropbox-signature'];
    if (VERIFY_SIGNATURE === signature) {
      const foreignKey = event.headers['x-bb-client-request-uuid'].slice(0, 36);
      return messages.create(event, { foreignKey, app: 'dropbox', event: 'changes' });
    }
    return {
      statusCode: 403,
      body: 'Forbidden',
    };
  }
  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};
