const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const File = require('../../models/file');
const Feature = require('../../models/feature');
const Message = require('../../models/message');
const messages = require('../../methods/messages');

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
      const messageData = {
        foreignKey: path_display,
        app: 'dropbox',
        event: message,
      }
      const existing = await Message.find(messageData);
      if (existing.length === 0) {
        await messages.create(messageObject, messageData);
      }
    }
    return [...accum, {}];
  }, Promise.resolve([]));
};

module.exports = async (event, message) => {
  const entries = JSON.parse(event.body);
  await processEntries(event, message, entries);
};
