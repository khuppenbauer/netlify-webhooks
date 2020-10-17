const dropbox = require('./services/dropbox');

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const { action } = event.queryStringParameters;
    const parseMessage = 'parse_changes';
    const processMessage = 'change_file';
    const syncMessage = 'create_file';
    if (action === 'list') {
      await dropbox.list(event, parseMessage, processMessage);
    } else if (action === 'process') {
      await dropbox.process(event, processMessage);
    } else if (action === 'sync') {
      await dropbox.sync(event, syncMessage);
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
