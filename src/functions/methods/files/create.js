const crypto = require('crypto');
const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const File = require('../../models/file');
const messages = require('../messages');

const createMessage = async (file, data, event) => {
  const res = {};
  const {
    path_display,
    sha1,
    foreignKey,
    extension,
    track,
  } = file;
  res[sha1] = {
    data,
    path_display,
    foreignKey,
    extension,
  };
  if (track) {
    res[sha1]['track'] = track;
  }
  const message = {
    ...event,
    body: JSON.stringify(res),

  }
  await messages.create(message, { foreignKey, app: 'messagequeue', event: 'save_file' });
}

module.exports = async (data, metaData, event) => {
  await File.create(
    {
      ...metaData,
      source: 'messagequeue',
      _id: mongoose.Types.ObjectId(),
    },
  );
  await createMessage(metaData, data, event);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metaData),
  };
};
