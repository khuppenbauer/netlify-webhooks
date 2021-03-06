const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const File = require('../../models/file');

const filteredResult = async (event) => {
  let result;
  let collectionCount;
  await File.estimatedDocumentCount(function (err, count) {
    collectionCount = count;
  });
  const filterQuery = event.queryStringParameters.filter || '{}';
  const filter = JSON.parse(filterQuery);
  const { q } = filter;
  let search = filter;
  if (q) {
    search = {
      ...filter,
      name: {
        $regex: q,
        $options: 'i',
      },
    };
    delete search['q'];
  }
  const totalCount = await File.countDocuments(search);
  const page = event.queryStringParameters.page || 1;
  const perPage = event.queryStringParameters.perPage || collectionCount;
  const sort = event.queryStringParameters.sort || '-updatedAt';
  const options = {
    skip: (page * perPage) - perPage,
    limit: parseInt(perPage, 10),
    sort,
  };
  try {
    result = await File.find(search, null, options);
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
      result = await File.aggregate(pipeline);
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
