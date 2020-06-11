const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Subscription = require('../../models/subscription');

module.exports = async (event, id) => {
  const { body } = event;
  const subscription = JSON.parse(body);
  try {
    await Subscription.findByIdAndUpdate(id, subscription);
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
    body: JSON.stringify(subscription),
  };
};
