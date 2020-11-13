const path = require('path');
const Message = require('../../models/message');
const messages = require('../../methods/messages');

const replaceAll = async (str, mapObj) => {
  const regex = new RegExp(Object.keys(mapObj).join('|'), 'gi');
  return str.replace(regex, function(matched) {
    return mapObj[matched.toLowerCase()];
  });
};

const createMessage = async (event, message, data) => {
  const { extension, path_display } = data;
  const { dir } = path.parse(path_display);
  const mapObj = { '{{dir}}': dir.replace('/', ''), '{{extension}}': extension };
  const eventMessage = await replaceAll(message, mapObj);
  const existing = await Message.find({ foreignKey: path_display });
  if (existing.length === 0) {
    await messages.create(event, { foreignKey: path_display, app: 'netlify', event: eventMessage });
  }
};

module.exports = async (event, message, data) => {
  await createMessage(event, message, data);
};
