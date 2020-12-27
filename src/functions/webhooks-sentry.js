const dotenv = require('dotenv').config();
const Message = require('./models/message');
const messages = require('./methods/messages');

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body);
    const { event: data } = body;
    const {
      event_id: foreignKey,
      level,
      type,
      contexts,
      title,
    } = data;
    const { body: eventBody, path, queryStringParameters } = contexts.event;
    const eventData = JSON.parse(eventBody);
    const { message } = eventData;
    if (message) {
      const existingMessage = await Message.findById(message);
      const messageData = existingMessage.message !== undefined ? existingMessage.message : [];
      const status = level;
      messageData.push({
        subscription: {
          path,
          queryStringParameters,
        },
        error: title,
      });
      const messageObject = {
        ...event,
        body: JSON.stringify({ status, statusText: title, message: messageData }),
      };
      await messages.update(messageObject, message);
    }
    const msgObject = {
      ...event,
      body: JSON.stringify({ id: body.id, url: body.url, event_id: foreignKey }),
    }
    return messages.create(msgObject, { foreignKey, app: 'sentry', event: `${level}_${type}` });
  }
  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};
