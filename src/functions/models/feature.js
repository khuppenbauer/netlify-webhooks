// feature.js
const mongoose = require('mongoose');

const schemaOptions = {
  timestamps: true,
};
// Set Feature Schema
const schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
  },
  type: {
    type: String,
  },
  source: {
    type: String,
  },
  meta: {
    type: Object,
  },
  foreignKey: {
    type: String,
  },
  geoJson: {
    type: Object,
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
  gpxFile: {
    type: String,
  },
  minCoords: {
    type: Object,
  },
  maxCoords: {
    type: Object,
  },
}, schemaOptions);
const Feature = mongoose.model('feature', schema);

module.exports = Feature;
