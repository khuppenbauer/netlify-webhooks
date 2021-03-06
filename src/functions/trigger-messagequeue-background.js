const mongoose = require('mongoose');
const axios = require('axios');
const db = require('./database/mongodb');
const Subscription = require('./models/subscription');
const Message = require('./models/message');
const messages = require('./methods/messages');
const request = require('./services/request');
const sentry = require('./libs/sentry');

const executeSubscriptions = async (event, subscription, data) => {
  let status;
  const message = data.message !== undefined ? data.message : [];
  const startTime = new Date().getTime();
  try {
    const body = {
      ...data.body,
      message: data._id,
    };
    const { url } = subscription;
    const res = await axios.post(url, JSON.stringify(body));
    await request.log(res, startTime);
    status = 'success';
    message.push({
      subscription,
      status: res.status,
      res: res.data,
    });
  } catch (error) {
    status = 'error';
    const messageObject = {
      ...event,
      body: JSON.stringify({ status, statusText: error.message }),
    };
    await request.log(error.response, startTime);
    await messages.update(messageObject, data._id);
    throw error;
  }
  const messageObject = {
    ...event,
    body: JSON.stringify({ status, message }),
  };
  await messages.update(messageObject, data._id);
};

const executeMessage = async (event, data) => {
  const subscriptionQuery = {
    active: true,
    app: data.app,
    event: data.event,
  };
  const subscriptions = await Subscription.find(subscriptionQuery);
  if (subscriptions.length === 0) {
    const messageObject = {
      ...event,
      body: JSON.stringify({ status: 'success' }),
    };
    await messages.update(messageObject, data._id);
  }
  await subscriptions.reduce(async (lastPromise, subscription) => {
    const accum = await lastPromise;
    await executeSubscriptions(event, subscription, data);
    return [...accum, {}];
  }, Promise.resolve([]));
};

const handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const { fullDocument } = JSON.parse(event.body);
    const data = JSON.parse(fullDocument);
    await executeMessage(event, data);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'Ok',
    };
  }
  if (event.httpMethod === 'PUT') {
    const path = event.path.replace(/(\.netlify\/functions\/)?[^/]+/, '');
    const segments = path.split('/').filter((e) => e);
    if (segments.length === 1) {
      const data = await Message.findById(segments[0]);
      await executeMessage(event, data);
    } else {
      const filterQuery = event.queryStringParameters.filter;
      if (filterQuery) {
        const filter = JSON.parse(filterQuery);
        await filter.id.reduce(async (lastPromise, id) => {
          const accum = await lastPromise;
          const data = await Message.findById(id);
          await executeMessage(event, data);
          return [...accum, {}];
        }, Promise.resolve([]));
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    };
  }
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE, PUT',
      },
    };
  }
  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};

exports.handler = sentry.wrapHandler(handler, {
  captureTimeoutWarning: false,
});
