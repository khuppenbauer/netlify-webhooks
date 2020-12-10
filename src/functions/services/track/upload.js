const dotenv = require('dotenv').config();
const path = require('path');
const mime = require('mime-types');
const dropboxLib = require('../../libs/dropbox');
const coordinatesLib = require('../../libs/coordinates');
const files = require('../../methods/files');
const messages = require('../../methods/messages');
const File = require('../../models/file');
const Track = require('../../models/track');

const getPath = async (fileName, outtype) => {
  const mimeType = mime.lookup(`${fileName}.${outtype}`);
  const extension = mime.extension(mimeType);
  const newFileName = `${fileName}.${extension}`;
  return `/convert/${extension}/${newFileName}`;
};

const dropboxUpload = async (data, filePath) => {
  const existingFile = await File.find({
    path_display: filePath,
    status: 'sync',
  });
  if (existingFile.length > 0) {
    await dropboxLib.delete(filePath);
  }
  await dropboxLib.upload(data, filePath);
}

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
  const geoJsonSmall = await coordinatesLib.toGeoJson(content);
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
  }
  const trackData = {
    gpxFileSmall: filePath,
    geoJsonSmall,
  }
  await Track.findByIdAndUpdate(track, trackData);
  const messageObject = {
    ...event,
    body: JSON.stringify(body),
  };
  await messages.create(messageObject, { foreignKey: track, app: 'messageQueue', event: message });
  await files.create(event, metaData);
  await dropboxUpload(content, filePath);
};
