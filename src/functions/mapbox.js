const dotenv = require('dotenv').config();
const crypto = require('crypto');
const path = require('path');
const fileType = require('file-type');
const axios = require('axios');
const files = require('./methods/files');
const Track = require('./models/track');

const getGeoJson = async (event) => {
  const gpsbabelBaseUrl = process.env.GPS_BABEL_FUNCTIONS_API_BASE_URL;
  const cdnUrl = process.env.NETLIFY_CDN_URL;

  const body = JSON.parse(event.body);
  const { path_display } = body;
  const outtype = 'geojson';
  const count = 100;

  const params = [
    `infile=${cdnUrl}${path_display}`,
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

const createStaticImage = async (event) => {
  const body = JSON.parse(event.body);
  const { name, track } = body;
  const geoJson = await getGeoJson(event);
  const mapboxBaseUrl = 'https://api.mapbox.com/styles/v1/';
  const mapboxApiAccessToken = process.env.MAPBOX_API_ACCESS_TOKEN;
  const mapboxStyle = 'mapbox/satellite-streets-v11';
  const imageSize = '640x480';
  const coordinates = geoJson.features[0].geometry.coordinates;
  const lineString = {
    type: 'LineString',
    coordinates,
  };
  const pathParams = [
    mapboxStyle,
    'static',
    `geojson(${JSON.stringify(lineString)})`,
    'auto',
    imageSize,
  ];
  const url = `${mapboxBaseUrl}${encodeURI(pathParams.join('/'))}?access_token=${mapboxApiAccessToken}`;
  const data = await axios
    .get(url, {
      responseType: 'arraybuffer',
    })
    .then((response) => Buffer.from(response.data, 'binary'));
  const sha1 = crypto
    .createHash('sha1')
    .update(data)
    .digest('hex');
  const { name: fileName } = path.parse(name);
  const { ext: extension, mime: mimeType } = await fileType.fromBuffer(data);
  const size = Buffer.byteLength(data, 'utf8');
  const newFileName = `${fileName}.${extension}`;
  const metaData = {
    name: newFileName,
    path_lower: `preview/${newFileName}`.toLocaleLowerCase(),
    path_display: `preview/${newFileName}`,
    foreignKey: newFileName,
    mimeType,
    extension,
    size,
    sha1,
    track,
  };
  await Track.findByIdAndUpdate(track, { staticImage: `preview/${newFileName}` });
  await files.create(data.toString('base64'), metaData, event);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': mimeType,
    },
    body: data,
  };
};

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    return createStaticImage(event);
  }
  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};
