const dotenv = require('dotenv').config();
const geolib = require('geolib');

const mapboxToken = process.env.MAPBOX_API_ACCESS_TOKEN;
const mapboxBaseUrl = 'https://api.mapbox.com/styles/v1/';
const mapboxStyle = 'khuppenbauer/ckrd352a31ffl18qit94pozv8';
const imageSize = '320x240';
const stroke = '#ff3300';
const strokeWidth = 2;
const fillOpacity = 0;

module.exports = async (coords) => {
  const bounds = geolib.getBounds(coords);
  const center = geolib.getCenterOfBounds(coords);
  const {
    minLat, minLng, maxLat, maxLng,
  } = bounds;
  const { latitude, longitude } = center;
  const geoJsonString = {
    type: 'Feature',
    properties: {
      stroke,
      'stroke-width': strokeWidth,
      'fill-opacity': fillOpacity,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [minLng, minLat],
          [maxLng, minLat],
          [maxLng, maxLat],
          [minLng, maxLat],
          [minLng, minLat],
        ],
      ],
    },
  };
  const pathParams = [
    mapboxStyle,
    'static',
    `geojson(${encodeURIComponent(JSON.stringify(geoJsonString))})`,
    `${longitude},${latitude},6`,
    imageSize,
  ];
  return `${mapboxBaseUrl}${pathParams.join('/')}?access_token=${mapboxToken}`;
};
