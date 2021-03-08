const sentry = require('./libs/sentry');
const Activity = require('./models/activity');
const messages = require('./methods/messages');

const handler = async (event) => {
  const startTime = new Date().getTime();
  if (event.httpMethod === 'PUT') {
    const filterQuery = event.queryStringParameters.filter;
    if (filterQuery) {
      const filter = JSON.parse(filterQuery);
      await filter.id.reduce(async (lastPromise, id) => {
        const accum = await lastPromise;
        const activity = await Activity.findById(id);
        const { foreignKey } = activity;
        const message = 'create_activity';
        const messageBody = {
          object_id: foreignKey,
        };
        const messageObject = {
          ...event,
          body: JSON.stringify(messageBody),
        };
        await messages.create(messageObject, { foreignKey, app: 'strava', event: message });
        return [...accum, {}];
      }, Promise.resolve([]));
      return {
        statusCode: 200,
        body: 'Ok',
      };
    }
  }
  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};

exports.handler = sentry.wrapHandler(handler, {
  captureTimeoutWarning: false,
});
