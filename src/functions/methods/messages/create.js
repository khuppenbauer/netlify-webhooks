const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Message = require('../../models/message');

const headers = (obj) => {
  return Object.keys(obj).reduce((object, key) => {
    object[key.split('.').join('_')] = obj[key];
    return object
  }, {});
};

module.exports = async (event, context, data) => {
  const message = {...data,
    _id: mongoose.Types.ObjectId(),
    path: event.path,
    httpMethod: event.httpMethod,
  };
  let result;
  try {
    result = {...message,
      status: 'success',
      headers: headers(event.headers),
      queryStringParameters: event.queryStringParameters,
      body: JSON.parse(event.body)
    };
    await Message.create(result);
  } catch (err) {
    const error = {...message,
      status: 'error',
      message: err.message
    };
    await Message.create(error);
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(error)
    }
  }
  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json'
    },
      body: JSON.stringify(result)
  }
};
