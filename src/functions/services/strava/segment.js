const dotenv = require('dotenv').config();
const getSlug = require('speakingurl');
const features = require('../../methods/features');
const files = require('../../methods/files');
const stravaLib = require('../../libs/strava');
const dropboxLib = require('../../libs/dropbox');
const coordinatesLib = require('../../libs/coordinates');

const getFileName = async (name) => {
  return getSlug(name, {
    maintainCase: true,
  });
}

const createFile = async (event, fileName, path) => {
  const source = {
    name: 'strava',
    foreignKey: fileName,
    type: 'segment',
  };
  const metaData = {
    name: `${fileName}.gpx`,
    path_display: path,
    source,
  };
  await files.create(event, metaData);
}

const createFeature = async (event, segment, geoJson, gpxFile, bounds) => {
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
    return features.create(event, feature);
  }
  return false;
}

const processSegment = async (event, segment, saveSegmentsGpx) => {
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
  let gpxFile;
  if (saveSegmentsGpx === 'true') {
    const fileName = await getFileName(name);
    const path = `/features/segments/${fileName}.gpx`;
    const gpx = await stravaLib.streams(stream, bounds, name, null, id, 'segments', 'gpx');
    await createFile(event, fileName, path);
    gpxFile = await dropboxLib.upload(gpx, path);
  }
  if (geoJson) {
    await createFeature(event, segment, geoJson, gpxFile, bounds);
  }
}

module.exports = async (event, segment, saveSegmentsGpx) => {
  await processSegment(event, segment, saveSegmentsGpx);
};
