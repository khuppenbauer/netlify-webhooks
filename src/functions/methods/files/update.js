const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const File = require('../../models/file');

module.exports = async (event, id) => {
  const { body } = event;
  const file = JSON.parse(body);
  if (id) {
    try {
      await File.findByIdAndUpdate(id, file);
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
        await File.updateMany(idFilter, { $set: file });
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
    body: JSON.stringify(file),
  };
};
