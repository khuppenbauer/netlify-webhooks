const dotenv = require('dotenv').config();
const axios = require('axios');
const request = require('../../services/request');

const stravaOAuthUrl = 'https://www.strava.com/oauth/token';
const stravaBaseUrl = 'https://www.strava.com/api/v3/';
const stravaGrantType = 'refresh_token';

const getToken = async () => {
  const res = await axios({
    method: 'post',
    url: stravaOAuthUrl,
    data: {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: process.env.STRAVA_REFRESH_TOKEN,
      grant_type: stravaGrantType,
    },
  });
  const { access_token: accessToken } = res.data;
  return accessToken;
};

const getData = async (url) => {
  const token = await getToken();
  const instance = axios.create({
    baseURL: `${stravaBaseUrl}`,
    headers: { Authorization: `Bearer ${token}` },
  });

  const startTime = new Date().getTime();
  const res = await instance.get(url);
  await request.log(res, startTime);
  if (res.status !== 200) {
    return {};
  }
  return res.data;
};

module.exports = async (url) => {
  return getData(url);
};
