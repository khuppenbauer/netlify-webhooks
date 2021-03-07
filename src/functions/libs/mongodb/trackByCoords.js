const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Track = require('../../models/track');

module.exports = async (geometry) => {
  const filter = {
    'geoJson.features.0.geometry': {
      $geoIntersects: {
        $geometry: geometry,
      },
    },
  };
  return Track.find(filter);
};
