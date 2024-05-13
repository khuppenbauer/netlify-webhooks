const axios = require('axios');
const File = require('./models/file');
const Feature = require('./models/feature');
const dropbox = require('./services/dropbox');
const sentry = require('./libs/sentry');

const processEntries = async (event, message, entries) => {
  await Object.values(entries).reduce(async (lastPromise, entry) => {
    const accum = await lastPromise;
    const { tag, path_display } = entry;
    if (tag === 'deleted') {
      await File.deleteMany({ path_display });
      await Feature.deleteMany({ 'meta.pathDisplay': path_display });
    } else if (tag === 'file') {
      const messageObject = {
        ...event,
        body: JSON.stringify(entry),
      };
      await dropbox.sync(messageObject, message);
    }
    return [...accum, {}];
  }, Promise.resolve([]));
};

const handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const syncMessage = 'create_file';
    const entries = await dropbox.list(event);
    const entriesObject = JSON.parse(JSON.stringify(entries[0]).replace(/\.tag/gi, 'tag'));
    await processEntries(event, syncMessage, entriesObject);
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

exports.handler = sentry.wrapHandler(handler, {
  captureTimeoutWarning: false,
});
