const dropbox = require('./services/dropbox');

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const { action } = event.queryStringParameters;
    if (action === 'list') {
      const message = 'change_file';
      await dropbox.list(event, message);
    } else if (action === 'sync') {
      const message = 'create_{{dir}}_{{extension}}_file';
      await dropbox.sync(event, message);
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
