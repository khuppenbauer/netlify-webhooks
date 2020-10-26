const stravaApi = require('./api');
const photos = require('../../methods/photos');
const Photo = require('../../models/photo');

const stravaImageSize = 800;

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

module.exports = async (event, activityId, foreignKey) => {
  const activityPhotos = await stravaApi(`activities/${foreignKey}/photos?size=${stravaImageSize}`);
  return processPhotos(event, activityId, activityPhotos);
};
