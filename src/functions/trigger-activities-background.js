const mongoose = require('mongoose');
const db = require('./database/mongodb');
const sentry = require('./libs/sentry');
const Activity = require('./models/activity');
const Message = require('./models/message');
const messages = require('./methods/messages');

const importMessage = 'import_activity';
const createMessage = 'create_activity';

const createImportMessages = async (event, filterQuery) => {
  const filter = JSON.parse(filterQuery);
  await filter.id.reduce(async (lastPromise, id) => {
    const accum = await lastPromise;
    const activity = await Activity.findById(id);
    const { foreignKey } = activity;
    const messageBody = {
      object_id: foreignKey,
    };
    const messageObject = {
      ...event,
      body: JSON.stringify(messageBody),
    };
    await messages.create(messageObject, { foreignKey, app: 'strava', event: importMessage });
    return [...accum, {}];
  }, Promise.resolve([]));
};

const handler = async (event) => {
  if (event.httpMethod === 'PUT') {
    const filterQuery = event.queryStringParameters.filter;
    if (filterQuery) {
      await createImportMessages(event, filterQuery);
      return {
        statusCode: 200,
        body: 'Ok',
      };
    }
  }
  if (event.httpMethod === 'POST') {
    const message = await Message.findOne({ event: importMessage });
    if (!message) {
      return {
        statusCode: 404,
        body: 'Not found',
      };
    }
    const { _id, foreignKey, app } = message;
    const messageBody = {
      object_id: foreignKey,
    };
    const messageObject = {
      ...event,
      body: JSON.stringify(messageBody),
    };
    await messages.create(messageObject, { foreignKey, app, event: createMessage });
    await Message.findByIdAndDelete(_id);
    return {
      statusCode: 200,
      body: 'Ok',
    };

  }
  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};

exports.handler = sentry.wrapHandler(handler, {
  captureTimeoutWarning: false,
});
