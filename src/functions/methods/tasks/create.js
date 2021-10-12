const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Task = require('../../models/task');

/* eslint-disable no-param-reassign */
const headers = (obj) => Object.keys(obj).reduce((object, key) => {
  object[key.split('.').join('_')] = obj[key];
  return object;
}, {});
/* eslint-enable no-param-reassign */

module.exports = async (event, data) => {
  const task = {
    ...data,
    _id: mongoose.Types.ObjectId(),
    path: event.path,
    httpMethod: event.httpMethod,
  };
  let result;
  try {
    result = {
      ...task,
      status: 'pending',
      headers: headers(event.headers),
      queryStringParameters: event.queryStringParameters,
      body: JSON.parse(event.body),
    };
    await Task.create(result);
  } catch (err) {
    const error = {
      ...task,
      status: 'error',
      message: err.message,
    };
    await Task.create(error);
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
