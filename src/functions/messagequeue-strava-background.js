const Feature = require('./models/feature');
const strava = require('./services/strava');
const messages = require('./methods/messages');
const sentry = require('./libs/sentry');

const processSegments = async (event, message, segmentEfforts) => {
  await segmentEfforts.reduce(async (lastPromise, segmentEffort) => {
    const accum = await lastPromise;
    const { segment } = segmentEffort;
    const { id: foreignKey } = segment;
    const existing = await Feature.find({ foreignKey });
    if (existing.length === 0) {
      const messageData = {
        foreignKey,
        app: 'strava',
        event: message,
      }
      const messageObject = {
        ...event,
        body: JSON.stringify(segment),
      };
      await messages.create(messageObject, messageData);
    }
    return [...accum, {}];
  }, Promise.resolve([]));
}

const handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const { action } = event.queryStringParameters;
    if (action === 'activity') {
      const { includeSegments } = event.queryStringParameters;
      const message = 'save_activity';
      const activityData = await strava.activity(event, message);
      if (includeSegments === 'true') {
        const { id, segment_efforts: segmentEfforts } = activityData;
        const segmentsMessage = 'parse_segments';
        await processSegments(event, segmentsMessage, segmentEfforts);
      }
    } else if (action === 'photos') {
      const { dropboxSync } = event.queryStringParameters;
      const message = 'save_photos';
      await strava.photos(event, message, dropboxSync);
    } else if (action === 'create') {
      const message = 'create_activity';
      await strava.create(event, message);
    } else if (action === 'segment') {
      const { saveSegmentsGpx } = event.queryStringParameters;
      const segment = JSON.parse(event.body);
      await strava.segment(event, segment, saveSegmentsGpx);
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