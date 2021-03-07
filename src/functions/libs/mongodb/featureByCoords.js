const turf = require('@turf/turf');
const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Feature = require('../../models/feature');

module.exports = async (geometry, type) => {
  const buffered = turf.buffer(geometry, 25, { units: 'meters' });
  const options = { precision: 6, coordinates: 2 };
  const polygon = turf.truncate(buffered, options);
  const filter = {
    type,
    'geoJson.features.0.geometry': {
      $geoIntersects: {
        $geometry: polygon.geometry,
      },
    },
  };
  return Feature.find(filter);
};
