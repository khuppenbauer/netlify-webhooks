const netlify = require('./services/netlify');
const sentry = require('./libs/sentry');

const handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const uploadMessage = 'upload_{{dir}}_{{extension}}_file';
    await netlify.sync(event, uploadMessage);
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

exports.handler = sentry.wrapHandler(handler, {
  captureTimeoutWarning: false,
});
