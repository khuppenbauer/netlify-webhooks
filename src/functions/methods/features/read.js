const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Feature = require('../../models/feature');

module.exports = async (event, id) => {
  let result;
  try {
    result = await Feature.findById(id);
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
