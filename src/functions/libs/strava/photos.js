const getSlug = require('speakingurl');
const dayJs = require('dayjs');
const stravaApi = require('./api');
const photos = require('../../methods/photos');
const messages = require('../../methods/messages');
const Photo = require('../../models/photo');
const Message = require('../../models/message');

const stravaImageSize = 1024;

const processPhotos = async (event, activityId, activityPhotos) => {
  const activityPhotosUrl = activityPhotos.reduce(
    (acc, item) => (acc[item.unique_id] = item.urls[stravaImageSize], acc),
    {},
  );

  const existingPhotos = await Photo.find({
    activity: activityId,
  });

  existingPhotos.map((existingPhoto) => {
    if (!activityPhotosUrl[existingPhoto.foreignKey]) {
      photos.delete(event, existingPhoto._id);
    }
  });

  activityPhotos.map((activityPhoto) => (
    photos.create(event, {
      activity: activityId,
      foreignKey: activityPhoto.unique_id,
      url: activityPhoto.urls[stravaImageSize],
      shootingDate: activityPhoto.created_at,
    })
  ));
  return activityPhotosUrl;
};

const getName = async (foreignKey) => {
  const activityData = await stravaApi(`activities/${foreignKey}`);
  const { name, start_date: startTime } = activityData;
  const fileName = `${dayJs(startTime).format('YYYY-MM-DD')}-${name}`;
  return getSlug(fileName, {
    maintainCase: true,
  });
};

const processDropboxSync = async (event, foreignKey, activityPhotos, processMessage) => {
  const name = await getName(foreignKey);
  await activityPhotos.reduce(async (lastPromise, activityPhoto) => {
    const accum = await lastPromise;
    const {
      unique_id: id,
      urls,
      sizes,
      created_at: dateTimeOriginal,
    } = activityPhoto;
    const url = urls[stravaImageSize];
    const imageWidth = sizes[stravaImageSize][0];
    const imageHeight = sizes[stravaImageSize][1];
    const messageObject = {
      ...event,
      body: JSON.stringify({
        name,
        url,
        imageWidth,
        imageHeight,
        dateTimeOriginal,
      }),
    };
    const messageData = {
      foreignKey: id,
      app: 'messageQueue',
      event: processMessage,
    };
    const existing = await Message.find(messageData);
    if (existing.length === 0) {
      await messages.create(messageObject, messageData);
    }
    return [...accum, {}];
  }, Promise.resolve([]));
};

module.exports = async (event, activityId, foreignKey, dropboxSync, processMessage) => {
  const activityPhotos = await stravaApi(`activities/${foreignKey}/photos?size=${stravaImageSize}`);
  if (dropboxSync) {
    await processDropboxSync(event, foreignKey, activityPhotos, processMessage);
  }
  return processPhotos(event, activityId, activityPhotos);
};
