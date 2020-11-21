const netlify = require('./services/netlify');

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const deployMessage = 'deploy_file';
    const uploadMessage = 'upload_{{dir}}_{{extension}}_file';
    const { action } = event.queryStringParameters;
    if (action === 'deploy') {
      await netlify.deploy(event, deployMessage, uploadMessage);
    } else if (action === 'upload') {
      await netlify.upload(event, uploadMessage);
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
