const Feature = require('./models/feature');
const strava = require('./services/strava');
const messages = require('./methods/messages');

const processSegments = async (event, message, segmentEfforts, foreignKey) => {
  const messageData = {
    foreignKey,
    app: 'strava',
    event: message,
  }
  await segmentEfforts.reduce(async (lastPromise, segmentEffort) => {
    const accum = await lastPromise;
    const { segment } = segmentEffort;
    const existing = await Feature.find({ foreignKey: segment.id });
    if (existing.length === 0) {
      const messageObject = {
        ...event,
        body: JSON.stringify(segment),
      };
      await messages.create(messageObject, messageData);
    }
    return [...accum, {}];
  }, Promise.resolve([]));
}

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const { action } = event.queryStringParameters;
    if (action === 'process') {
      const { includeSegments } = event.queryStringParameters;
      const message = 'save_activity';
      const activityData = await strava.process(event, message);
      if (includeSegments === 'true') {
        const { id, segment_efforts: segmentEfforts } = activityData;
        const segmentsMessage = 'parse_segments';
        await processSegments(event, segmentsMessage, segmentEfforts, id);
      }
    } else if (action === 'create') {
      const message = 'create_activity';
      await strava.create(event, message);
    } else if (action === 'segment') {
      const { saveSegmentsGpx } = event.queryStringParameters;
      const segment = JSON.parse(event.body);
      await strava.segment(segment, saveSegmentsGpx);
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
