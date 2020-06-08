import mongoose from 'mongoose'
import db from '../../../mongodb'
import Subscription from '../../../models/subscription'

exports.handler = async (event, context) => {
  const data = JSON.parse(event.body);
  console.log('Function `create` invoked', data)
  const subscription = {
    _id: mongoose.Types.ObjectId(),
    app: data.app,
    event: data.event,
    url: data.url,
  };

  Subscription.create(subscription, function (err, small) {
    if (err) {
      return {
        statusCode: 400,
        body: JSON.stringify({msg: err.message})
      }
    }
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    }
  });
};
