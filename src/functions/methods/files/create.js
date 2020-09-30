const crypto = require('crypto');
const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const File = require('../../models/file');
const filesSync = require('./sync');

module.exports = async (event, metaData, data) => {
  const existing = await File.find({ foreignKey: metaData.foreignKey });
  if (existing.length > 0) {
    await File.findByIdAndUpdate(existing[0]._id, metaData);
  } else {
    await File.create(
      {
        ...metaData,
        _id: mongoose.Types.ObjectId(),
      },
    );
  }
  await filesSync(event, metaData, data);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metaData),
  };
};
