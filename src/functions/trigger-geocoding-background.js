const dayjs = require('dayjs');
const mongoose = require('mongoose');
const db = require('./database/mongodb');
const File = require('./models/file');
const Track = require('./models/track');
const sentry = require('./libs/sentry');
const logs = require('./methods/logs');
const filesLib = require('./libs/files');

const getCoords = async (date) => {
  const dayjsDate = dayjs(date);
  let time;
  const filter = {
    startTime: {
      $lte: date,
    },
    endTime: {
      $gte: date,
    },
  };
  const track = await Track.find(filter);
  if (track[0]) {
    const { geoJson } = track[0];
    if (geoJson) {
      const { properties, geometry } = geoJson.features[0];
      const { coordTimes } = properties;
      const { coordinates } = geometry;
      time = coordTimes.filter((el) => el >= dayjsDate.toJSON());
      if (time[0]) {
        const index = coordTimes.indexOf(time[0]);
        return coordinates[index];
      }
      const { endCoords } = track[0];
      const { lat, lon } = endCoords;
      return [lon, lat];
    }
  } else {
    const day = dayjsDate.format('YYYY-MM-DD');
    const nextDay = dayjsDate.add(1, 'day').format('YYYY-MM-DD');
    const dayFilter = {
      startTime: {
        $gte: day,
      },
      endTime: {
        $lte: nextDay,
      },
    };
    const dayTracks = await Track.find(dayFilter);
    if (dayTracks.length > 0) {
      const dateDiff = {};
      dayTracks.map((dayTrack) => {
        const {
          startTime,
          endTime,
          startCoords,
          endCoords,
        } = dayTrack;
        const startDiff = dayjsDate.diff(dayjs(startTime));
        const endDiff = dayjsDate.diff(dayjs(endTime));
        dateDiff[Math.abs(startDiff)] = [startCoords.lon, startCoords.lat];
        dateDiff[Math.abs(endDiff)] = [endCoords.lon, endCoords.lat];
      });
      return Object.values(dateDiff)[0];
    }
  }
  return false;
};

const handler = async (event) => {
  const startTime = new Date().getTime();
  if (event.httpMethod === 'POST') {
    const filter = {
      folder: '/images',
      coords: {
        $exists: false,
      },
    };
    const files = await File.find(filter);
    await files.reduce(async (lastPromise, file) => {
      const accum = await lastPromise;
      const {
        dateTimeOriginal,
        _id: id,
      } = file;
      if (dateTimeOriginal) {
        const coordinate = await getCoords(dateTimeOriginal);
        if (coordinate) {
          const coords = {
            lat: coordinate[1],
            lon: coordinate[0],
          };
          await File.findByIdAndUpdate(id, { coords });
          await filesLib.feature(file, coordinate);
        }
      }
      return [...accum];
    }, Promise.resolve([]));
    await logs.create(event, { startTime, status: 200 });
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
