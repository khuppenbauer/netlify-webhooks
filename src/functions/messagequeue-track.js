const track = require('./services/track');

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const { action } = event.queryStringParameters;
    if (action === 'convert') {
      const message = 'convert_{{outtype}}';
      await track.convert(event, message);
    } else if (action === 'create') {
      const message = 'create_track';
      await track.create(event, message);
    } else if (action === 'image') {
      const message = 'create_static_image';
      await track.image(event, message);
    } else if (action === 'parse') {
      const message = 'add_metadata';
      await track.parse(event, message);
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
