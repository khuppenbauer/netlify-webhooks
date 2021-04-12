const dotenv = require('dotenv').config();
const axios = require('axios');
const request = require('../../services/request');

const geoLibBaseUrl = process.env.GEOLIB_FUNCTIONS_AP_BASE_URL;

module.exports = async (data, method) => {
  const startTime = new Date().getTime();
  const res = await axios({
    method: 'post',
    url: `${geoLibBaseUrl}${method}`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(data),
  });
  await request.log(res, startTime);
  return res.data;
};
