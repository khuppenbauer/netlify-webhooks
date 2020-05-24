import mongoose from 'mongoose'
import db from '../mongodb'
import WebHook from '../webHook'

exports.handler = async (event, context) => {
  if (event.httpMethod === 'POST') {
    const webHook = {
      _id: mongoose.Types.ObjectId(),
      provider: 'Netlify',
      status: 'new',
      task: event.queryStringParameters.task,
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
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }
};