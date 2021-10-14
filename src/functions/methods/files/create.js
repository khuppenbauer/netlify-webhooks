const mongoose = require('mongoose');
const dayjs = require('dayjs');
const db = require('../../database/mongodb');
const File = require('../../models/file');
const Message = require('../../models/message');
const messages = require('../messages');
const tasks = require('../tasks');

module.exports = async (event, metaData, message) => {
  const existing = await File.find({ path_display: metaData.path_display });
  const id = (existing.length === 0) ? mongoose.Types.ObjectId() : existing[0]._id;

  let res;
  if (existing.length > 0) {
    res = await File.findByIdAndUpdate(id, metaData);
  } else {
    res = await File.create(
      {
        status: 'new',
        _id: id,
        ...metaData,
      },
    );
  }
  if (message) {
    const messageObject = {
      ...event,
      body: JSON.stringify({
        ...res._doc,
        ...metaData,
      }),
    };
    const messageData = {
      foreignKey: metaData.path_display,
      app: 'messageQueue',
      event: message,
    };
    const existingMessage = await Message.find(messageData);
    if (existingMessage.length === 0) {
      await messages.create(messageObject, messageData);
      await tasks.create(messageObject, {
        foreignKey: metaData.path_display,
        app: 'messageQueue',
        event: 'geocoding_file',
        executionTime: dayjs().add(3, 'minute').format(),
      });
    }
  }
};
