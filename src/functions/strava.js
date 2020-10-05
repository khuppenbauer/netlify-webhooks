const strava = require('./methods/strava');

const isJson = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

exports.handler = async (event) => {
  const page = parseInt(event.queryStringParameters.page, 10) || 1;
  const perPage = parseInt(event.queryStringParameters.perPage, 10) || 30;
  const limit = parseInt(event.queryStringParameters.limit, 10) || 0;
  switch (event.httpMethod) {
    case 'POST':
      if (isJson(event.body)) {
        return strava.import(event);
      }
      return strava.importAll(event, page, perPage, limit);
    /* Fallthrough case */
    default:
      return {
        statusCode: 500,
        body: 'unrecognized HTTP Method, must be one of GET/POST/PUT/DELETE',
      };
  }
};
