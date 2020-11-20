const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Log = require('../../models/log');

module.exports = async (event, data) => {
  const {
    path,
    queryStringParameters,
    headers,
  } = event;
  const { host } = headers;
  const { action } = queryStringParameters;
  const {
    startTime,
    status,
  } = data;
  const log = {
    _id: mongoose.Types.ObjectId(),
    status,
    url: `https://${host}/${path}`,
    host,
    path,
    action,
    responseTime: new Date().getTime() - startTime,
  };

  try {
    await Log.create(log);
  } catch (err) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: err.message,
      }),
    };
  }
  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(log),
  };
};
