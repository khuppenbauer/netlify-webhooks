const dotenv = require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const xmlBuilder = require('xmlbuilder');
const moment = require('moment');
const slugify = require('slugify');
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

const streamToGpx = async (stream, activityName, startTime) => {
  const gpx = xmlBuilder
    .create('gpx', {
      encoding: 'UTF-8',
    })
    .att('creator', 'StravaGPX Android')
    .att('version', '1.1')
    .att('xmlns', 'http://www.topografix.com/GPX/1/1')
    .att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
    .att('xsi:schemaLocation', 'http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd');

  const metadata = gpx.ele('metadata');
  if (startTime) {
    metadata.ele('time', startTime);
  }

  const trk = gpx.ele('trk');
  if (activityName) {
    trk.ele('name', activityName);
  }

  const trkseg = trk.ele('trkseg');
  for (let i = 0; i < stream.latlng.original_size; i++) {
    const time = moment(startTime).add(stream.time.data[i], 's');
    const trkpt = trkseg
      .ele('trkpt')
      .att('lat', stream.latlng.data[i][0].toFixed(6))
      .att('lon', stream.latlng.data[i][1].toFixed(6));
    trkpt.ele('ele', stream.altitude.data[i]);
    trkpt.ele('time', time.utc().format());
  }

  const xml = gpx.end({
    allowEmpty: true,
    indent: '  ',
    newline: '\n',
    pretty: true,
  });

  return xml;
}

const uploadGpx = async (gpx, fileName) => {
  const uploadUrl = 'https://content.dropboxapi.com/2/files/upload';
  const token = process.env.DROPBOX_ACCESS_TOKEN;
  const args = {
    path: `/gpx/${fileName}.gpx`,
    mode: 'add',
    autorename: true,
    mute: false,
    strict_conflict: false,
  };
  const res = await axios({
    method: 'post',
    url: uploadUrl,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify(args),
    },
    data: gpx,
  });
  return res.data;
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

    const activityStreams = await instance.get(`activities/${foreignKey}/streams/latlng,altitude,time?key_by_type=true`);
    const gpx = await streamToGpx(activityStreams.data, activity.name, activity.start_date);
    const fileName = `${moment(activity.start_date).format('YYYY-MM-DD')}-${activity.name}`;
    await uploadGpx(gpx, slugify(fileName));

    await messages.create(event, { foreignKey, app, event: 'import_activity' });
    return activities.create(activity);
  }
  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};
