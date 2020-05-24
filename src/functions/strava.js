import mongoose from 'mongoose'
import db from '../mongodb'
import WebHook from '../webHook'

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
    const webHook = {
      _id: mongoose.Types.ObjectId(),
      provider: 'Strava',
      status: 'new',
      task: 'STRAVA_ACTIVITY_CREATED',
      path: event.path,
      httpMethod: event.httpMethod,
      headers: event.headers,
      queryStringParameters: event.queryStringParameters,
      body: JSON.parse(event.body)
    };
    console.log(webHook);

    // Use WebHook to create a new record
    await WebHook.create(webHook);
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webHook)
    }
  } else {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }
};