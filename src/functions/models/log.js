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
  statusText: {
    type: String,
  },
  url: {
    type: String,
  },
  urlOrigin: {
    type: String,
  },
  urlPathname: {
    type: String,
  },
  urlAction: {
    type: String,
  },
  method: {
    type: String,
  },
  responseTime: {
    type: Number,
  },
  subscription: {
    type: Object,
  },
}, schemaOptions);
const Log = mongoose.model('log', schema);

module.exports = Log;
