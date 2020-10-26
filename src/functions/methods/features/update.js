const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Feature = require('../../models/feature');

module.exports = async (event, id) => {
  const { body } = event;
  const feature = JSON.parse(body);
  try {
    await Feature.findByIdAndUpdate(id, feature);
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
    body: JSON.stringify(feature),
  };
};
