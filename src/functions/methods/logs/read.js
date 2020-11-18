const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Log = require('../../models/log');

module.exports = async (event, id) => {
  let result;
  try {
    result = await Log.findById(id);
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
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(result),
  };
};
