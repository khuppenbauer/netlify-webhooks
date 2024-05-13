const Feature = require('./models/feature');
const strava = require('./services/strava');
const messages = require('./methods/messages');
const sentry = require('./libs/sentry');

const processSegments = async (event, message, segmentEfforts, parseSegments, saveSegmentsGpx) => {
  await segmentEfforts.reduce(async (lastPromise, segmentEffort) => {
    const accum = await lastPromise;
    const { segment } = segmentEffort;
    const { id: foreignKey } = segment;
    const existing = await Feature.find({ foreignKey });
    if (existing.length === 0) {
      if (parseSegments) {
        await strava.segment(event, segment, saveSegmentsGpx);
      } else {
        const messageData = {
          foreignKey,
          app: 'strava',
          event: message,
        };
        const messageObject = {
          ...event,
          body: JSON.stringify(segment),
        };
        await messages.create(messageObject, messageData);
      }
    }
    return [...accum, {}];
  }, Promise.resolve([]));
};

const handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const {
      action, includeSegments, parseSegments, saveSegmentsGpx, dropboxSync,
    } = event.queryStringParameters;
    if (action === 'activity') {
      const message = 'save_activity';
      const activityData = await strava.activity(event, message);
      if (includeSegments === 'true') {
        const { segment_efforts: segmentEfforts } = activityData;
        await processSegments(event, 'parse_segments', segmentEfforts, parseSegments, saveSegmentsGpx);
      }
      if (dropboxSync === 'true') {
        await strava.photos(event, 'save_photos', dropboxSync);
      }
    } else if (action === 'photos') {
      await strava.photos(event, 'save_photos', dropboxSync);
    } else if (action === 'create') {
      await strava.create(event, 'create_activity');
    } else if (action === 'segment') {
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
