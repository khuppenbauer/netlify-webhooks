const strava = require('./services/strava');

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const { action } = event.queryStringParameters;
    if (action === 'process') {
      const message = 'save_activity';
      await strava.process(event, message);
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
