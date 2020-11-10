const dotenv = require('dotenv').config();
const getSlug = require('speakingurl');
const moment = require('moment');
const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Activity = require('../../models/activity');
const activities = require('../../methods/activities');
const messages = require('../../methods/messages');
const stravaLib = require('../../libs/strava');
const dropboxLib = require('../../libs/dropbox');
const coordinatesLib = require('../../libs/coordinates');

const saveGpx = async (gpx, name, startTime, gpxFile) => {
  const fileName = `${moment(startTime).format('YYYY-MM-DD')}-${name}`;
  const cleanFileName = getSlug(fileName, {
    maintainCase: true,
  });
  const path = `/tracks/${cleanFileName}.gpx`;
  if (path !== gpxFile) {
    if (gpxFile) {
      await dropboxLib.delete(gpxFile);
    }
    await dropboxLib.upload(gpx, path);
  }
  return path;
};

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
  const { name, start_date: startTime } = activityData;
  const url = `activities/${foreignKey}/streams/latlng,altitude,time?key_by_type=true`;
  const stream = await stravaLib.api(url);
  const points = stream.latlng.data.map((e, index) => [
    parseFloat(e[1].toFixed(6)),
    parseFloat(e[0].toFixed(6)),
  ]);
  const bounds = await coordinatesLib.geoLib({ points }, 'getBounds');
  const gpx = await stravaLib.streams(stream, bounds, name, startTime, foreignKey, 'activities', 'gpx');
  const gpxFile = await saveGpx(gpx, name, startTime, activityGpxFile);
  const photos = await stravaLib.photos(event, activityId, foreignKey);
  const activity = {
    ...activityData,
    gpxFile,
    photos,
    foreignKey,
    _id: activityId,
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
