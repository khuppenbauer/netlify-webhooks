const mongoose = require('mongoose');
const axios = require('axios');
const db = require('./database/mongodb');
const Subscription = require('./models/subscription');
const Message = require('./models/message');

const executeSubscriptions = async (subscription, data) => {
  let status;
  const message = data.message !== undefined ? data.message : [];
  try {
    const res = await axios.post(subscription.url, JSON.stringify(data.body));
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
  return Message.findByIdAndUpdate(data._id, { status, message });
};

const executeMessage = async (data) => {
  const subscriptionQuery = {
    active: true,
    app: data.app,
    event: data.event,
  };
  const subscriptions = await Subscription.find(subscriptionQuery);
  const promises = subscriptions.map(async (subscription) => {
    const promise = await executeSubscriptions(subscription, data);
    return promise;
  })
  await Promise.all(promises);
};

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const { fullDocument } = JSON.parse(event.body);
    const data = JSON.parse(fullDocument);
    const message = await executeMessage(data);
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
      await executeMessage(data);
    } else {
      const filterQuery = event.queryStringParameters.filter;
      if (filterQuery) {
        const filter = JSON.parse(filterQuery);
        const promises = filter.id.map(async (id) => {
          const data = await Message.findById(id);
          const promise = await executeMessage(data);
          return promise;
        });
        await Promise.all(promises);
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
