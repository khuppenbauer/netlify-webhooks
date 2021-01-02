const dotenv = require('dotenv').config();
const featureService = require('../../services/feature');

const cdnUrl = process.env.REACT_APP_FILE_BASE_URL;

module.exports = async (file, coordinate) => {
  const {
    name,
    dateTimeOriginal,
    path_display: pathDisplay,
    imageWidth,
    imageHeight,
    size,
  } = file;
  const feature = {
    type: 'Feature',
    properties: {
      name,
      url: `${cdnUrl}${pathDisplay}`,
      pathDisplay,
      dateTimeOriginal,
      imageWidth,
      imageHeight,
      size,
    },
    geometry: {
      type: 'Point',
      coordinates: coordinate,
    },
  };
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const featureCollection = {
    features: [
      feature,
    ],
    type: 'FeatureCollection',
  };
  await featureService.create(featureCollection, 'image', 'image');
};
