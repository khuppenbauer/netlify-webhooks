const crypto = require('crypto');
const mime = require('mime-types');
const path = require('path');
const exifr = require('exifr');
const dropboxLib = require('../../libs/dropbox');
const filesLib = require('../../libs/files');
const files = require('../../methods/files');

const saveFile = async (event, message, data) => {
  const { id, name, path_display } = data;

  const mimeType = mime.lookup(name);
  const extension = mime.extension(mimeType);
  const isImage = mimeType.startsWith('image');
  let fileData;
  let externalUrl;
  let imageData;
  let coordinate;
  let coords;

  if (isImage) {
    externalUrl = await dropboxLib.link(id);
    fileData = await filesLib.data(externalUrl, 'binary');
    const exif = await exifr.parse(fileData);
    if (exif) {
      const {
        DateTimeOriginal: dateTimeOriginal,
        ExifImageWidth: imageWidth,
        ExifImageHeight: imageHeight,
        latitude,
        longitude,
      } = exif;
      if (latitude && longitude) {
        const lat = parseFloat(latitude.toFixed(6));
        const lon = parseFloat(longitude.toFixed(6));
        coordinate = [lon, lat];
        coords = {
          lat,
          lon,
        };
      }
      imageData = {
        dateTimeOriginal,
        imageWidth,
        imageHeight,
        ...coords,
      };
    }
  } else {
    fileData = await dropboxLib.download(id);
  }

  const sha1 = crypto
    .createHash('sha1')
    .update(fileData)
    .digest('hex');

  const { dir: folder } = path.parse(path_display);
  const metaData = {
    ...data,
    foreignKey: id,
    mimeType,
    extension,
    sha1,
    externalUrl,
    folder,
    ...imageData,
    status: 'sync',
  };
  await files.create(event, metaData, message);
  if (coordinate) {
    await filesLib.feature(metaData, coordinate);
  }
}

module.exports = async (event, message) => {
  const data = JSON.parse(event.body);
  await saveFile(event, message, data);
};
