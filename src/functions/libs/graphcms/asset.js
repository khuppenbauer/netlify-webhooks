const dotenv = require('dotenv').config();
const axios = require('axios');
const { GraphQLClient } = require('graphql-request');
const mongoose = require('mongoose');
const fs = require('fs');
const fetch = require('node-fetch');
const FormData = require('form-data');
const db = require('../../database/mongodb');
const File = require('../../models/file');
const mongodb = require('../mongodb');
const dropboxLib = require('../dropbox');
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

const uploadAssetStream = async (record) => {
  const { foreignKey, name } = record;
  const data = await dropboxLib.download(foreignKey);
  await fs.promises.writeFile(name, data);
  const form = new FormData();
  form.append('fileUpload', fs.createReadStream(name));
  const res = axios({
    method: 'post',
    url: `${cdnUrl}/upload`,
    headers: {
      Authorization: `Bearer ${cdnToken}`,
      ...form.getHeaders(),
    },
    data: form,
  });
  fs.promises.unlink(name);
  return res;
};

const uploadAsset = async (record) => {
  const { externalUrl, sha1, folder } = record;
  const query = await graphcmsQuery.getAsset();
  const queryVariables = {
    sha1,
  };
  let uploadUrl;
  let uploadToken;
  let queryRes;
  let res;
  if (folder !== '/images' && cdn) {
    uploadUrl = cdnUrl;
    uploadToken = cdnToken;
    queryRes = await cdn.request(query, queryVariables);
  } else {
    uploadUrl = url;
    uploadToken = token;
    queryRes = await graphcms.request(query, queryVariables);
  }
  const { asset: assetObj } = queryRes;
  if (!assetObj) {
    if (externalUrl) {
      res = await axios({
        method: 'post',
        url: `${uploadUrl}/upload`,
        headers: {
          Authorization: `Bearer ${uploadToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: `url=${encodeURIComponent(externalUrl)}`,
      });
    } else {
      res = await uploadAssetStream(record);
    }
    return res.data;
  }
  return assetObj;
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
  if (cdn) {
    return cdn.request(mutation, mutationVariables);
  }
  return graphcms.request(mutation, mutationVariables);
};

const publishAsset = async (asset) => {
  const mutation = await graphcmsMutation.publishAsset();
  const mutationVariables = {
    id: asset,
  };
  if (cdn) {
    return cdn.request(mutation, mutationVariables);
  }
  return graphcms.request(mutation, mutationVariables);
};

const updateTrack = async (asset, record, mutation, variable) => {
  const { source, dateTimeOriginal, coords } = record;
  if (source) {
    const { foreignKey } = source;
    if (foreignKey) {
      const mutationVariables = {
        ...variable,
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

const updateTrail = async (sha1, coords) => {
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
  const { folder, extension, coords, sha1 } = record;
  const asset = await uploadAsset(record);
  const { id: assetId, url: assetUrl, handle } = asset;
  if (assetId) {
    const { updateAsset: res } = await updateAsset(assetId, record);
    let mutation;
    let mutationVariables;
    if (folder === '/images') {
      if (coords) {
        await updateTrail(sha1, coords);
        mutation = await graphcmsMutation.upsertTrackConnectAssets('photos');
      }
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
      if (cdn) {
        let value;
        if (assetUrl) {
          value = assetUrl;
        } else {
          value = `https://media.graphcms.com/${handle}`;
        }
        mutation = await graphcmsMutation.updateTrack(`${property}Url`);
        mutationVariables = {
          value,
        };
      } else {
        mutation = await graphcmsMutation.upsertTrackConnectAsset(property);
        mutationVariables = {
          id: asset,
        };
      }
    }
    if (mutation) {
      await updateTrack(assetId, record, mutation, mutationVariables);
    }
    await publishAsset(assetId);
    return res;
  }
};
