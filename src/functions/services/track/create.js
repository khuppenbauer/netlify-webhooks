const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
const dayjs = require('dayjs');
const db = require('../../database/mongodb');
const dropbox = require('../dropbox');
const coordinatesLib = require('../../libs/coordinates');
const files = require('../../methods/files');
const messages = require('../../methods/messages');
const tasks = require('../../methods/tasks');
const Track = require('../../models/track');

const saveGeoJson = async (name, geoJson, event) => {
  const filePath = `/tracks/${name}.json`;
  const source = {
    name: 'messageQueue',
    foreignKey: name,
    type: 'geoJson',
  };
  const metaData = {
    name: `${name}.json`,
    path_display: filePath,
    source,
  }
  await files.create(event, metaData);
  await dropbox.upload(geoJson, filePath);
  return filePath;
};

const getMetaData = async (geoJson) => {
  const { properties, geometry } = geoJson.features[0];
  const { coordinates } = geometry;
  const { time, coordTimes } = properties;
  const points = {
    points: coordinates,
  };
  const start = coordinates[0];
  const end = coordinates[coordinates.length - 1];
  const bounds = await coordinatesLib.geoLib(points, 'getBounds');
  const distance = await coordinatesLib.geoLib(points, 'getPathLength');
  const elevation = await coordinatesLib.elevation(coordinates);
  const startLocation = await coordinatesLib.location(start[1], start[0]);
  const endLocation = await coordinatesLib.location(end[1], end[0]);
  const { city: startCity, state: startState, country: startCountry } = startLocation;
  const { city: endCity, state: endState, country: endCountry } = endLocation;
  let dateTime = {};
  if (time && coordTimes) {
    dateTime = {
      date: time,
      startTime: coordTimes[0],
      endTime: coordTimes[coordTimes.length - 1],
    };
  }
  return {
    ...dateTime,
    distance,
    ...elevation,
    minCoords: {
      lat: parseFloat(bounds.minLat.toFixed(6)),
      lon: parseFloat(bounds.minLng.toFixed(6)),
    },
    maxCoords: {
      lat: parseFloat(bounds.maxLat.toFixed(6)),
      lon: parseFloat(bounds.maxLng.toFixed(6)),
    },
    startCoords: {
      lat: parseFloat(start[1].toFixed(2)),
      lon: parseFloat(start[0].toFixed(2)),
    },
    endCoords: {
      lat: parseFloat(end[1].toFixed(2)),
      lon: parseFloat(end[0].toFixed(2)),
    },
    startElevation: start[2] ? start[2].toFixed(0) : 0,
    endElevation: end[2] ? end[2].toFixed(0) : 0,
    startCity,
    startCountry,
    startState,
    endCity,
    endCountry,
    endState,
  };
};

module.exports = async (event, message) => {
  const data = JSON.parse(event.body);
  const { path_display: pathDisplay, url } = data;
  const { name } = path.parse(pathDisplay);
  let geoJson = await coordinatesLib.toGeoJson(await (await axios.get(url)).data, 'track');
  const lineString = geoJson.features.filter((feature) => feature.geometry.type === 'LineString');
  if (lineString.length === 1) {
    geoJson = {
      features: lineString,
      type: 'FeatureCollection',
    };
  }
  const metaData = await getMetaData(geoJson);
  const geoJsonFile = await saveGeoJson(name, geoJson, event);
  const existingTrack = await Track.find({
    gpxFile: pathDisplay,
  });
  const trackId = (existingTrack.length === 0) ? mongoose.Types.ObjectId() : existingTrack[0]._id;
  const track = {
    name,
    gpxFile: pathDisplay,
    gpxFileUrl: url,
    _id: trackId,
    ...metaData,
    geoJsonFile,
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
      gpxFile: pathDisplay,
      track: trackId,
      url,
    }),
  };
  await messages.create(messageObject, {
    foreignKey: trackId,
    app: 'messageQueue',
    event: message,
  });
  await tasks.create(messageObject, {
    foreignKey: trackId,
    app: 'messageQueue',
    event: 'update_track',
    executionTime: dayjs().add(5, 'minute').format(),
  });
  await tasks.create(messageObject, {
    foreignKey: trackId,
    app: 'messageQueue',
    event: 'finish_track',
    executionTime: dayjs().add(7, 'minute').format(),
  });
};
