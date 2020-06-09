const messages = require('./methods/messages');

exports.handler = async (event, context) => {
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
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({"hub.challenge":challenge})
        }
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        return {
          statusCode: 403,
          body: 'Forbidden'
        }
      }
    }
  } else if (event.httpMethod === 'POST') {
    context.callbackWaitsForEmptyEventLoop = false;
    const data = JSON.parse(event.body);
    const { object_id, aspect_type, object_type } = data;
    const app = 'strava';
    return messages.create(event, context, {id: object_id, app, event: `${aspect_type}_${object_type}`});
  } else {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }
};
