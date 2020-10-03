const dotenv = require('dotenv').config();
const axios = require('axios');
const moment = require('moment');
const messages = require('../messages');

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

const createMessage = async (event, activity) => {
  const { id, start_date: startDate } = activity;
  const body = {
    aspect_type: 'create',
    event_time: moment(startDate).format('X'),
    object_id: id,
    object_type: 'activity',
    owner_id: 15182866,
    subscription_id: 158847,
  };
  const message = {
    ...event,
    body: JSON.stringify(body),
  };
  await messages.create(message, { foreignKey: id, app: 'strava', event: 'create_activity' });
  return message;
};

const getData = async (event, page, perPage) => {
  const token = await getToken();
  const instance = axios.create({
    baseURL: `${stravaBaseUrl}`,
    headers: { Authorization: `Bearer ${token}` },
  });

  const activities = await instance.get(`athlete/activities?page=${page}&per_page=${perPage}`);
  await activities.data.reduce(async (lastPromise, activity) => {
    const accum = await lastPromise;
    await createMessage(event, activity);
    return [...accum, {}];
  }, Promise.resolve([]));
  if (activities.data.length > 0) {
    const nextPage = page + 1;
    await getData(event, nextPage, perPage);
  }
};

module.exports = async (event) => {
  if (event.httpMethod === 'POST') {
    await getData(event, 1, 30);
  }
  return {
    statusCode: 200,
    body: 'Ok',
  };
};
