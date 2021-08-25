const sentry = require('./libs/sentry');
const algolia = require('./libs/algolia');

const handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const { type } = event.queryStringParameters;
    const data = JSON.parse(event.body);
    if (type === 'feature') {
      await algolia.feature(data);
    } else if (type === 'track') {
      await algolia.track(data);
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

exports.handler = sentry.wrapHandler(handler, {
  captureTimeoutWarning: false,
});
