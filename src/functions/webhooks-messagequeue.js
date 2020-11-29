const messages = require('./methods/messages');
const logs = require('./methods/logs');

exports.handler = async (event) => {
  const startTime = new Date().getTime();
  if (event.httpMethod === 'POST') {
    const data = JSON.parse(event.body);
    await logs.create(event, { startTime, status: 200 });

    const messageObject = {
      ...event,
      body: JSON.stringify(data.data),
    };
    const messageData = {
      foreignKey: data.foreignKey,
      app: data.app,
      event: data.event,
    };
    return messages.create(messageObject, messageData);
  }
  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};
