const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Feature = require('../../models/feature');
const Message = require('../../models/message');
const messages = require('../messages');

module.exports = async (event, data) => {
  const { foreignKey, source, type } = data;
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
  const id = mongoose.Types.ObjectId();
  const feature = {
    ...data,
    _id: id,
  };
  try {
    await Feature.create(feature);
    const messageObject = {
      ...event,
      body: JSON.stringify({ _id: id }),
    };
    const messageData = {
      foreignKey,
      app: 'messageQueue',
      event: `create_${source}_${type}_feature`,
    };
    const existingMessage = await Message.find(messageData);
    if (existingMessage.length === 0) {
      await messages.create(messageObject, messageData);
    }
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
