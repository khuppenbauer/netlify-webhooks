const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Subscription = require('../../models/subscription');

module.exports = async (event, context) => {
  const { id } = event;
  try {
    // Use Product.Model to delete
    await Subscription.findByIdAndRemove(id);
  } catch(err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        msg: err.message
      })
    }
  }
  return {
    statusCode: 204
  }
};
