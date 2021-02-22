const messages = require('./methods/messages');
const logs = require('./methods/logs');

exports.handler = async (event) => {
  const startTime = new Date().getTime();
  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body);
    const { data } = body;
    const { name, __typename: type, stage } = data;
    await logs.create(event, { startTime, status: 200 });
    return messages.create(event, { foreignKey: name, app: 'graphcms', event: `${type}_${stage}` });
  }
  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};
