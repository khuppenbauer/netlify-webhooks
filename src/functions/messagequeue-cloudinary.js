const sentry = require('./libs/sentry');
const messages = require('./methods/messages');
const cloudinary = require('./libs/cloudinary');

const handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const message = 'upload_cloudinary_image';
    const data = JSON.parse(event.body);
    const res = await cloudinary.upload(data);
    if (res) {
      const messageObject = {
        ...event,
        body: JSON.stringify(res),
      };
      await messages.create(messageObject, { foreignKey: res.public_id, app: 'messageQueue', event: message });
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

exports.handler = sentry.wrapHandler(handler);
