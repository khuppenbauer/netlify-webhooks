const mongoose = require('mongoose');
const path = require('path');
const db = require('../../database/mongodb');
const messages = require('../../methods/messages');
const Track = require('../../models/track');

module.exports = async (event, message) => {
  const data = JSON.parse(event.body);
  const { path_display } = data;
  const { name } = path.parse(path_display);
  const existingTrack = await Track.find({
    gpxFile: path_display,
  });
  const trackId = (existingTrack.length === 0) ? mongoose.Types.ObjectId() : existingTrack[0]._id;
  const track = {
    name,
    gpxFile: path_display,
    _id: trackId,
  };
  if (existingTrack.length === 0) {
    await Track.create(track);
  } else {
    await Track.findByIdAndUpdate(trackId, track);
  }
  const messageObject = {
    ...event,
    body: JSON.stringify({ name, gpxFile: path_display, track: trackId }),
  };
  await messages.create(messageObject, { foreignKey: trackId, app: 'messageQueue', event: message });
};
