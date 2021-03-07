const dotenv = require('dotenv').config();
const path = require('path');
const mime = require('mime-types');
const dropbox = require('../dropbox');
const coordinatesLib = require('../../libs/coordinates');
const features = require('../../methods/features');
const files = require('../../methods/files');
const messages = require('../../methods/messages');
const Track = require('../../models/track');

const getPath = async (fileName, outtype) => {
  const mimeType = mime.lookup(`${fileName}.${outtype}`);
  const extension = mime.extension(mimeType);
  const newFileName = `${fileName}.${extension}`;
  return `/convert/${extension}/${newFileName}`;
};

const createFeature = async (event, track, geoJson) => {
  const {
    name,
    startCity: city,
    startState: state,
    startCountry: country,
    minCoords,
    maxCoords,
    distance,
    startCoords: startLatLng,
    endCoords: endLatLng,
    elevLow: elevationLow,
    elevHigh: elevationHigh,
    totalElevationGain,
    totalElevationLoss,
    startElevation,
    endElevation,
    _id: foreignKey,
  } = track;
  const feature = {
    name,
    type: 'track',
    source: 'gpx',
    foreignKey,
    city,
    state,
    country,
    meta: {
      distance,
      elevationHigh,
      elevationLow,
      startLatLng,
      endLatLng,
      totalElevationGain,
      totalElevationLoss,
      startElevation,
      endElevation,
    },
    geoJson,
    minCoords,
    maxCoords,
  };
  return features.create(event, feature);
};

module.exports = async (event, message) => {
  const { event: data, content } = JSON.parse(event.body);
  const { body, params } = data;
  const { outtype } = params;
  const count = params.count || '';
  const distance = params.distance || '';
  const error = params.error || '';
  const { name, track } = body;
  const fileName = `${name}_${count}_${distance}${error}`;
  const filePath = await getPath(fileName, outtype);
  const { base } = path.parse(filePath);
  const geoJson = await coordinatesLib.toGeoJson(content, 'track');
  const { geometry } = geoJson.features[0];
  const { coordinates } = geometry;
  const elevation = await coordinatesLib.elevation(coordinates);
  const existingTrack = await Track.findById(track);
  const feature = await createFeature(event, existingTrack, geoJson);
  const source = {
    name: 'gpsbabel',
    foreignKey: name,
    type: `${outtype}_${count}_${distance}${error}`,
    params,
  };
  const metaData = {
    name: base,
    path_display: filePath,
    source,
  };
  const trackData = {
    gpxFileSmall: filePath,
    geoJson,
    ...elevation,
  };
  await Track.findByIdAndUpdate(track, trackData);
  const messageObject = {
    ...event,
    body: JSON.stringify(body),
  };
  await messages.create(messageObject, { foreignKey: track, app: 'messageQueue', event: message });
  await files.create(event, metaData);
  await dropbox.upload(content, filePath);
};
