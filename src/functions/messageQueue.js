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
  console.log([subscription, data, status, message])
  return Message.findByIdAndUpdate(data._id, { status, message });
};

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const { fullDocument } = JSON.parse(event.body);
    const data = JSON.parse(fullDocument);
    const subscriptionQuery = { app: data.app, event: data.event };
    const subscriptions = await Subscription.find(subscriptionQuery);
    const promises = subscriptions.map(async (subscription) => {
      const promise = await executeSubscriptions(subscription, data);
      return promise;
    })
    await Promise.all(promises);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptions),
    };
  }
  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};
