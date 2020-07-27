// activity.js
const mongoose = require('mongoose');

const schemaOptions = {
  timestamps: true,
};
// Set Photo Schema
const schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  activity: {
    type: String,
  },
  foreignKey: {
    type: String,
  },
  url: {
    type: String,
  },
  shootingDate: {
    type: Date,
  },

}, schemaOptions);
const Photo = mongoose.model('photo', schema);

module.exports = Photo;
