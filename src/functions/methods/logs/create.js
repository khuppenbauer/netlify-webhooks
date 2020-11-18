const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Log = require('../../models/log');

module.exports = async (event, data) => {
  const log = {
    ...data,
    _id: mongoose.Types.ObjectId(),
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
