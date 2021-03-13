// location.js
const mongoose = require('mongoose');

const schemaOptions = {
  timestamps: true,
};
// Set Location Schema
const schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
  },
}, schemaOptions);
const Location = mongoose.model('location', schema);

module.exports = Location;
