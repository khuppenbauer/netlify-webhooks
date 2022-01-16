const dotenv = require('dotenv').config();
const path = require('path');
const mime = require('mime-types');
const geolib = require('geolib');
const dropbox = require('../dropbox');
const coordinatesLib = require('../../libs/coordinates');
const features = require('../../methods/features');
const files = require('../../methods/files');
const messages = require('../../methods/messages');
const Track = require('../../models/track');

const colors = [
  '#9e0142',
  '#d53e4f',
  '#f46d43',
  '#fdae61',
  '#fee08b',
  '#e6f598',
  '#abdda4',
  '#66c2a5',
  '#3288bd',
  '#5e4fa2',
];

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
    date,
    distance,
    startCoords: startLatLng,
    endCoords: endLatLng,
    elevLow: elevationLow,
    elevHigh: elevationHigh,
    totalElevationGain,
    totalElevationLoss,
    startElevation,
    endElevation,
    previewImageUrl,
    overviewImageUrl,
    endCity,
    endState,
    endCountry,
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
      date,
      startCity: city,
      startState: state,
      startCountry: country,
      distance,
      elevationHigh,
      elevationLow,
      startLatLng,
      endLatLng,
      totalElevationGain,
      totalElevationLoss,
      startElevation,
      endElevation,
      previewImageUrl,
      overviewImageUrl,
      endCity,
      endState,
      endCountry,
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
  const geoJsonTrack = await coordinatesLib.toGeoJson(content, 'track');
  const geoJsonFeatures = geoJsonTrack.features
    .filter((feature) => feature.geometry.type === 'LineString')
    .map((featureItem, index) => {
      featureItem.properties.color = colors[index];
      return featureItem;
    });
  const geoJson = {
    features: geoJsonFeatures,
    type: 'FeatureCollection',
  };
  const geoJsonFeature = geoJsonFeatures.reduce((prev, current, index) => {
    current.index = index;
    const prevDistance = prev ? geolib.getPathLength(prev.geometry.coordinates) : 0;
    const currentDistance = current ? geolib.getPathLength(current.geometry.coordinates) : 0;
    return (prevDistance > currentDistance) ? prev : current;
  });
  const index = geoJsonFeature.index || 0;
  geoJson.features[index].properties.color = 'red';

  const { geometry } = geoJsonFeature;
  const { coordinates } = geometry;
  const elevation = await coordinatesLib.elevation(coordinates);
  const existingTrack = await Track.findById(track);
  await createFeature(event, existingTrack, geoJson);
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
  const trackObject = await Track.findByIdAndUpdate(track, trackData);
  const messageObject = {
    ...event,
    body: JSON.stringify({
      ...trackObject._doc,
      ...body,
    }),
  };
  await messages.create(messageObject, { foreignKey: track, app: 'messageQueue', event: message });
  await files.create(event, metaData);
  await dropbox.upload(content, filePath);
};
