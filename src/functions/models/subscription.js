// subscription.js
const mongoose = require('mongoose');

const schemaOptions = {
  timestamps: true,
};
// Set Product Schema
const schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  app: {
    type: String
  },
  event: {
    type: String
  },
  url: {
    type: String
  }
}, schemaOptions),
Subscription = mongoose.model('subscription', schema);

module.exports = Subscription;
