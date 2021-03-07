const dotenv = require('dotenv').config();
const { GraphQLClient } = require('graphql-request');
const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Track = require('../../models/track');
const graphcmsMutation = require('./mutation');

const url = process.env.GRAPHCMS_API_URL;
const token = process.env.GRAPHCMS_API_TOKEN;

const graphcms = new GraphQLClient(
  url,
  {
    headers: {
      authorization: `Bearer ${token}`,
    },
  },
);

module.exports = async (data) => {
  const { track } = data;
  const record = await Track.findById(track);
  const {
    minCoords,
    maxCoords,
    startCoords,
    endCoords,
  } = record;

  const mutation = await graphcmsMutation.upsertTrack();
  const mutationVariables = {
    ...record._doc,
    minCoords: {
      latitude: minCoords.lat,
      longitude: minCoords.lon,
    },
    maxCoords: {
      latitude: maxCoords.lat,
      longitude: maxCoords.lon,
    },
    startCoords: {
      latitude: startCoords.lat,
      longitude: startCoords.lon,
    },
    endCoords: {
      latitude: endCoords.lat,
      longitude: endCoords.lon,
    },
  };

  return graphcms.request(mutation, mutationVariables);
};
