const dotenv = require('dotenv').config();
const moment = require('moment');
const messages = require('../../methods/messages');
const stravaLib = require('../../libs/strava');

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
  const url = `athlete/activities?page=${page}&per_page=${perPage}`;
  const activities = await stravaLib.api(url);
  await activities.reduce(async (lastPromise, activity) => {
    const accum = await lastPromise;
    await createMessage(event, message, activity);
    return [...accum, {}];
  }, Promise.resolve([]));
  if (activities.length > 0 && (limit === 0 || page < limit)) {
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
