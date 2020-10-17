const dotenv = require('dotenv').config();
const path = require('path');
const fileType = require('file-type');
const axios = require('axios');
const dropboxLib = require('../../libs/dropbox');
const messages = require('../../methods/messages');
const Track = require('../../models/track');
const File = require('../../models/file');

const gpsbabelBaseUrl = process.env.GPS_BABEL_FUNCTIONS_API_BASE_URL;
const cdnUrl = process.env.NETLIFY_CDN_URL;
const mapboxApiAccessToken = process.env.MAPBOX_API_ACCESS_TOKEN;
const mapboxBaseUrl = 'https://api.mapbox.com/styles/v1/';
const mapboxStyle = 'mapbox/satellite-streets-v11';
const imageSize = '640x480';
const stroke = '#ff3300';
const strokeWidth = 3;

const getGeoJson = async (gpxFile) => {
  const outtype = 'geojson';
  const count = 100;

  const params = [
    `infile=${cdnUrl}${gpxFile}`,
    `outtype=${outtype}`,
    `count=${count}`,
  ];
  const query = params.join('&');
  const url = `${gpsbabelBaseUrl}gpsbabel?${query}`;
  const res = await axios({
    method: 'get',
    url,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status !== 200) {
    return {};
  }
  return res.data;
};

const createImage = async (geoJson) => {
  const geoJsonString = {
    type: 'Feature',
    properties: {
      stroke,
      'stroke-width': strokeWidth,
    },
    geometry: {
      type: 'LineString',
      coordinates: geoJson.features[0].geometry.coordinates,
    },
  };
  const pathParams = [
    mapboxStyle,
    'static',
    `geojson(${encodeURIComponent(JSON.stringify(geoJsonString))})`,
    'auto',
    imageSize,
  ];
  const url = `${mapboxBaseUrl}${pathParams.join('/')}?access_token=${mapboxApiAccessToken}`;
  return axios
    .get(url, {
      responseType: 'arraybuffer',
    })
    .then((response) => Buffer.from(response.data, 'binary'));
}

const dropboxUpload = async (data, filePath) => {
  const existingFile = await File.find({
    path_display: filePath,
  });
  if (existingFile.length > 0) {
    await dropboxLib.delete(filePath);
  }
  await dropboxLib.upload(data, filePath);
}

module.exports = async (event, message) => {
  const body = JSON.parse(event.body);
  const { gpxFile, name, track } = body;
  const geoJson = await getGeoJson(gpxFile);
  const data = await createImage(geoJson);
  const { name: fileName } = path.parse(name);
  const { ext: extension } = await fileType.fromBuffer(data);
  const filePath = `/preview/${fileName}.${extension}`;
  await dropboxUpload(data, filePath);
  await Track.findByIdAndUpdate(track, { staticImage: filePath });
  const messageObject = {
    ...event,
    body: JSON.stringify({ ...body, staticImage: filePath, path: filePath }),
  };
  await messages.create(messageObject, { foreignKey: track, app: 'messageQueue', event: message });
};
