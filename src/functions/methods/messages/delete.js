const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Message = require('../../models/message');

module.exports = async (event, context) => {
  const { id } = event;
  try {
    // Use Product.Model to delete
    await Message.findByIdAndRemove(id);
  } catch(err) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        msg: err.message
      })
    }
  }
  return {
    statusCode: 204
  }
};
