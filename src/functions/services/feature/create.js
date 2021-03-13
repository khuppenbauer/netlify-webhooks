const crypto = require('crypto');
const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const features = require('../../methods/features');
const coordinatesLib = require('../../libs/coordinates');

const createFeature = async (event, geoJson, type, source) => {
  const { properties, geometry } = geoJson.features[0];
  const { type: geometryType, coordinates } = geometry;
  const {
    name,
  } = properties;
  const foreignKey = crypto
    .createHash('sha1')
    .update(JSON.stringify(geoJson))
    .digest('hex');
  if (geometryType === 'Point') {
    const location = await coordinatesLib.location(coordinates[1], coordinates[0]);
    const { city, state, country } = location;
    const boundsParams = {
      point: {
        latitude: coordinates[1],
        longitude: coordinates[0],
      },
      distance: 100,
    }
    const bounds = await coordinatesLib.geoLib(boundsParams, 'getBoundsOfDistance');
    const feature = {
      name,
      type,
      source,
      foreignKey,
      city,
      state,
      country,
      meta: properties,
      geoJson,
      minCoords: {
        lat: parseFloat(bounds[0].latitude.toFixed(6)),
        lon: parseFloat(bounds[0].longitude.toFixed(6)),
      },
      maxCoords: {
        lat: parseFloat(bounds[1].latitude.toFixed(6)),
        lon: parseFloat(bounds[1].longitude.toFixed(6)),
      },
    };
    return features.create(event, feature);
  }
}

module.exports = async (event, geoJson, type, source) => {
  geoJson.features[0].properties.type = type;
  await createFeature(event, geoJson, type, source);
};
