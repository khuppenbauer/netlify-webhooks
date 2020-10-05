const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const db = require('./database/mongodb');
const Track = require('./models/track');
const messages = require('./methods/messages');

const locationServiceBaseUrl = 'https://eu1.locationiq.com/v1/';
const locationServiceAccessToken = process.env.LOCATION_SERVICE_ACCESS_TOKEN;
const geoLibBaseUrl = process.env.GEOLIB_FUNCTIONS_AP_BASE_URL;

const getGeoLibData = async (data, method) => {
  const res = await axios({
    method: 'post',
    url: `${geoLibBaseUrl}${method}`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(data),
  });
  return res.data;
};

const getLocation = async (loc) => {
  const params = {
    key: locationServiceAccessToken,
    lat: loc[1],
    lon: loc[0],
    format: 'json',
    'accept-language': 'de',
    normalizecity: 1,
  };
  const queryString = Object.keys(params).map((key) => (key) + '=' + params[key]).join('&');
  const res = await axios({
    method: 'get',
    url: `${locationServiceBaseUrl}reverse.php?${queryString}`,
  });
  return res.data;
}

const calculateElevation = async (points) => {
  let totalElevationGain = 0;
  let totalElevationLoss = 0;
  let current;
  let last;
  let diff;
  let point;
  const ele = [];

  for (let i = 0; i < points.length; i++) {
    point = points[i];
    if (point[2]) {
      current = point[2];
      if (last && current > last) {
        diff = current - last;
        totalElevationGain += diff;
      }
      if (last && current < last) {
        diff = last - current;
        totalElevationLoss += diff;
      }
      last = point[2];
      ele.push(point[2]);
    }
  }

  return {
    totalElevationGain: totalElevationGain.toFixed(0),
    totalElevationLoss: totalElevationLoss.toFixed(0),
    elevLow: Math.min(...ele).toFixed(0),
    elevHigh: Math.max(...ele).toFixed(0),
  };
}

const addMetaData = async (event) => {
  const body = JSON.parse(event.body);
  const { track } = body;
  const message = 'add_metadata';
  const data = await Track.findById(track);
  const { coordinates } = data.geoJson.features[0].geometry;
  const points = {
    points: coordinates,
  }
  const start = coordinates[0];
  const end = coordinates[coordinates.length - 1];
  const bounds = await getGeoLibData(points, 'getBounds');
  const distance = await getGeoLibData(points, 'getPathLength');
  const startLocation = await getLocation(start);
  const endLocation = await getLocation(end);
  const elevation = await calculateElevation(coordinates);
  const metaData = {
    distance,
    minCoords: { lat: bounds.minLat.toFixed(2), lon: bounds.minLng.toFixed(2) },
    maxCoords: { lat: bounds.maxLat.toFixed(2), lon: bounds.maxLng.toFixed(2) },
    startCoords: { lat: start[1].toFixed(2), lon: start[0].toFixed(2) },
    endCoords: { lat: end[1].toFixed(2), lon: end[0].toFixed(2) },
    startElevation: start[2] ? start[2].toFixed(0) : 0,
    endElevation: end[2] ? end[2].toFixed(0) : 0,
    startCity: startLocation.address.city,
    startCountry: startLocation.address.country,
    startState: startLocation.address.state,
    endCity: endLocation.address.city,
    endCountry: endLocation.address.country,
    endState: endLocation.address.state,
    ...elevation,
  };
  await Track.findByIdAndUpdate(track, metaData);
  await messages.create(event, { foreignKey: track, app: 'messageQueue', event: message });
  return metaData;
};

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const data = await addMetaData(event);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  }
  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};
