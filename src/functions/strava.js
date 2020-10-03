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
  switch (event.httpMethod) {
    case 'POST':
      if (isJson(event.body)) {
        return strava.import(event);
      } else {
        return strava.importAll(event);
      }
    /* Fallthrough case */
    default:
      return {
        statusCode: 500,
        body: 'unrecognized HTTP Method, must be one of GET/POST/PUT/DELETE',
      };
  }
};
