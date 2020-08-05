// subscription.js
const mongoose = require('mongoose');

const schemaOptions = {
  timestamps: true,
};
// Set Product Schema
const schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  active: {
    type: Boolean,
  },
  app: {
    type: String,
  },
  event: {
    type: String,
  },
  url: {
    type: String,
  },
}, schemaOptions);
const Subscription = mongoose.model('subscription', schema);

module.exports = Subscription;
