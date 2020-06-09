const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Subscription = require('../../models/subscription');

module.exports = async (event, context) => {
  const { id } = event;
  let result;
  try {
    result = await Subscription.findById(id)
  } catch (err) {
    const error = {...data,
      status: 'error',
      message: err.message
    };
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(error)
    }
  }
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(result)
  }
};