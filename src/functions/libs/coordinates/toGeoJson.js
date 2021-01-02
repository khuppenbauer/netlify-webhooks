const tj = require('@tmcw/togeojson');
const { DOMParser } = require('xmldom');

module.exports = async (data, type) => {
  const xml = new DOMParser().parseFromString(data, 'text/xml');
  const { nodeName } = xml.documentElement;
  if (nodeName === 'gpx') {
    const geoJson = tj.gpx(xml);
    geoJson.features[0].properties.color = 'red';
    geoJson.features[0].properties.type = type;
    return geoJson;
  }
  if (nodeName === 'kml') {
    return tj.kml(xml);
  }
  return false;
};
