const dotenv = require('dotenv').config();
const messages = require('./methods/messages');
const logs = require('./methods/logs');

exports.handler = async (event) => {
  const startTime = new Date().getTime();
  if (event.httpMethod === 'GET') {
    await logs.create(event, { startTime, status: 200 });
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
      const foreignKey = event.headers['x-nf-request-id'];
      await logs.create(event, { startTime, status: 200 });
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
