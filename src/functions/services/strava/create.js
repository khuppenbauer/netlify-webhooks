const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const activities = require('../../methods/activities');
const stravaLib = require('../../libs/strava');
const coordinatesLib = require('../../libs/coordinates');
const Activity = require('../../models/activity');

const addActivity = async (activityData) => {
  const {
    id: foreignKey,
    name,
    type,
    start_date,
    distance,
    elev_low,
    elev_high,
    total_elevation_gain,
    start_latlng,
  } = activityData;
  const location = await coordinatesLib.location(start_latlng[0], start_latlng[1]);
  const { city, state, country } = location;
  const activity = {
    name,
    type,
    foreignKey,
    start_date,
    distance,
    elev_low,
    elev_high,
    total_elevation_gain,
    city,
    state,
    country,
  };
  const existing = await Activity.find({ foreignKey });
  const id = (existing.length === 0) ? mongoose.Types.ObjectId() : existing[0]._id;

  if (existing.length > 0) {
    await Activity.findByIdAndUpdate(id, activity);
  } else {
    await Activity.create(
      {
        status: 'new',
        _id: id,
        ...activity,
      },
    );
  }
};

const getActivities = async (event, message, page, perPage, limit) => {
  const url = `athlete/activities?page=${page}&per_page=${perPage}`;
  const items = await stravaLib.api(url);
  await items.reduce(async (lastPromise, item) => {
    const accum = await lastPromise;
    await addActivity(item);
    return [...accum, {}];
  }, Promise.resolve([]));
  if (items.length > 0 && (limit === 0 || page < limit)) {
    const nextPage = page + 1;
    await getActivities(event, message, nextPage, perPage, limit);
  }
};

module.exports = async (event, message) => {
  const page = parseInt(event.queryStringParameters.page, 10) || 1;
  const perPage = parseInt(event.queryStringParameters.perPage, 10) || 30;
  const limit = parseInt(event.queryStringParameters.limit, 10) || 0;
  await getActivities(event, message, page, perPage, limit);
};
