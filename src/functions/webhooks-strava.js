const dotenv = require('dotenv').config();
const messages = require('./methods/messages');

exports.handler = async (event) => {
  if (event.httpMethod === 'GET') {
    // Your verify token. Should be a random string.
    const VERIFY_TOKEN = process.env.STRAVA_VERIFY_TOKEN;
    const params = event.queryStringParameters;
    const mode = params['hub.mode'];
    const token = params['hub.verify_token'];
    const challenge = params['hub.challenge'];
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
      // Verifies that the mode and token sent are valid
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        // Responds with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 'hub.challenge': challenge }),
        };
      }
      // Responds with '403 Forbidden' if verify tokens do not match
      return {
        statusCode: 403,
        body: 'Forbidden',
      };
    }
    // Responds with '403 Forbidden' if verify tokens do not match
    return {
      statusCode: 403,
      body: 'Forbidden',
    };
  } if (event.httpMethod === 'POST') {
    const data = JSON.parse(event.body);
    const { object_id: foreignKey, aspect_type: aspectType, object_type: objectType } = data;
    const app = 'strava';
    return messages.create(event, { foreignKey, app, event: `${aspectType}_${objectType}` });
  }
  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};
