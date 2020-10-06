const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const messages = require('../../methods/messages');
const Track = require('../../models/track');

module.exports = async (event, message) => {
  const data = JSON.parse(event.body);
  const { name, path_display: pathDisplay } = data;

  const existingTrack = await Track.find({
    gpxFile: pathDisplay,
  });
  const trackId = (existingTrack.length === 0) ? mongoose.Types.ObjectId() : existingTrack[0]._id;
  const track = {
    name,
    gpxFile: pathDisplay,
    _id: trackId,
  };
  if (existingTrack.length === 0) {
    await Track.create(track);
  } else {
    await Track.findByIdAndUpdate(trackId, track);
  }
  const messageObject = {
    ...event,
    body: JSON.stringify({ name, gpxFile: pathDisplay, track: trackId }),
  };
  await messages.create(messageObject, { foreignKey: trackId, app: 'messageQueue', event: message });
};
