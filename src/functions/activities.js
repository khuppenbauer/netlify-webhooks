const activities = require('./methods/activities');

exports.handler = async (event) => {
  const path = event.path.replace(/(\.netlify\/functions\/)?[^/]+/, '');
  const segments = path.split('/').filter((e) => e);
  switch (event.httpMethod) {
    case 'GET':
      /* GET /.netlify/functions/messages */
      if (segments.length === 0) {
        return activities.list(event);
      }
      /* GET /.netlify/functions/messages/123456 */
      if (segments.length === 1) {
        return activities.read(event, segments[0]);
      }
      return {
        statusCode: 500,
        body: 'too many segments in GET request',
      };

    /* POST /.netlify/functions/messages */
    case 'POST':
      return activities.create(event);

    /* DELETE /.netlify/functions/messages/123456 */
    case 'DELETE':
      if (segments.length === 1 || event.queryStringParameters.filter) {
        return activities.delete(event, segments[0]);
      }
      return {
        statusCode: 500,
        body: 'invalid segments in DELETE request, must be /.netlify/functions/messages/123456',
      };

    /* Fallthrough case */
    default:
      return {
        statusCode: 500,
        body: 'unrecognized HTTP Method, must be one of GET/POST/PUT/DELETE',
      };
  }
};
