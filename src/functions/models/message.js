// message.js
const mongoose = require('mongoose');

const schemaOptions = {
  timestamps: true,
};
// Set Product Schema
const schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  app: {
    type: String,
  },
  event: {
    type: String,
  },
  foreignKey: {
    type: String,
  },
  status: {
    type: String,
  },
  statusText: {
    type: String,
  },
  message: {
    type: Object,
  },
  path: {
    type: String,
  },
  httpMethod: {
    type: String,
  },
  headers: {
    type: Object,
  },
  queryStringParameters: {
    type: Object,
  },
  body: {
    type: Object,
  },

}, schemaOptions);
const Message = mongoose.model('message', schema);

module.exports = Message;
