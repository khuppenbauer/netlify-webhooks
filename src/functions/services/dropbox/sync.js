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

  if (isImage) {
    externalUrl = await dropboxLib.link(id);
    fileData = await filesLib.data(externalUrl, 'binary');
    const exif = await exifr.parse(fileData);
    const {
      DateTimeOriginal: dateTimeOriginal,
      ExifImageWidth: imageWidth,
      ExifImageHeight: imageHeight,
    } = exif;
    imageData = {
      dateTimeOriginal,
      imageWidth,
      imageHeight,
    };
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
  };
  await files.create(event, message, metaData);
}

module.exports = async (event, message) => {
  const data = JSON.parse(event.body);
  await saveFile(event, message, data);
};
