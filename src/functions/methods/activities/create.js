const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Activity = require('../../models/activity');

module.exports = async (event, data) => {
  const { foreignKey } = data;
  const existing = await Activity.find({ foreignKey });
  if (existing.length > 0) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'Activity already exists',
    };
  }
  const activity = {
    ...data,
    _id: mongoose.Types.ObjectId(),
  };
  try {
    await Activity.create(activity);
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
    body: JSON.stringify(activity),
  };
};
