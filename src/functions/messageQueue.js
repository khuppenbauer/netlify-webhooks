const mongoose = require('mongoose');
const axios = require('axios');
const db = require('./database/mongodb');
const Subscription = require('./models/subscription');
const Log = require('./models/log');
const Message = require('./models/message');
const messages = require('./methods/messages');

const executeSubscriptions = async (event, subscription, data) => {
  let status;
  const message = data.message !== undefined ? data.message : [];
  try {
    const startTime = new Date().getTime();
    const { url } = subscription;
    const urlObject = new URL(url);
    const res = await axios.post(url, JSON.stringify(data.body));
    const searchParams = new URLSearchParams(urlObject.search);
    await Log.create(
      {
        _id: mongoose.Types.ObjectId(),
        status: res.status,
        statusText: res.statusText,
        url,
        urlOrigin: urlObject.origin,
        urlPathname: urlObject.pathname,
        urlAction: searchParams.get('action'),
        method: res.config.method,
        responseTime: new Date().getTime() - startTime,
        subscription,
      },
    );
    status = 'success';
    message.push({
      subscription,
      status: res.status,
      res: res.data,
    });
  } catch (err) {
    status = 'error';
    message.push({
      subscription,
      error: err.message,
    });
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

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const { fullDocument } = JSON.parse(event.body);
    const data = JSON.parse(fullDocument);
    const message = await executeMessage(event, data);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
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
