const dotenv = require('dotenv').config();
const axios = require('axios');
const { GraphQLClient } = require('graphql-request');
const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const File = require('../../models/file');
const mongodb = require('../mongodb');
const graphcmsMutation = require('./mutation');
const graphcmsQuery = require('./query');

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

const uploadAsset = async (record) => {
  const { externalUrl, sha1 } = record;
  if (externalUrl) {
    const query = await graphcmsQuery.getAsset();
    const queryVariables = {
      sha1,
    };

    const queryRes = await graphcms.request(query, queryVariables);
    const { asset: assetObj } = queryRes;
    if (!assetObj) {
      const res = await axios({
        method: 'post',
        url: `${url}/upload`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: `url=${encodeURIComponent(externalUrl)}`,
      });
      return res.data.id;
    }
    return assetObj.id;
  }
  return false;
};

const updateAsset = async (asset, record) => {
  const { coords } = record;
  const mutation = await graphcmsMutation.updateAsset();

  let mutationVariables = {
    ...record._doc,
    id: asset,
  };
  if (coords) {
    mutationVariables = {
      ...mutationVariables,
      location: {
        latitude: coords.lat,
        longitude: coords.lon,
      },
    };
  }
  return graphcms.request(mutation, mutationVariables);
};

const publishAsset = async (asset) => {
  const mutation = await graphcmsMutation.publishAsset();
  const mutationVariables = {
    id: asset,
  };
  return graphcms.request(mutation, mutationVariables);
};

const updateTrack = async (asset, record, mutation) => {
  const { source, dateTimeOriginal, coords } = record;
  if (source) {
    const { foreignKey } = source;
    if (foreignKey) {
      const mutationVariables = {
        id: asset,
        name: foreignKey,
      };
      return graphcms.request(mutation, mutationVariables);
    }
  }
  let tracks;
  if (dateTimeOriginal) {
    tracks = await mongodb.trackByDate(dateTimeOriginal);
  } else if (coords) {
    const { lat, lon } = coords;
    const geometry = { type: 'Point', coordinates: [lon, lat] };
    tracks = await mongodb.trackByCoords(geometry);
  }
  if (tracks.length > 0) {
    const res = tracks.map((track) => {
      const { name } = track;
      const mutationVariables = {
        id: asset,
        name,
      };
      return graphcms.request(mutation, mutationVariables);
    });
  }
};

const updateTrail = async (sha1, record) => {
  const { coords } = record;
  const { lat, lon } = coords;
  const geometry = { type: 'Point', coordinates: [lon, lat] };
  const features = await mongodb.featureByCoords(geometry, 'segment');
  if (features.length > 0) {
    const mutation = await graphcmsMutation.updateTrailConnectAssets();
    await features.reduce(async (lastPromise, feature) => {
      const accum = await lastPromise;
      const { foreignKey } = feature;
      const mutationVariables = {
        sha1,
        foreignKey,
      };
      await graphcms.request(mutation, mutationVariables);
      return [...accum];
    }, Promise.resolve([]));
  }
};

module.exports = async (data) => {
  const { _id: file } = data;
  const record = await File.findById(file);
  const { folder, extension } = record;
  const asset = await uploadAsset(record);
  if (asset) {
    const { updateAsset: res } = await updateAsset(asset, record);
    let mutation;
    if (folder === '/images') {
      const { sha1 } = res;
      await updateTrail(sha1, record);
      mutation = await graphcmsMutation.upsertTrackConnectAssets('photos');
    } else {
      let property;
      if (folder === '/preview') {
        property = 'staticImage';
      } else if (folder === '/tracks') {
        if (extension === 'gpx') {
          property = 'gpxFile';
        } else if (extension === 'json') {
          property = 'geoJsonFile';
        }
      } else if (folder === '/convert/gpx') {
        property = 'gpxFileSmall';
      }
      mutation = await graphcmsMutation.upsertTrackConnectAsset(property);
    }
    if (mutation) {
      await updateTrack(asset, record, mutation);
    }
    await publishAsset(asset);
    return res;
  }
};
