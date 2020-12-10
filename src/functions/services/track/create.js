const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
const db = require('../../database/mongodb');
const coordinatesLib = require('../../libs/coordinates');
const messages = require('../../methods/messages');
const Track = require('../../models/track');

const cdnUrl = process.env.REACT_APP_FILE_BASE_URL;

module.exports = async (event, message) => {
  const data = JSON.parse(event.body);
  const { path_display } = data;
  const { name } = path.parse(path_display);
  const url = `${cdnUrl}${path_display}`;
  const geoJson = await coordinatesLib.toGeoJson(await (await axios.get(url)).data);
  const existingTrack = await Track.find({
    gpxFile: path_display,
  });
  const trackId = (existingTrack.length === 0) ? mongoose.Types.ObjectId() : existingTrack[0]._id;
  const track = {
    name,
    gpxFile: path_display,
    geoJson,
    _id: trackId,
  };
  if (existingTrack.length === 0) {
    await Track.create(track);
  } else {
    await Track.findByIdAndUpdate(trackId, track);
  }
  const messageObject = {
    ...event,
    body: JSON.stringify({
      name,
      gpxFile: path_display,
      track: trackId,
      origin: cdnUrl,
      url,
    }),
  };
  await messages.create(messageObject, { foreignKey: trackId, app: 'messageQueue', event: message });
};
