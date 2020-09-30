const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Activity = require('../../models/activity');

module.exports = async (activity, id) => {
  try {
    await Activity.findByIdAndUpdate(id, activity);
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
    body: JSON.stringify(activity),
  };
};
