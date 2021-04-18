const dotenv = require('dotenv').config();
const axios = require('axios');
const request = require('../../services/request');

const geoLibBaseUrl = process.env.GEOLIB_FUNCTIONS_AP_BASE_URL;

module.exports = async (data, method) => {
  const startTime = new Date().getTime();
  let res;
  try {
    res = await axios({
      method: 'post',
      url: `${geoLibBaseUrl}${method}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(data),
    });
    await request.log(res, startTime);
  } catch (error) {
    await request.log(error.response, startTime);
    throw error;
  }
  return res.data;
};
