const messages = require('./methods/messages');
const logs = require('./methods/logs');

exports.handler = async (event) => {
  const startTime = new Date().getTime();
  if (event.httpMethod === 'POST') {
    const data = JSON.parse(event.body);
    const { id: foreignKey, name, state } = data;
    await logs.create(event, { startTime, status: 200 });
    return messages.create(event, { foreignKey, app: 'netlify', event: `${name}_${state}` });
  }
  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};
