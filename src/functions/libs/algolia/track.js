const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const algoliasearch = require('algoliasearch');
const db = require('../../database/mongodb');
const Track = require('../../models/track');

const applicationID = process.env.ALGOLIA_APPLICATION_ID;
const adminAPIKey = process.env.ALGOLIA_ADMIN_API_KEY;
const indexName = 'tracks';

module.exports = async (data) => {
  const { track } = data;
  const record = await Track.findById(track);
  const {
    name,
    date,
    distance,
    totalElevationGain,
    totalElevationLoss,
    elevLow,
    elevHigh,
    startElevation,
    endElevation,
    startCity,
    startCountry,
    startState,
    endCity,
    endState,
    endCountry,
    staticImageUrl,
    geoJson,
  } = record;
  const { geometry } = geoJson.features[0];
  const { coordinates, type: geoJsonType } = geometry;
  const geoLoc = coordinates.map((coordinate) => ({ lat: coordinate[1], lng: coordinate[0] }));
  const client = algoliasearch(applicationID, adminAPIKey);
  const index = client.initIndex(indexName);
  const object = {
    objectID: track,
    name,
    date: new Date(date).getTime() / 1000,
    distance,
    totalElevationGain,
    totalElevationLoss,
    elevLow,
    elevHigh,
    startElevation,
    endElevation,
    startCity,
    startCountry,
    startState,
    endCity,
    endState,
    endCountry,
    staticImageUrl,
    _geoloc: geoLoc,
  };
  let hierarchicalCategories = {};
  if (startCity && startState && startCountry && endCity && endCountry && endState) {
    hierarchicalCategories = {
      'hierarchicalCategories.lvl0': [
        startCountry,
        endCountry,
      ],
      'hierarchicalCategories.lvl1': [
        `${startCountry} > ${startState}`,
        `${endCountry} > ${endState}`,
      ],
      'hierarchicalCategories.lvl2': [
        `${startCountry} > ${startState} > ${startCity}`,
        `${endCountry} > ${endState} > ${endCity}`,
      ],
    };
  }
  await index
    .saveObject({
      ...object,
      ...hierarchicalCategories,
    })
    .then(({ objectID }) => {
      console.log(objectID);
    })
    .catch((err) => {
      console.log(err);
    });
  return true;
};
