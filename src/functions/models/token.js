// token.js
const mongoose = require('mongoose');

const schemaOptions = {
  timestamps: true,
};
// Set Token Schema
const schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  app: {
    type: String,
  },
  account: {
    type: String,
  },
  token: {
    type: String,
  },
}, schemaOptions);
const Token = mongoose.model('token', schema);

module.exports = Token;
