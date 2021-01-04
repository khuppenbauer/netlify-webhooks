// token.js
const mongoose = require('mongoose');

const schemaOptions = {
  timestamps: true,
};
// Set file Schema
const schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
  },
  path_lower: {
    type: String,
  },
  path_display: {
    type: String,
  },
  folder: {
    type: String,
  },
  foreignKey: {
    type: String,
  },
  client_modified: {
    type: Date,
  },
  server_modified: {
    type: Date,
  },
  rev: {
    type: String,
  },
  size: {
    type: Number,
  },
  is_downloadable: {
    type: Boolean,
  },
  content_hash: {
    type: String,
  },
  sha1: {
    type: String,
  },
  mimeType: {
    type: String,
  },
  extension: {
    type: String,
  },
  source: {
    type: Object,
  },
  externalUrl: {
    type: String,
  },
  dateTimeOriginal: {
    type: Date,
  },
  imageWidth: {
    type: Number,
  },
  imageHeight: {
    type: Number,
  },
  status: {
    type: String,
  },
  coords: {
    type: Object,
  },
  url: {
    type: String,
  },
}, schemaOptions);
const File = mongoose.model('file', schema);

module.exports = File;
