const crypto = require('crypto');
const mime = require('mime-types');
const dropboxLib = require('../../libs/dropbox');
const filesLib = require('../../libs/files');
const files = require('../../methods/files');

const saveFile = async (event, message, data) => {
  const { id, name } = data;

  const mimeType = mime.lookup(name);
  const extension = mime.extension(mimeType);
  const isImage = mimeType.startsWith('image');
  let fileData;
  let externalUrl;

  if (isImage) {
    externalUrl = await dropboxLib.link(id);
    fileData = await filesLib.data(externalUrl, 'binary');
  } else {
    fileData = await dropboxLib.download(id);
  }
  const sha1 = crypto
    .createHash('sha1')
    .update(fileData)
    .digest('hex');

  const metaData = {
    ...data,
    foreignKey: id,
    mimeType,
    extension,
    sha1,
    externalUrl,
  };
  await files.create(event, message, metaData);
}

module.exports = async (event, message) => {
  const data = JSON.parse(event.body);
  await saveFile(event, message, data);
};
