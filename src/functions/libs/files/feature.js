const dotenv = require('dotenv').config();
const featureService = require('../../services/feature');

module.exports = async (event, file, coordinate) => {
  const {
    name,
    dateTimeOriginal,
    path_display: pathDisplay,
    imageWidth,
    imageHeight,
    size,
    sha1,
    url,
  } = file;
  const feature = {
    type: 'Feature',
    properties: {
      name,
      url,
      pathDisplay,
      dateTimeOriginal,
      imageWidth,
      imageHeight,
      size,
      sha1,
    },
    geometry: {
      type: 'Point',
      coordinates: coordinate,
    },
  };
  const featureCollection = {
    features: [
      feature,
    ],
    type: 'FeatureCollection',
  };
  await featureService.create(event, featureCollection, 'image', 'image');
};
