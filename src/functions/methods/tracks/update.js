const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Track = require('../../models/track');

module.exports = async (event, id) => {
  const { body } = event;
  const track = JSON.parse(body);
  try {
    await Track.findByIdAndUpdate(id, track);
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
    body: JSON.stringify(track),
  };
};
