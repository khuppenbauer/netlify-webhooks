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
const request = require('../../services/request');

const url = process.env.GRAPHCMS_API_URL;
const token = process.env.GRAPHCMS_API_TOKEN;
const cdnUrl = process.env.GRAPHCMS_CDN_URL;
const cdnToken = process.env.GRAPHCMS_CDN_TOKEN;
const hasTrails = false;

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

const uploadAssetStream = async (record, uploadUrl, uploadToken) => {
  const { foreignKey, name, mimeType } = record;
  const fileName = `/tmp/${name}`;
  const type = mimeType.startsWith('image') ? 'binary' : 'text';
  const data = await dropboxLib.download(foreignKey, type);
  await fs.promises.writeFile(fileName, data);
  const form = new FormData();
  form.append('fileUpload', fs.createReadStream(fileName));
  const startTime = new Date().getTime();
  const res = await axios({
    method: 'post',
    url: `${uploadUrl}/upload`,
    headers: {
      Authorization: `Bearer ${uploadToken}`,
      ...form.getHeaders(),
    },
    data: form,
  });
  await request.log(res, startTime);
  fs.promises.unlink(fileName);
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
      const startTime = new Date().getTime();
      res = await axios({
        method: 'post',
        url: `${uploadUrl}/upload`,
        headers: {
          Authorization: `Bearer ${uploadToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: `url=${encodeURIComponent(externalUrl)}`,
      });
      await request.log(res, startTime);
    } else {
      res = await uploadAssetStream(record, uploadUrl, uploadToken);
    }
    return res.data;
  }
  return assetObj;
};

const updateAsset = async (asset, record) => {
  const { coords, folder } = record;
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
  if (folder !== '/images' && cdn) {
    return cdn.request(mutation, mutationVariables);
  }
  return graphcms.request(mutation, mutationVariables);
};

const publishAsset = async (asset, record) => {
  const { folder } = record;
  const mutation = await graphcmsMutation.publishAsset();
  const mutationVariables = {
    id: asset,
  };
  if (folder !== '/images' && cdn) {
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
  if (tracks && tracks.length > 0) {
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
  const {
    name,
    path_display,
    folder,
    extension,
    coords,
    sha1,
    source,
  } = record;
  const asset = await uploadAsset(record);
  const { id: assetId, url: assetUrl, handle } = asset;
  let fileUrl;
  if (assetUrl) {
    fileUrl = assetUrl;
  } else {
    fileUrl = `https://media.graphcms.com/${handle}`;
  }
  await File.findByIdAndUpdate(file, { url: fileUrl, status: 'deployed' });
  if (assetId) {
    const { updateAsset: res } = await updateAsset(assetId, record);
    let mutation;
    let mutationVariables;
    if (folder === '/images') {
      if (coords) {
        if (hasTrails) {
          await updateTrail(sha1, coords);
        }
        mutation = await graphcmsMutation.upsertTrackConnectAssets('photos');
        mutationVariables = {
          id: assetId,
        };
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
        mutation = await graphcmsMutation.updateTrack(`${property}Url`);
        mutationVariables = {
          value: fileUrl,
        };
      } else {
        mutation = await graphcmsMutation.upsertTrackConnectAsset(property);
        mutationVariables = {
          id: assetId,
        };
      }
    }
    if (mutation) {
      await updateTrack(assetId, record, mutation, mutationVariables);
    }
    await publishAsset(assetId, record);
    return {
      ...res,
      name,
      path_display,
      url: fileUrl,
      folder,
      extension,
      source,
    };
  }
};
