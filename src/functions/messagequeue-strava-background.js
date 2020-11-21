const Feature = require('./models/feature');
const strava = require('./services/strava');

const processSegments = async (segmentEfforts, saveSegmentsGpx) => {
  await segmentEfforts.reduce(async (lastPromise, segmentEffort) => {
    const accum = await lastPromise;
    const { segment } = segmentEffort;
    const existing = await Feature.find({ foreignKey: segment.id });
    if (existing.length === 0) {
      await strava.segment(segment, saveSegmentsGpx);
    }
    return [...accum, {}];
  }, Promise.resolve([]));
}

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const { action } = event.queryStringParameters;
    if (action === 'process') {
      const { includeSegments, saveSegmentsGpx } = event.queryStringParameters;
      const message = 'save_activity';
      const activityData = await strava.process(event, message);
      if (includeSegments === 'true') {
        const { segment_efforts: segmentEfforts } = activityData;
        await processSegments(segmentEfforts, saveSegmentsGpx);
      }
    } else if (action === 'create') {
      const message = 'create_activity';
      await strava.create(event, message);
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
