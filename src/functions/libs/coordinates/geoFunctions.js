const dotenv = require('dotenv').config();
const axios = require('axios');

const geoFunctionsBaseUrl = process.env.GEOFUNCTIONS_FUNCTIONS_AP_BASE_URL;

module.exports = async (data, method) => {
  const res = await axios({
    method: 'post',
    url: `${geoFunctionsBaseUrl}${method}`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(data),
  });
  return res.data;
};
