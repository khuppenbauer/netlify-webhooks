const mongoose = require('mongoose');
const db = require('./database/mongodb');
const File = require('./models/file');
const sentry = require('./libs/sentry');
const messages = require('./methods/messages');
const filesLib = require('./libs/files');
const coordinatesLib = require('./libs/coordinates');

const handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const message = 'update_file';
    const data = JSON.parse(event.body);
    const record = await File.findById(data._id);
    const {
      dateTimeOriginal,
      path_display: pathDisplay,
      _id: id,
    } = record;
    if (dateTimeOriginal) {
      const coordinate = await coordinatesLib.geocoding(dateTimeOriginal);
      if (coordinate) {
        const coords = {
          lat: coordinate[1],
          lon: coordinate[0],
        };
        await File.findByIdAndUpdate(id, { coords });
        const messageObject = {
          ...event,
          body: JSON.stringify({ _id: id, path_display: pathDisplay }),
        };
        await messages.create(messageObject, { foreignKey: pathDisplay, app: 'messageQueue', event: message });
        await filesLib.feature(event, data, coordinate);
      }
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

exports.handler = sentry.wrapHandler(handler, {
  captureTimeoutWarning: false,
});
