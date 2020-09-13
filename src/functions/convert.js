const dotenv = require('dotenv').config();
const crypto = require('crypto');
const path = require('path');
const mime = require('mime-types');
const axios = require('axios');
const files = require('./methods/files');
const Track = require('./models/track');

const convertGeoJson = async (event) => {
  const gpsbabelBaseUrl = process.env.GPS_BABEL_FUNCTIONS_API_BASE_URL;
  const cdnUrl = process.env.NETLIFY_CDN_URL;
  const {
    outtype,
    distance,
    count,
    error,
    postfix,
  } = event.queryStringParameters;
  const body = JSON.parse(event.body);
  const { path_display, name, track } = body;

  const params = [
    `infile=${cdnUrl}${path_display}`,
    `outtype=${outtype}`,
  ];
  if (distance) {
    params.push(`distance=${distance}`);
  }
  if (error) {
    params.push(`error=${error}`);
  }
  if (count) {
    params.push(`count=${count}`);
  }
  const query = params.join('&');
  const url = `${gpsbabelBaseUrl}gpsbabel?${query}`;
  const res = await axios({
    method: 'get',
    url,
  });
  if (res.status !== 200) {
    return {};
  }
  const data = JSON.stringify(res.data);
  const { 'content-length': size } = res.headers;
  const { name: fileName } = path.parse(name);
  const mimeType = mime.lookup(`${fileName}.${outtype}`);
  const extension = mime.extension(mimeType);
  const filePostfix = postfix ? postfix : crypto
    .createHash('sha1')
    .update(query)
    .digest('hex');
  const sha1 = crypto
    .createHash('sha1')
    .update(data)
    .digest('hex');
  const newFileName = `${fileName}_${filePostfix.substring(0,6)}.${extension}`;
  const metaData = {
    ...body,
    name: newFileName,
    path_lower: `${extension}/${newFileName}`.toLocaleLowerCase(),
    path_display: `${extension}/${newFileName}`,
    foreignKey: newFileName,
    mimeType,
    extension,
    size,
    sha1,
    track,
  };
  if (extension === 'geojson') {
    await Track.findByIdAndUpdate(track, { geoJsonFile: `${extension}/${newFileName}` });
  }
  return files.create(data, metaData, event);
};

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    return convertGeoJson(event);
  }
  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};
