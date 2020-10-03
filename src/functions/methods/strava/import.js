const dotenv = require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const xmlBuilder = require('xmlbuilder');
const moment = require('moment');
const getSlug = require('speakingurl');
const db = require('../../database/mongodb');
const Activity = require('../../models/activity');
const Photo = require('../../models/photo');
const activities = require('../activities');
const messages = require('../messages');
const photos = require('../photos');
const dropbox = require('../dropbox');

const stravaOAuthUrl = 'https://www.strava.com/oauth/token';
const stravaBaseUrl = 'https://www.strava.com/api/v3/';
const stravaGrantType = 'refresh_token';
const stravaImageSize = 800;

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

const getData = async (foreignKey) => {
  const token = await getToken();
  const instance = axios.create({
    baseURL: `${stravaBaseUrl}`,
    headers: { Authorization: `Bearer ${token}` },
  });

  const activity = await instance.get(`activities/${foreignKey}`);
  if (activity.status !== 200) {
    return {};
  }

  const activityStream = await instance.get(`activities/${foreignKey}/streams/latlng,altitude,time?key_by_type=true`);
  const activityPhotos = await instance.get(`activities/${foreignKey}/photos?size=${stravaImageSize}`);
  return {
    activity: activity.data,
    stream: activityStream.data,
    photos: activityPhotos.data,
  };
};

const streamToGpx = async (stream, name, startTime) => {
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
  if (name) {
    trk.ele('name', name);
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

const processStream = async (stream, name, startTime, gpxFile) => {
  const fileName = `${moment(startTime).format('YYYY-MM-DD')}-${name}`;
  const cleanFileName = getSlug(fileName, {
    maintainCase: true,
  });
  const path = `/tracks/${cleanFileName}.gpx`;
  if (path !== gpxFile) {
    const gpx = await streamToGpx(stream, name, startTime);
    if (gpxFile) {
      await dropbox.delete(gpxFile);
    }
    await dropbox.upload(gpx, path);
  }
  return path;
};

const processPhotos = async (event, activityId, activityPhotos) => {
  const activityPhotosUrl = activityPhotos.reduce(
    (acc, item) => (acc[item.unique_id] = item.urls[stravaImageSize], acc),
    {},
  );

  const existingPhotos = await Photo.find({
    activity: activityId,
  });

  existingPhotos.map((existingPhoto) => {
    if (!activityPhotosUrl[existingPhoto.foreignKey]) {
      photos.delete(event, existingPhoto._id);
    }
  });

  activityPhotos.map((activityPhoto) => (
    photos.create(event, {
      activity: activityId,
      foreignKey: activityPhoto.unique_id,
      url: activityPhoto.urls[stravaImageSize],
      shootingDate: activityPhoto.created_at,
    })
  ));
  return activityPhotosUrl;
};

module.exports = async (event) => {
  const data = JSON.parse(event.body);
  const { object_id: foreignKey } = data;
  const message = 'import_activity';

  const existingActivities = await Activity.find({
    foreignKey,
  });
  let type;
  let activityId;
  let activityGpxFile;
  if (existingActivities.length === 0) {
    type = 'create';
    activityId = mongoose.Types.ObjectId();
  } else {
    type = 'update';
    activityId = existingActivities[0]._id;
    activityGpxFile = existingActivities[0].gpxFile;
  }
  const {
    activity: activityData,
    stream: activityStream,
    photos: activityPhotos,
  } = await getData(foreignKey);
  const { name, start_date: startTime } = activityData;
  const gpxFile = await processStream(activityStream, name, startTime, activityGpxFile);
  const photoUrls = await processPhotos(event, activityId, activityPhotos);
  const activity = {
    ...activityData,
    gpxFile,
    photos: photoUrls,
    foreignKey,
    _id: activityId,
  };
  let res;
  if (type === 'create') {
    res = activities.create(activity);
  } else {
    res = activities.update(activity, activityId);
  }
  await messages.create(event, { foreignKey, app: 'strava', event: message });
  return res;
};
