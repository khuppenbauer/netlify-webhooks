const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const File = require('../../models/file');
const dropboxLib = require('../../libs/dropbox');

module.exports = async (data, filePath) => {
  const existingFile = await File.find({
    path_display: filePath,
    status: 'sync',
  });
  if (existingFile.length > 0) {
    await dropboxLib.delete(filePath);
  }
  await dropboxLib.upload(data, filePath);
};
