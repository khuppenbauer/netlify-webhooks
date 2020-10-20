const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Subscription = require('../../models/subscription');

module.exports = async (event, id) => {
  const { body } = event;
  const subscription = JSON.parse(body);
  if (id) {
    try {
      await Subscription.findByIdAndUpdate(id, subscription);
    } catch (err) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: err.message,
        }),
      };
    }
  } else {
    const filterQuery = event.queryStringParameters.filter;
    if (filterQuery) {
      const filter = JSON.parse(filterQuery);
      const idFilter = {
        _id: {
          $in: filter.id,
        },
      };
      try {
        await Subscription.updateMany(idFilter, { $set: subscription });
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(filter.id),
        };
      } catch (err) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: err.message,
          }),
        };
      }
    } else {
      return {
        statusCode: 400,
      };
    }
  }
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subscription),
  };
};
