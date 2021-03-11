const getSlug = require('speakingurl');
const dayJs = require('dayjs');
const path = require('path');
const stravaApi = require('./api');
const photos = require('../../methods/photos');
const messages = require('../../methods/messages');
const files = require('../../methods/files');
const Photo = require('../../models/photo');
const Message = require('../../models/message');
const dropbox = require('../../services/dropbox');
const filesLib = require('../files');

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

const uploadUrl = async (event, name, url, imageWidth, imageHeight, dateTimeOriginal) => {
  const photoData = await filesLib.data(url, 'binary');
  const { base } = path.parse(url);
  const filePath = `/images/${base}`;
  const source = {
    name: 'strava',
    foreignKey: name,
    type: 'photo',
  };
  const metaData = {
    name: base,
    path_display: filePath,
    source,
    imageWidth,
    imageHeight,
    dateTimeOriginal,
  };
  await dropbox.upload(photoData, filePath);
  await files.create(event, metaData);
};

const processDropboxSync = async (event, foreignKey, activityPhotos) => {
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
    await uploadUrl(event, name, url, imageWidth, imageHeight, dateTimeOriginal);
    return [...accum, {}];
  }, Promise.resolve([]));
};

module.exports = async (event, activityId, foreignKey, dropboxSync) => {
  const activityPhotos = await stravaApi(`activities/${foreignKey}/photos?size=${stravaImageSize}`);
  if (dropboxSync) {
    await processDropboxSync(event, foreignKey, activityPhotos);
  }
  return processPhotos(event, activityId, activityPhotos);
};
