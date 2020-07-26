const dotenv = require('dotenv').config();
const axios = require('axios');
const activities = require('./methods/activities');
const messages = require('./methods/messages');

const getToken = async () => {
  const oAuthUrl = 'https://www.strava.com/oauth/token';
  const res = await axios({
    method: 'post',
    url: oAuthUrl,
    data: {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: process.env.STRAVA_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    },
  });
  const { access_token: accessToken } = res.data;
  return accessToken;
};

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const data = JSON.parse(event.body);
    const { object_id: foreignKey } = data;
    const app = 'strava';
    const baseUrl = 'https://www.strava.com/api/v3/';
    const token = await getToken();
    const instance = axios.create({
      baseURL: `${baseUrl}`,
      headers: { Authorization: `Bearer ${token}` },
    });

    const res = await instance.get(`activities/${foreignKey}`);
    const activity = {
      ...res.data,
      foreignKey,
    };
    await messages.create(event, { foreignKey, app, event: 'import_activity' });
    return activities.create(event, activity);
  }
  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};
