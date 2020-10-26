const dotenv = require('dotenv').config();
const getSlug = require('speakingurl');
const features = require('../../methods/features');
const messages = require('../../methods/messages');
const stravaLib = require('../../libs/strava');
const dropboxLib = require('../../libs/dropbox');
const coordinatesLib = require('../../libs/coordinates');

const saveGpx = async (gpx, name, gpxFile) => {
  const cleanFileName = getSlug(name, {
    maintainCase: true,
  });
  const path = `/features/segments/${cleanFileName}.gpx`;
  if (path !== gpxFile) {
    if (gpxFile) {
      await dropboxLib.delete(gpxFile);
    }
    await dropboxLib.upload(gpx, path);
  }
  return path;
};

const createFeature = async (segment, geoJson, gpxFile, bounds) => {
  if (geoJson) {
    const {
      id,
      name,
      distance,
      average_grade: averageGrade,
      maximum_grade: maximumGrade,
      elevation_high: elevationHigh,
      elevation_low: elevationLow,
      start_latlng: startLatLng,
      end_latlng: endLatLng,
    } = segment;
    const start = await coordinatesLib.location(startLatLng[0], startLatLng[1]);
    const { city, state, country } = start.address;
    const feature = {
      name,
      type: 'segment',
      source: 'strava',
      foreignKey: id,
      city,
      state,
      country,
      meta: {
        distance,
        averageGrade,
        maximumGrade,
        elevationHigh,
        elevationLow,
        startLatLng,
        endLatLng,
      },
      geoJson,
      gpxFile,
      minCoords: {
        lat: parseFloat(bounds.minLat.toFixed(6)),
        lon: parseFloat(bounds.minLng.toFixed(6)),
      },
      maxCoords: {
        lat: parseFloat(bounds.maxLat.toFixed(6)),
        lon: parseFloat(bounds.maxLng.toFixed(6)),
      },
    };
    return features.create(feature);
  }
  return false;
}

const processSegments = async (event, message) => {
  const segment = JSON.parse(event.body);
  const {
    id,
    name,
  } = segment;
  const url = `segments/${id}/streams?key_by_type=true&resolution=low`;
  const stream = await stravaLib.api(url);
  const points = stream.latlng.data.map((e, index) => [
    parseFloat(e[1].toFixed(6)),
    parseFloat(e[0].toFixed(6)),
  ]);
  const bounds = await coordinatesLib.geoLib({ points }, 'getBounds');
  const geoJson = await stravaLib.streams(stream, bounds, name, null, id, 'segment', 'geojson');
  const gpx = await stravaLib.streams(stream, bounds, name, null, id, 'segments', 'gpx');
  const gpxFile = await saveGpx(gpx, name);
  if (geoJson) {
    await createFeature(segment, geoJson, gpxFile, bounds);
  }
  await messages.create(event, { foreignKey: id, app: 'strava', event: message });
}

module.exports = async (event, message) => {
  await processSegments(event, message);
  return {
    statusCode: 200,
    body: 'Ok',
  };
};
