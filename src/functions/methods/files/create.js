const crypto = require('crypto');
const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const File = require('../../models/file');
const messages = require('../messages');

const createMessage = async (file, data, event) => {
  const res = {};
  const {
    name,
    sha1,
    foreignKey,
    extension,
  } = file;
  res[sha1] = {
    data,
    path_display: `${extension}/${name}`,
    foreignKey,
    extension,
  };
  const message = {
    ...event,
    body: JSON.stringify(res),

  }
  await messages.create(message, { foreignKey, app: 'messagequeue', event: 'save_file' });
}

module.exports = async (data, metaData, event) => {
  const sha1 = crypto
    .createHash('sha1')
    .update(data)
    .digest('hex');
  const size = Buffer.byteLength(data, 'utf8');
  const file = {
    ...metaData,
    sha1,
    size,
  };
  await File.create(
    {
      ...file,
      source: 'messagequeue',
      _id: mongoose.Types.ObjectId(),
    },
  );
  await createMessage(file, data, event);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(file),
  };
};
