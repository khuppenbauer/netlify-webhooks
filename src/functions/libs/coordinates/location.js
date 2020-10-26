const dotenv = require('dotenv').config();
const axios = require('axios');

const locationServiceBaseUrl = 'https://eu1.locationiq.com/v1/';
const locationServiceAccessToken = process.env.LOCATION_SERVICE_ACCESS_TOKEN;

module.exports = async (lat, lon) => {
  const params = {
    key: locationServiceAccessToken,
    lat,
    lon,
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
};
