const dotenv = require('dotenv').config();
const path = require('path');
const fileType = require('file-type');
const axios = require('axios');
const geolib = require('geolib');
const dropbox = require('../dropbox');
const mapboxLib = require('../../libs/mapbox');
const messages = require('../../methods/messages');
const files = require('../../methods/files');
const Track = require('../../models/track');
const File = require('../../models/file');
const request = require('../request');

const gpsbabelBaseUrl = process.env.GPS_BABEL_FUNCTIONS_API_BASE_URL;

const getGeoJson = async (gpxFile) => {
  const outtype = 'geojson';
  const count = 100;

  const params = [
    `infile=${gpxFile}`,
    `outtype=${outtype}`,
    `count=${count}`,
    'intype=gpx',
  ];
  const query = params.join('&');
  const url = `${gpsbabelBaseUrl}gpsbabel?${query}`;
  const startTime = new Date().getTime();
  let res;
  try {
    res = await axios({
      method: 'get',
      url,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    await request.log(res, startTime);
  } catch (error) {
    await request.log(error.response, startTime);
    throw error;
  }
  if (res.status !== 200) {
    return {};
  }
  return res.data;
};

const processImage = async (url, event, message, folder) => {
  const body = JSON.parse(event.body);
  const { name } = body;
  const data = await axios
    .get(url, {
      responseType: 'arraybuffer',
    })
    .then((response) => Buffer.from(response.data, 'binary'));
  const { name: fileName } = path.parse(name);
  const { ext: extension } = await fileType.fromBuffer(data);
  const filePath = `/${folder}/${fileName}.${extension}`;
  const source = {
    name: 'mapbox',
    foreignKey: name,
    type: `${folder}Image`,
  };
  const metaData = {
    name: `${fileName}.${extension}`,
    path_display: filePath,
    source,
    externalUrl: url,
  };
  await files.create(event, metaData);
  await dropbox.upload(data, filePath);
  return filePath;
};

module.exports = async (event, message) => {
  const body = JSON.parse(event.body);
  const { track, url } = body;
  const geoJson = await getGeoJson(url);
  const geoJsonFeature = geoJson.features
    .filter((feature) => feature.geometry.type === 'LineString')
    .reduce((prev, current) => {
      const prevDistance = prev ? geolib.getPathLength(prev.geometry.coordinates) : 0;
      const currentDistance = current ? geolib.getPathLength(current.geometry.coordinates) : 0;
      return (prevDistance > currentDistance) ? prev : current;
    });
  const previewImage = await mapboxLib.lineString(geoJsonFeature.geometry.coordinates);
  const previewImagePath = await processImage(previewImage, event, message, 'preview');

  const record = await Track.findById(track);
  const { minCoords, maxCoords } = record;
  const coords = [];
  coords.push(minCoords);
  coords.push(maxCoords);
  const overviewImage = await mapboxLib.polygon(coords);
  const overviewImagePath = await processImage(overviewImage, event, message, 'overview');

  await Track.findByIdAndUpdate(track, {
    previewImage: previewImagePath,
    overviewImage: overviewImagePath,
  });
};
