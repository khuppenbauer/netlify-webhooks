import mongoose from 'mongoose'
import db from '../mongodb'
import WebHook from '../webHook'

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
      const webHook = {
        _id: mongoose.Types.ObjectId(),
        provider: 'Dropbox',
        status: 'new',
        task: 'FILES_CHANGED',
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
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webHook)
      }
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