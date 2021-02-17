const sentry = require('./libs/sentry');
const messages = require('./methods/messages');
const graphcms = require('./libs/graphcms');

const handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const { type } = event.queryStringParameters;
    const data = JSON.parse(event.body);
    let message;
    let res;
    if (type === 'track') {
      message = 'add_track';
      res = await graphcms.track(data);
    } else if (type === 'file') {
      message = 'add_file';
      res = await graphcms.asset(data);
    }
    if (res) {
      const messageObject = {
        ...event,
        body: JSON.stringify(res),
      };
      await messages.create(messageObject, { foreignKey: res.public_id, app: 'graphcms', event: message });
    }
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

exports.handler = sentry.wrapHandler(handler);
