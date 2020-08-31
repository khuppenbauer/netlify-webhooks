const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Track = require('../../models/track');

module.exports = async (track) => {
  const { foreignKey } = track;
  const existing = await Track.find({ foreignKey });
  if (existing.length > 0) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'Track already exists',
    };
  }
  try {
    await Track.create(track);
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
    body: JSON.stringify(track),
  };
};
