const dotenv = require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Location = require('../../models/location');
const request = require('../../services/request');

const locationServiceBaseUrl = 'https://eu1.locationiq.com/v1/';
const locationServiceAccessToken = process.env.LOCATION_SERVICE_ACCESS_TOKEN;

const getLocation = async (lat, lon) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const startTime = new Date().getTime();
  const params = {
    key: locationServiceAccessToken,
    lat,
    lon,
    format: 'json',
    'accept-language': 'de',
    normalizecity: 1,
  };
  const queryString = Object.keys(params).map((key) => (key) + '=' + params[key]).join('&');

  let res;
  try {
    res = await axios({
      method: 'get',
      url: `${locationServiceBaseUrl}reverse.php?${queryString}`,
    });
    await request.log(res, startTime);
  } catch (error) {
    await request.log(error.response, startTime);
    throw error;
  }
  return res.data;
};

module.exports = async (lat, lon) => {
  const locations = await Location.find({ latitude: lat, longitude: lon });
  let location;
  if (locations.length > 0) {
    const { city, state, country } = locations[0];
    location = {
      city,
      state,
      country,
    };
  } else {
    const { address } = await getLocation(lat, lon);
    const { city, state, country } = address;
    location = {
      _id: mongoose.Types.ObjectId(),
      latitude: lat,
      longitude: lon,
      city,
      state,
      country,
    };
    await Location.create(location);
  }
  return location;
};
