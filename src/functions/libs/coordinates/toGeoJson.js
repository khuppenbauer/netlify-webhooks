const tj = require('@tmcw/togeojson');
const { DOMParser } = require('xmldom');

module.exports = async (data) => {
  const xml = new DOMParser().parseFromString(data, 'text/xml');
  const { nodeName } = xml.documentElement;
  if (nodeName === 'gpx') {
    let geoJson = tj.gpx(xml);
    geoJson.features[0].properties.color = 'red';
    return geoJson;
  } else if (nodeName === 'kml') {
    return tj.kml(xml);
  }
  return false;
};
