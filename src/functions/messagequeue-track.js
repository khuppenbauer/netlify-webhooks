const track = require('./services/track');
const sentry = require('./libs/sentry');

const handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const { action } = event.queryStringParameters;
    if (action === 'create') {
      const message = 'create_track';
      await track.create(event, message);
    } else if (action === 'image') {
      const message = 'create_static_image';
      await track.image(event, message);
    } else if (action === 'upload') {
      const message = 'update_track';
      await track.upload(event, message);
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
