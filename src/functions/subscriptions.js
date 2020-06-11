const subscriptions = require('./methods/subscriptions');

exports.handler = async (event, context) => {
  const path = event.path.replace(/(\.netlify\/functions\/)?[^/]+/, '');
  const segments = path.split('/').filter(e => e);
  switch (event.httpMethod) {
    case 'GET':
      /* GET /.netlify/functions/subscriptions */
      if (segments.length === 0) {
        return subscriptions.list(event, context);
      }
      /* GET /.netlify/functions/subscriptions/123456 */
      if (segments.length === 1) {
        event.id = segments[0];
        return subscriptions.read(event, context);
      } else {
        return {
          statusCode: 500,
          body: 'too many segments in GET request'
        }
      }
      /* POST /.netlify/functions/subscriptions */
    case 'POST':
      return subscriptions.create(event, context);
      /* PUT /.netlify/functions/subscriptions/123456 */
    case 'PUT':
      if (segments.length === 1) {
        event.id = segments[0];
        return subscriptions.update(event, context);
      } else {
        return {
          statusCode: 500,
          body: 'invalid segments in POST request, must be /.netlify/functions/subscriptions/123456'
        }
      }
      /* DELETE /.netlify/functions/subscriptions/123456 */
    case 'DELETE':
      if (segments.length === 1) {
        event.id = segments[0];
        return subscriptions.delete(event, context);
      } else {
        return {
          statusCode: 500,
          body: 'invalid segments in DELETE request, must be /.netlify/functions/subscriptions/123456'
        }
      }
      /* Fallthrough case */
    default:
      return {
        statusCode: 500,
        body: 'unrecognized HTTP Method, must be one of GET/POST/PUT/DELETE'
      }
  }
};
