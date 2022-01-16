const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Feature = require('../../models/feature');
const Message = require('../../models/message');
const messages = require('../messages');

module.exports = async (event, id) => {
  const { body } = event;
  const feature = JSON.parse(body);
  const { foreignKey, source, type } = feature;

  try {
    const res = await Feature.findByIdAndUpdate(id, feature);
    const messageObject = {
      ...event,
      body: JSON.stringify(res),
    };
    const messageData = {
      foreignKey,
      app: 'messageQueue',
      event: `update_${source}_${type}_feature`,
    };
    await messages.create(messageObject, messageData);
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
    body: JSON.stringify(feature),
  };
};
