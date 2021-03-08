// activity.js
const mongoose = require('mongoose');

const schemaOptions = {
  timestamps: true,
};
// Set Activity Schema
const schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  athlete: {
    type: Object,
  },
  average_speed: {
    type: Number,
  },
  distance: {
    type: Number,
  },
  elapsed_time: {
    type: Number,
  },
  elev_high: {
    type: Number,
  },
  elev_low: {
    type: Number,
  },
  end_latlng: {
    type: Object,
  },
  foreignKey: {
    type: Number,
  },
  gpxFile: {
    type: String,
  },
  max_speed: {
    type: Number,
  },
  moving_time: {
    type: Number,
  },
  name: {
    type: String,
  },
  photos: {
    type: Object,
  },
  private: {
    type: Boolean,
  },
  segment_efforts: {
    type: Object,
  },
  start_date: {
    type: Date,
  },
  start_latlng: {
    type: Object,
  },
  type: {
    type: String,
  },
  total_elevation_gain: {
    type: Number,
  },
  visibility: {
    type: String,
  },
  status: {
    type: String,
  },
}, schemaOptions);
const Activity = mongoose.model('activity', schema);

module.exports = Activity;
