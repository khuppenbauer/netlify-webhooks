const dotenv = require('dotenv').config();

const mapboxApiAccessToken = process.env.MAPBOX_API_ACCESS_TOKEN;
const mapboxBaseUrl = 'https://api.mapbox.com/styles/v1/';
const mapboxStyle = 'mapbox/satellite-streets-v11';
const imageSize = '640x480';
const stroke = '#ff3300';
const strokeWidth = 3;

module.exports = async (coords) => {
  const geoJsonString = {
    type: 'Feature',
    properties: {
      stroke,
      'stroke-width': strokeWidth,
    },
    geometry: {
      type: 'LineString',
      coordinates: coords,
    },
  };
  const pathParams = [
    mapboxStyle,
    'static',
    `geojson(${encodeURIComponent(JSON.stringify(geoJsonString))})`,
    'auto',
    imageSize,
  ];
  return `${mapboxBaseUrl}${pathParams.join('/')}?access_token=${mapboxApiAccessToken}`;
};
