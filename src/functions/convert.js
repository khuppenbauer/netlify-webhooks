const dotenv = require('dotenv').config();
const path = require('path');
const mime = require('mime-types');
const axios = require('axios');
const dropbox = require('./methods/dropbox');
const messages = require('./methods/messages');
const Track = require('./models/track');
const File = require('./models/file');

const gpsbabelBaseUrl = process.env.GPS_BABEL_FUNCTIONS_API_BASE_URL;
const cdnUrl = process.env.NETLIFY_CDN_URL;

const convert = async (gpxFile, outtype, distance, count, error) => {
  const params = [
    `infile=${cdnUrl}${gpxFile}`,
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
  if (typeof res.data === 'object') {
    return JSON.stringify(res.data);
  }
  return res.data;
};

const getPath = async (name, fileNamePostfix, outtype) => {
  const { name: fileName } = path.parse(name);
  const mimeType = mime.lookup(`${fileName}.${outtype}`);
  const extension = mime.extension(mimeType);
  const postfix = fileNamePostfix ? `_${fileNamePostfix}` : '';
  const newFileName = `${fileName}${postfix}.${extension}`;
  return `/convert/${extension}/${newFileName}`;
};

const dropboxUpload = async (data, filePath) => {
  const existingFile = await File.find({
    path_display: filePath,
  });
  if (existingFile.length > 0) {
    await dropbox.delete(filePath);
  }
  await dropbox.upload(data, filePath);
}

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const {
      outtype,
      distance,
      count,
      error,
      fileNamePostfix,
    } = event.queryStringParameters;
    const body = JSON.parse(event.body);
    const { gpxFile, name, track } = body;
    const message = 'convert_{{outtype}}';

    const data = await convert(gpxFile, outtype, distance, count, error);
    const filePath = await getPath(name, fileNamePostfix, outtype);
    await dropboxUpload(data, filePath);

    let messageBody = body;
    if (outtype === 'geojson') {
      await Track.findByIdAndUpdate(track, { geoJsonFile: filePath, geoJson: JSON.parse(data) });
      messageBody = {
        ...body,
        geoJsonFile: filePath,
      };
    }
    const messageObject = {
      ...event,
      body: JSON.stringify({ ...messageBody, path: filePath }),
    };
    await messages.create(messageObject, { foreignKey: track, app: 'messageQueue', event: message.replace(/{{outtype}}/gm, outtype) });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: messageObject.body,
    };
  }
  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};
