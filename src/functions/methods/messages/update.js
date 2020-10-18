const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Message = require('../../models/message');
const pusherLib = require('../../libs/pusher');

module.exports = async (event, id) => {
  const { body } = event;
  const message = JSON.parse(body);
  try {
    await Message.findByIdAndUpdate(id, message);
    await pusherLib.trigger('message', message);
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
    body: JSON.stringify(message),
  };
};
