const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Track = require('../../models/track');

const filteredResult = async (event) => {
  let result;
  let collectionCount;
  await Track.estimatedDocumentCount(function (err, count) {
    collectionCount = count;
  });
  const filterQuery = event.queryStringParameters.filter || '{}';
  let filter = JSON.parse(filterQuery);
  const { q, date_gte, date_lte } = filter;
  if (q) {
    filter = {
      ...filter,
      name: {
        $regex: q,
        $options: 'i',
      },
    };
    delete filter['q'];
  }
  if (date_gte && date_lte) {
    filter = {
      ...filter,
      date: {
        $gte: date_gte,
        $lte: date_lte,
      },
    };
    delete filter['date_gte'];
    delete filter['date_lte'];
  } else if (date_gte) {
    filter = {
      ...filter,
      date: {
        $gte: date_gte,
      },
    };
    delete filter['date_gte'];
  } else if (date_lte) {
    filter = {
      ...filter,
      date: {
        $lte: date_lte,
      },
    };
    delete filter['date_lte'];
  }
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

const aggregationResult = async (event) => {
  let result;
  const { type, pipeline } = JSON.parse(event.queryStringParameters.query);
  if (type === 'aggregate') {
    try {
      result = await Track.aggregate(pipeline);
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
