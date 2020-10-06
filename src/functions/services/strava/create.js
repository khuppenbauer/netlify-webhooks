const dotenv = require('dotenv').config();
const axios = require('axios');
const moment = require('moment');
const messages = require('../../methods/messages');

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

const createMessage = async (event, message, activity) => {
  const { id, start_date: startDate } = activity;
  const messageBody = {
    aspect_type: 'create',
    event_time: moment(startDate).format('X'),
    object_id: id,
    object_type: 'activity',
    owner_id: process.env.STRAVA_OWNER_ID,
    subscription_id: process.env.STRAVA_SUBSCRIPTION_ID,
  };
  const messageObject = {
    ...event,
    body: JSON.stringify(messageBody),
  };
  await messages.create(messageObject, { foreignKey: id, app: 'strava', event: message });
  return message;
};

const getActivities = async (event, message, page, perPage, limit) => {
  const token = await getToken();
  const instance = axios.create({
    baseURL: `${stravaBaseUrl}`,
    headers: { Authorization: `Bearer ${token}` },
  });
  const activities = await instance.get(`athlete/activities?page=${page}&per_page=${perPage}`);
  await activities.data.reduce(async (lastPromise, activity) => {
    const accum = await lastPromise;
    await createMessage(event, message, activity);
    return [...accum, {}];
  }, Promise.resolve([]));
  if (activities.data.length > 0 && (limit === 0 || page < limit)) {
    const nextPage = page + 1;
    await getActivities(event, message, nextPage, perPage, limit);
  }
};

module.exports = async (event, message) => {
  const page = parseInt(event.queryStringParameters.page, 10) || 1;
  const perPage = parseInt(event.queryStringParameters.perPage, 10) || 30;
  const limit = parseInt(event.queryStringParameters.limit, 10) || 0;
  await getActivities(event, message, page, perPage, limit);
  return {
    statusCode: 200,
    body: 'Ok',
  };
};
