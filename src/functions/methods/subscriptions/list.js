const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Subscription = require('../../models/subscription');

const filteredResult = async (event) => {
  let result;
  let collectionCount;
  await Subscription.estimatedDocumentCount(function (err, count) {
    collectionCount = count;
  });
  const filterQuery = event.queryStringParameters.filter || '{}';
  const filter = JSON.parse(filterQuery);
  const totalCount = await Subscription.count(filter);
  const page = event.queryStringParameters.page || 1;
  const perPage = event.queryStringParameters.perPage || collectionCount;
  const sort = event.queryStringParameters.sort || 'app event';
  const options = {
    skip: (page * perPage) - perPage,
    limit: parseInt(perPage, 10),
    sort,
  };
  try {
    result = await Subscription.find(filter, null, options);
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
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Expose-Headers': 'X-Total-Count',
      'Content-Type': 'application/json',
      'X-Total-Count': totalCount.toString(),
    },
    body: JSON.stringify(result),
  };
};

const aggregationResult = async (event) => {
  let result;
  const { type, pipeline } = JSON.parse(event.queryStringParameters.query);
  if (type === 'aggregate') {
    try {
      result = await Subscription.aggregate(pipeline);
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
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Expose-Headers': 'X-Total-Count',
        'Content-Type': 'application/json',
        'X-Total-Count': result.length.toString(),
      },
      body: JSON.stringify(result),
    };
  }
  return {
    statusCode: 400,
    headers: {
      'Content-Type': 'application/json',
    },
    body: 'Type not supported',
  };
};

module.exports = async (event) => {
  const result = event.queryStringParameters.query !== undefined
    ? await aggregationResult(event) : await filteredResult(event);
  return result;
};
