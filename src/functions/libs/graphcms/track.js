const dotenv = require('dotenv').config();
const { GraphQLClient } = require('graphql-request');
const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Track = require('../../models/track');
const graphcmsMutation = require('./mutation');
const graphcmsQuery = require('./query');

const url = process.env.GRAPHCMS_API_URL;
const token = process.env.GRAPHCMS_API_TOKEN;
const cdnUrl = process.env.GRAPHCMS_CDN_URL;
const cdnToken = process.env.GRAPHCMS_CDN_TOKEN;

const graphcms = new GraphQLClient(
  url,
  {
    headers: {
      authorization: `Bearer ${token}`,
    },
  },
);

let cdn;
if (cdnUrl && cdnToken) {
  cdn = new GraphQLClient(
    cdnUrl,
    {
      headers: {
        authorization: `Bearer ${cdnToken}`,
      },
    },
  );
}

const addTrack = async (record) => {
  const {
    minCoords,
    maxCoords,
    startCoords,
    endCoords,
    name,
    _id: foreignKey,
  } = record;
  const query = await graphcmsQuery.getAssets('fileName_starts_with');
  const queryVariables = {
    value: name,
  };
  let res;
  if (cdn) {
    res = await cdn.request(query, queryVariables);
  } else {
    res = await graphcms.request(query, queryVariables);
  }
  const { assets } = res;
  let gpxFileUrl = '';
  let gpxFileSmallUrl = '';
  let geoJsonFileUrl = '';
  let staticImageUrl = '';
  assets.map((asset) => {
    const { folder, extension, handle } = asset;
    if (folder === '/tracks') {
      if (extension === 'gpx') {
        gpxFileUrl = `https://media.graphcms.com/${handle}`;
      }
      if (extension === 'json') {
        geoJsonFileUrl = `https://media.graphcms.com/${handle}`;
      }
    } else if (folder === '/convert/gpx') {
      gpxFileSmallUrl = `https://media.graphcms.com/${handle}`;
    } else if (folder === '/preview') {
      staticImageUrl = `https://media.graphcms.com/${handle}`;
    }
  });

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
    gpxFileUrl,
    gpxFileSmallUrl,
    geoJsonFileUrl,
    staticImageUrl,
    foreignKey,
  };
  return graphcms.request(mutation, mutationVariables);
};

const publishTrack = async (track) => {
  const mutation = await graphcmsMutation.publishTrack();
  const mutationVariables = {
    foreignKey: track,
  };
  return graphcms.request(mutation, mutationVariables);
};

module.exports = async (data, action) => {
  if (action === 'add') {
    const { track } = data;
    const record = await Track.findById(track);
    return addTrack(record);
  }
  if (action === 'publish') {
    const { track } = data;
    return publishTrack(track);
  }
  return null;
};
