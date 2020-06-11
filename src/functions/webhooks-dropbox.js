const messages = require('./methods/messages');
const dotenv = require('dotenv').config()

exports.handler = async (event, context) => {
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
        'X-Content-Type-Options': 'nosniff'
      },
      body: event.queryStringParameters.challenge
    }
  } else if (event.httpMethod === 'POST') {
    const VERIFY_SIGNATURE = process.env.DROPBOX_SIGNATURE;
    const signature = event.headers['x-dropbox-signature'];
    if (VERIFY_SIGNATURE === signature) {
      const id = event.headers['x-bb-client-request-uuid'];
      const app = 'dropbox';
      return messages.create(event, context, {id, app, event: 'changes'});
    } else {
      return {
        statusCode: 403,
        body: 'Forbidden'
      }
    }
  } else {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }
};
