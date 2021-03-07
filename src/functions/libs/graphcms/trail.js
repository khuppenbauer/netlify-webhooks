const dotenv = require('dotenv').config();
const { GraphQLClient } = require('graphql-request');
const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Feature = require('../../models/feature');
const File = require('../../models/file');
const mongodb = require('../mongodb');
const graphcmsMutation = require('./mutation');
const graphcmsQuery = require('./query');
const graphcmsAsset = require('./asset');

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

const addPhotos = async (foreignKey, geoJson) => {
  const { geometry } = geoJson.features[0];
  const photos = await mongodb.featureByCoords(geometry, 'image');
  if (photos.length > 0) {
    const trailMutation = await graphcmsMutation.updateTrailConnectAssets();
    await photos.reduce(async (lastPromise, photo) => {
      const accum = await lastPromise;
      const { meta: imageMeta } = photo;
      const { pathDisplay } = imageMeta;
      const file = await File.find({ path_display: pathDisplay });
      if (file.length > 0) {
        const { _id, sha1 } = file[0];
        const query = await graphcmsQuery.getAsset();
        const queryVariables = {
          sha1,
        };
        const { asset } = await graphcms.request(query, queryVariables);
        if (asset) {
          const trailMutationVariables = {
            sha1,
            foreignKey,
          };
          await graphcms.request(trailMutation, trailMutationVariables);
        } else {
          await graphcmsAsset({ _id });
        }
      }
      return [...accum];
    }, Promise.resolve([]));
  }
};

module.exports = async (data) => {
  const { feature } = data;
  const record = await Feature.findById(feature);
  const {
    minCoords,
    maxCoords,
    meta,
    geoJson,
    foreignKey,
  } = record;
  const {
    startLatLng,
    endLatLng,
  } = meta;

  const mutation = await graphcmsMutation.upsertTrail();
  const mutationVariables = {
    ...record._doc,
    ...meta,
    startLatLng: {
      latitude: startLatLng[0],
      longitude: startLatLng[1],
    },
    endLatLng: {
      latitude: endLatLng[0],
      longitude: endLatLng[1],
    },
    minCoords: {
      latitude: minCoords.lat,
      longitude: minCoords.lon,
    },
    maxCoords: {
      latitude: maxCoords.lat,
      longitude: maxCoords.lon,
    },
  };
  await graphcms.request(mutation, mutationVariables);
  await addPhotos(foreignKey, geoJson);
};
