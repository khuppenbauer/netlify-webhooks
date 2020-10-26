const features = require('./methods/features');

exports.handler = async (event) => {
  const path = event.path.replace(/(\.netlify\/functions\/)?[^/]+/, '');
  const segments = path.split('/').filter((e) => e);
  switch (event.httpMethod) {
    case 'GET':
      /* GET /.netlify/functions/tracks */
      if (segments.length === 0) {
        return features.list(event);
      }
      /* GET /.netlify/functions/tracks/123456 */
      if (segments.length === 1) {
        return features.read(event, segments[0]);
      }
      return {
        statusCode: 500,
        body: 'too many segments in GET request',
      };

      /* POST /.netlify/functions/tracks */
    case 'POST':
      return features.create(event);
      /* PUT /.netlify/functions/tracks/123456 */
    case 'PUT':
      if (segments.length === 1) {
        return features.update(event, segments[0]);
      }
      return {
        statusCode: 500,
        body: 'invalid segments in POST request, must be /.netlify/functions/tracks/123456',
      };

      /* DELETE /.netlify/functions/tracks/123456 */
    case 'DELETE':
      if (segments.length === 1 || event.queryStringParameters.filter) {
        return features.delete(event, segments[0]);
      }
      return {
        statusCode: 500,
        body: 'invalid segments in DELETE request, must be /.netlify/functions/tracks/123456',
      };

      /* Fallthrough case */
    default:
      return {
        statusCode: 500,
        body: 'unrecognized HTTP Method, must be one of GET/POST/PUT/DELETE',
      };
  }
};
