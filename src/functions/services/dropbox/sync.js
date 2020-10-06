const dotenv = require('dotenv').config();
const crypto = require('crypto');
const mime = require('mime-types');
const path = require('path');
const messages = require('../../methods/messages');
const download = require('./download');
const files = require('../../methods/files');

const replaceAll = async (str, mapObj) => {
  const regex = new RegExp(Object.keys(mapObj).join('|'), 'gi');
  return str.replace(regex, function(matched) {
    return mapObj[matched.toLowerCase()];
  });
};

const saveFile = async (event, message, data) => {
  const { path_display: pathDisplay, id, name } = data;
  const { dir } = path.parse(pathDisplay);
  const fileData = await download(id);
  const mimeType = mime.lookup(name);
  const extension = mime.extension(mimeType);
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
  };
  delete metaData['.tag'];
  const messageObject = {
    ...event,
    body: JSON.stringify(metaData),
  };
  await files.create({ ...metaData, fileData });
  const mapObj = { '{{dir}}': dir.replace('/', ''), '{{extension}}': extension };
  const eventMessage = await replaceAll(message, mapObj);
  await messages.create(messageObject, { foreignKey: id, app: 'dropbox', event: eventMessage });
}

module.exports = async (event, message) => {
  const data = JSON.parse(event.body);
  await saveFile(event, message, data);
  return data;
};
