// token.js
const mongoose = require('mongoose');

const schemaOptions = {
  timestamps: true,
};
// Set Log Schema
const schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  status: {
    type: Number,
  },
  url: {
    type: String,
  },
  host: {
    type: String,
  },
  path: {
    type: String,
  },
  action: {
    type: String,
  },
  body: {
    type: Object,
  },
  data: {
    type: Object,
  },
  headers: {
    type: Object,
  },
  responseTime: {
    type: Number,
  },
}, schemaOptions);
const Log = mongoose.model('log', schema);

module.exports = Log;
