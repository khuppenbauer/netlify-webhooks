const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Message = require('../../models/message');

module.exports = async (event, context) => {
  let result;
  try {
    // Use Product.Model to delete
    result = await Message.find();
  } catch(err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        msg: err.message
      })
    }
  }
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  }
};
