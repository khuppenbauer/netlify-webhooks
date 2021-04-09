const dotenv = require('dotenv').config();
const getSlug = require('speakingurl');
const dayJs = require('dayjs');
const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Activity = require('../../models/activity');
const activities = require('../../methods/activities');
const files = require('../../methods/files');
const messages = require('../../methods/messages');
const stravaLib = require('../../libs/strava');
const dropboxLib = require('../../libs/dropbox');
const coordinatesLib = require('../../libs/coordinates');

const saveGpx = async (path, gpx, gpxFile) => {
  if (path !== gpxFile) {
    if (gpxFile) {
      await dropboxLib.delete(gpxFile);
    }
    await dropboxLib.upload(gpx, path);
  }
  return path;
};

const getFileName = async (name, startTime) => {
  const fileName = `${dayJs(startTime).format('YYYY-MM-DD')}-${name}`;
  return getSlug(fileName, {
    maintainCase: true,
  });
}

const createFile = async (event, fileName, path) => {
  const source = {
    name: 'strava',
    foreignKey: fileName,
    type: 'gpxFile',
  };
  const metaData = {
    name: `${fileName}.gpx`,
    path_display: path,
    source,
  };
  await files.create(event, metaData);
}

const processActivity = async (event, foreignKey) => {
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

  const activityData = await stravaLib.api(`activities/${foreignKey}`);
  delete activityData['photos'];
  const {
    name,
    start_date: startTime,
    start_latitude: latitude,
    start_longitude: longitude,
  } = activityData;
  const location = await coordinatesLib.location(latitude, longitude);
  const { city, state, country } = location;
  const url = `activities/${foreignKey}/streams/latlng,altitude,time?key_by_type=true`;
  const stream = await stravaLib.api(url);
  const points = stream.latlng.data.map((e, index) => [
    parseFloat(e[1].toFixed(6)),
    parseFloat(e[0].toFixed(6)),
  ]);
  const bounds = await coordinatesLib.geoLib({ points }, 'getBounds');
  const gpx = await stravaLib.streams(stream, bounds, name, startTime, foreignKey, 'activities', 'gpx');
  const fileName = await getFileName(name, startTime);
  const path = `/tracks/${fileName}.gpx`;
  await createFile(event, fileName, path);
  const gpxFile = await saveGpx(path, gpx, activityGpxFile);
  const activity = {
    ...activityData,
    gpxFile,
    foreignKey,
    status: 'synced',
    _id: activityId,
    city,
    state,
    country,
  };

  if (type === 'create') {
    await activities.create(activity);
  } else {
    await activities.update(activity, activityId);
  }
  return activityData;
}

module.exports = async (event, message) => {
  const data = JSON.parse(event.body);
  const { object_id: foreignKey } = data;
  const activityData = await processActivity(event, foreignKey);
  await messages.create(event, { foreignKey, app: 'strava', event: message });
  return activityData;
};
