const messages = require('./methods/messages');

exports.handler = async (event) => {
  const path = event.path.replace(/(\.netlify\/functions\/)?[^/]+/, '');
  const segments = path.split('/').filter((e) => e);
  switch (event.httpMethod) {
    case 'GET':
      /* GET /.netlify/functions/messages */
      if (segments.length === 0) {
        return messages.list(event);
      }
      /* GET /.netlify/functions/messages/123456 */
      if (segments.length === 1) {
        return messages.read(event, segments[0]);
      }
      return {
        statusCode: 500,
        body: 'too many segments in GET request',
      };

      /* POST /.netlify/functions/messages */
    case 'POST':
      return messages.create(event);
      /* PUT /.netlify/functions/messages/123456 */
    case 'PUT':
      if (segments.length === 1) {
        return messages.update(event, segments[0]);
      }
      return {
        statusCode: 500,
        body: 'invalid segments in POST request, must be /.netlify/functions/messages/123456',
      };

      /* DELETE /.netlify/functions/messages/123456 */
    case 'DELETE':
      if (segments.length === 1) {
        return messages.delete(event, segments[0]);
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
