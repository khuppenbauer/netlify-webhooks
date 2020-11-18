const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Log = require('../../models/log');

module.exports = async (event, id) => {
  const { body } = event;
  const log = JSON.parse(body);
  try {
    await Log.findByIdAndUpdate(id, log);
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
    body: JSON.stringify(log),
  };
};
