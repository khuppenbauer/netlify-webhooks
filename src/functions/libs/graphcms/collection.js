const dotenv = require('dotenv').config();
const axios = require('axios');
const { GraphQLClient } = require('graphql-request');
const geolib = require('geolib');
const mapboxLib = require('../mapbox');
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

const getUser = async (id) => {
  const query = await graphcmsQuery.getUser();
  const queryVariables = {
    id,
  };
  const { user } = await graphcms.request(query, queryVariables);
  return user;
};

const uploadAsset = async (imageUrl) => {
  const res = await axios({
    method: 'post',
    url: `${url}/upload`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: `url=${encodeURIComponent(imageUrl)}`,
  });
  const { data } = res;
  return data;
};

const updateAsset = async (id, fileName) => {
  const mutation = await graphcmsMutation.updateAsset();
  const mutationVariables = {
    id,
    fileName,
  };
  return graphcms.request(mutation, mutationVariables);
};

const publishAsset = async (id) => {
  const mutation = await graphcmsMutation.publishAsset();
  const mutationVariables = {
    id,
  };
  return graphcms.request(mutation, mutationVariables);
};

const deleteAsset = async (id) => {
  const mutation = await graphcmsMutation.deleteAsset();
  const mutationVariables = {
    id,
  };
  return graphcms.request(mutation, mutationVariables);
};

const connectAsset = async (collection, asset) => {
  const mutation = await graphcmsMutation.updateCollectionConnectAsset('staticImage');
  const mutationVariables = {
    collection,
    asset,
  };
  return graphcms.request(mutation, mutationVariables);
};

const getCollection = async (id) => {
  const query = await graphcmsQuery.getCollection();
  const queryVariables = {
    id,
  };
  const { collection } = await graphcms.request(query, queryVariables);
  return collection;
};

const updateCollection = async (id, geoJson, minCoords, maxCoords) => {
  const mutation = await graphcmsMutation.updateCollection();
  const mutationVariables = {
    id,
    geoJson,
    minCoords,
    maxCoords,
  };
  return graphcms.request(mutation, mutationVariables);
};

const publishCollection = async (id) => {
  const mutation = await graphcmsMutation.publishCollection();
  const mutationVariables = {
    id,
  };
  return graphcms.request(mutation, mutationVariables);
};

const addAssetToCollection = async (id, name, coords, staticImage) => {
  if (staticImage) {
    const { id: existingStaticImage } = staticImage;
    await deleteAsset(existingStaticImage);
  }
  const imageUrl = await mapboxLib.polygon(coords);
  const asset = await uploadAsset(imageUrl);
  const { id: assetId } = asset;
  await updateAsset(assetId, name);
  await publishAsset(assetId);
  await connectAsset(id, assetId);
};

const addGeoDataToCollection = async (id, features, coords) => {
  const geoJson = {
    type: 'FeatureCollection',
    features,
  };
  const bounds = geolib.getBounds(coords);
  const {
    minLat, minLng, maxLat, maxLng,
  } = bounds;
  const minCoords = {
    latitude: minLat,
    longitude: minLng,
  };
  const maxCoords = {
    latitude: maxLat,
    longitude: maxLng,
  };
  await updateCollection(id, geoJson, minCoords, maxCoords);
};

const parseTracks = async (tracks) => {
  const features = [];
  const coords = [];
  tracks.reduce((acc, track) => {
    const {
      id, geoJson: json, minCoords, maxCoords, color,
      distance, totalElevationGain, totalElevationLoss,
    } = track;
    const featureItem = json.features[0];
    featureItem.properties = {
      ...featureItem.properties,
      id,
      distance,
      totalElevationGain,
      totalElevationLoss,
    };
    if (color) {
      const { hex } = color;
      featureItem.properties.color = hex;
    }
    delete featureItem.properties.coordTimes;
    features.push(featureItem);
    coords.push(minCoords);
    coords.push(maxCoords);
    return acc;
  }, []);
  return {
    features,
    coords,
  };
};

module.exports = async (data) => {
  const { data: item } = data;
  const { id, publishedBy } = item;
  if (!publishedBy) {
    return null;
  }
  const { id: userId } = publishedBy;
  const user = await getUser(userId);
  const { kind } = user;
  if (kind !== 'MEMBER') {
    return null;
  }

  const collection = await getCollection(id);
  const { tracks, name, staticImage } = collection;
  const { features, coords } = await parseTracks(tracks);

  await addGeoDataToCollection(id, features, coords);
  await addAssetToCollection(id, name, coords, staticImage);
  await publishCollection(id);
  return data;
};
