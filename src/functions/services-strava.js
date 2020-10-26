const strava = require('./services/strava');

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const { action } = event.queryStringParameters;
    if (action === 'process') {
      const message = 'save_activity';
      const segmentsMessage = 'parse_segments';
      await strava.process(event, message, segmentsMessage);
    } else if (action === 'create') {
      const message = 'create_activity';
      await strava.create(event, message);
    } else if (action === 'segment') {
      const message = 'create_feature';
      await strava.segment(event, message);
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
