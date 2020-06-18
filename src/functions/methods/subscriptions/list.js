const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Subscription = require('../../models/subscription');

module.exports = async (event) => {
  let result;
  let num;
  await Subscription.estimatedDocumentCount(function (err, count) {
    num = count;
  });
  const page = event.queryStringParameters.page || 1;
  const perPage = event.queryStringParameters.perPage || num;
  const sort = event.queryStringParameters.sort || 'app event';
  const filterQuery = event.queryStringParameters.filter || '{}';
  const filter = JSON.parse(filterQuery);
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
      'X-Total-Count': num,
    },
    body: JSON.stringify(result),
  };
};
