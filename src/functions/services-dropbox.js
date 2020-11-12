const crypto = require('crypto');
const dropbox = require('./services/dropbox');
const Message = require('./models/message');
const messages = require('./methods/messages');

const chunk = 50;

const createMessage = async (event, message, entries) => {
  const body = JSON.stringify(entries).replace(/\.tag/gi, 'tag');
  const messageObject = {
    ...event,
    body,
  };
  const foreignKey = crypto
    .createHash('sha1')
    .update(body)
    .digest('hex');
  const messageData = {
    foreignKey,
    app: 'dropbox',
    event: message,
  };
  const existing = await Message.find(messageData);
  if (existing.length === 0) {
    await messages.create(messageObject, messageData);
  }
}

const chunkEntries = async (event, parseMessage, processMessage, entries) => {
  if (entries.length < chunk) {
    const entriesObject = JSON.stringify(entries[0]).replace(/\.tag/gi, 'tag');
    return dropbox.process({ ...event, body: entriesObject }, processMessage);
  }
  let i;
  let j;
  let chunkArray;
  for (i = 0, j = entries.length; i < j; i += chunk) {
    chunkArray = entries.slice(i, i + chunk);
    createMessage(event, parseMessage, chunkArray);
  }
  return true;
};

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const { action } = event.queryStringParameters;
    const parseMessage = 'parse_changes';
    const processMessage = 'change_file';
    const syncMessage = 'create_file';
    if (action === 'list') {
      const entries = await dropbox.list(event);
      await chunkEntries(event, parseMessage, processMessage, entries);
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
