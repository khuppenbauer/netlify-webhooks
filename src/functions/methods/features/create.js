const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Feature = require('../../models/feature');

module.exports = async (data) => {
  const { foreignKey, source } = data;
  const existing = await Feature.find({ foreignKey, source });
  if (existing.length > 0) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'Feature already exists',
    };
  }
  const feature = {
    ...data,
    _id: mongoose.Types.ObjectId(),
  };
  try {
    await Feature.create(feature);
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
    body: JSON.stringify(feature),
  };
};
