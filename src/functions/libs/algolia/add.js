const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const algoliasearch = require('algoliasearch');
const db = require('../../database/mongodb');
const Feature = require('../../models/feature');

const applicationID = process.env.ALGOLIA_APPLICATION_ID;
const adminAPIKey = process.env.ALGOLIA_ADMIN_API_KEY;
const indexName = 'feature';

module.exports = async (data) => {
  const { feature } = data;
  const record = await Feature.findById(feature);
  const {
    name,
    type,
    source,
    foreignKey,
    city,
    state,
    country,
    meta,
    geoJson,
  } = record;
  const { geometry } = geoJson.features[0];
  const { coordinates, type: geoJsonType } = geometry;
  let geoLoc = {};
  if (geoJsonType === 'Point') {
    geoLoc = { lat: coordinates[1], lng: coordinates[0] };
  } else {
    geoLoc = coordinates.map((coordinate) => ({ lat: coordinate[1], lng: coordinate[0] }));
  }
  const client = algoliasearch(applicationID, adminAPIKey);
  const index = client.initIndex(indexName);
  await index
    .saveObject({
      objectID: feature,
      name,
      type,
      source,
      foreignKey,
      city,
      state,
      country,
      meta,
      _geoloc: geoLoc,
    })
    .then(({ objectID }) => {
      console.log(objectID);
    })
    .catch((err) => {
      console.log(err);
    });
  return true;
};
