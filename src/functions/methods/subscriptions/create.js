const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Subscription = require('../../models/subscription');

module.exports = async (event, context) => {
  const data = JSON.parse(event.body);
  const subscription = {...data,
    _id: mongoose.Types.ObjectId(),
  };
  try {
    await Subscription.create(subscription);
  } catch (err) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: err.message
      })
    }
  }
  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(subscription)
  }
};
