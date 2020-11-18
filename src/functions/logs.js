const logs = require('./methods/logs');

exports.handler = async (event) => {
  const path = event.path.replace(/(\.netlify\/functions\/)?[^/]+/, '');
  const segments = path.split('/').filter((e) => e);
  switch (event.httpMethod) {
    case 'GET':
      /* GET /.netlify/functions/logs */
      if (segments.length === 0) {
        return logs.list(event);
      }
      /* GET /.netlify/functions/logs/123456 */
      if (segments.length === 1) {
        return logs.read(event, segments[0]);
      }
      return {
        statusCode: 500,
        body: 'too many segments in GET request',
      };

    /* POST /.netlify/functions/logs */
    case 'POST':
      return logs.create(event);

    /* DELETE /.netlify/functions/logs/123456 */
    case 'DELETE':
      if (segments.length === 1 || event.queryStringParameters.filter) {
        return logs.delete(event, segments[0]);
      }
      return {
        statusCode: 500,
        body: 'invalid segments in DELETE request, must be /.netlify/functions/logs/123456',
      };
    /* Fallthrough case */
    default:
      return {
        statusCode: 500,
        body: 'unrecognized HTTP Method, must be one of GET/POST/PUT/DELETE',
      };
  }
};
