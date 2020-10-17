const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Message = require('../../models/message');

/* eslint-disable no-param-reassign */
const headers = (obj) => Object.keys(obj).reduce((object, key) => {
  object[key.split('.').join('_')] = obj[key];
  return object;
}, {});
/* eslint-enable no-param-reassign */

module.exports = async (event, data) => {
  const message = {
    ...data,
    _id: mongoose.Types.ObjectId(),
    path: event.path,
    httpMethod: event.httpMethod,
  };
  let result;
  try {
    result = {
      ...message,
      status: 'pending',
      headers: headers(event.headers),
      queryStringParameters: event.queryStringParameters,
      body: JSON.parse(event.body),
    };
    await Message.create(result);
  } catch (err) {
    const error = {
      ...message,
      status: 'error',
      message: err.message,
    };
    await Message.create(error);
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(error),
    };
  }
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(result),
  };
};
