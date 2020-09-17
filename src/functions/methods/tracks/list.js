const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Track = require('../../models/track');

module.exports = async (event) => {
  let result;
  let collectionCount;
  await Track.estimatedDocumentCount(function (err, count) {
    collectionCount = count;
  });
  const filterQuery = event.queryStringParameters.filter || '{}';
  const filter = JSON.parse(filterQuery);
  const totalCount = await Track.count(filter);
  const page = event.queryStringParameters.page || 1;
  const perPage = event.queryStringParameters.perPage || collectionCount;
  const sort = event.queryStringParameters.sort || '-start_date';
  const options = {
    skip: (page * perPage) - perPage,
    limit: parseInt(perPage, 10),
    sort,
  };
  try {
    result = await Track.find(filter, null, options);
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
