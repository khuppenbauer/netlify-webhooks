const netlify = require('./services/netlify');
const logs = require('./methods/logs');

exports.handler = async (event) => {
  const startTime = new Date().getTime();
  if (event.httpMethod === 'POST') {
    const uploadMessage = 'upload_{{dir}}_{{extension}}_file';
    await netlify.sync(event, uploadMessage);
    await logs.create(event, { startTime, status: 202 });
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
