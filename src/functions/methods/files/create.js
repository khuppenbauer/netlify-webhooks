const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const File = require('../../models/file');
const messages = require('../messages');

module.exports = async (event, metaData, message) => {
  const existing = await File.find({ path_display: metaData.path_display });
  const id = (existing.length === 0) ? mongoose.Types.ObjectId() : existing[0]._id;

  if (existing.length > 0) {
    await File.findByIdAndUpdate(id, metaData);
  } else {
    await File.create(
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
      body: JSON.stringify(metaData),
    };
    await messages.create(messageObject, { foreignKey: metaData.path_display, app: 'messageQueue', event: message });
  }
};
