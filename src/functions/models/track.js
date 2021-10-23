// track.js
const mongoose = require('mongoose');

const schemaOptions = {
  timestamps: true,
};
// Set Track Schema
const schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
  },
  date: {
    type: Date,
  },
  foreignKey: {
    type: String,
  },
  type: {
    type: String,
  },
  active: {
    type: Boolean,
  },
  author: {
    type: String,
  },
  startCoords: {
    type: Object,
  },
  endCoords: {
    type: Object,
  },
  minCoords: {
    type: Object,
  },
  maxCoords: {
    type: Object,
  },
  distance: {
    type: Number,
  },
  elapsedTime: {
    type: Number,
  },
  totalElevationGain: {
    type: Number,
  },
  totalElevationLoss: {
    type: Number,
  },
  startElevation: {
    type: Number,
  },
  endElevation: {
    type: Number,
  },
  elevLow: {
    type: Number,
  },
  elevHigh: {
    type: Number,
  },
  startCity: {
    type: String,
  },
  startState: {
    type: String,
  },
  startCountry: {
    type: String,
  },
  endCity: {
    type: String,
  },
  endState: {
    type: String,
  },
  endCountry: {
    type: String,
  },
  gpxFile: {
    type: String,
  },
  gpxFileUrl: {
    type: String,
  },
  gpxFileSmall: {
    type: String,
  },
  gpxFileSmallUrl: {
    type: String,
  },
  geoJsonFile: {
    type: String,
  },
  geoJsonFileUrl: {
    type: String,
  },
  overviewImage: {
    type: String,
  },
  overviewImageUrl: {
    type: String,
  },
  previewImage: {
    type: String,
  },
  previewImageUrl: {
    type: String,
  },
  geoJson: {
    type: Object,
  },
  visualization: {
    type: String,
  },
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
}, schemaOptions);
const Track = mongoose.model('track', schema);

module.exports = Track;
