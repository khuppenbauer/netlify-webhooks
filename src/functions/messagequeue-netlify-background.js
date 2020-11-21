const netlify = require('./services/netlify');

exports.handler = async (event) => {
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
