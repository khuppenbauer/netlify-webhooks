const dotenv = require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const activities = require('./methods/activities');
const messages = require('./methods/messages');
const photos = require('./methods/photos');

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
    const imageSize = 800;
    const token = await getToken();
    const instance = axios.create({
      baseURL: `${baseUrl}`,
      headers: { Authorization: `Bearer ${token}` },
    });

    const activityData = await instance.get(`activities/${foreignKey}`);
    const activityPhotos = await instance.get(`activities/${foreignKey}/photos?size=${imageSize}`);
    const activityPhotosArray = activityPhotos.data.reduce(
      (acc, item) => (acc[item.unique_id] = item.urls[imageSize], acc),
      {},
    );
    const activity = {
      ...activityData.data,
      photos: activityPhotosArray,
      foreignKey,
      _id: mongoose.Types.ObjectId(),
    };

    activityPhotos.data.map((activityPhoto) => (
      photos.create(event, {
        activity: activity._id,
        foreignKey: activityPhoto.unique_id,
        url: activityPhoto.urls[imageSize],
        shootingDate: activityPhoto.created_at,
      })
    ));

    await messages.create(event, { foreignKey, app, event: 'import_activity' });
    return activities.create(activity);
  }
  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};
