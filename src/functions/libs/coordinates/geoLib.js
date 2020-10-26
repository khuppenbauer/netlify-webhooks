const dotenv = require('dotenv').config();
const axios = require('axios');

const geoLibBaseUrl = process.env.GEOLIB_FUNCTIONS_AP_BASE_URL;

module.exports = async (data, method) => {
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
