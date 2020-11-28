const xmlBuilder = require('xmlbuilder');
const dayJs = require('dayjs');
const utc = require('dayjs/plugin/utc');

dayJs.extend(utc);

const streamToGpx = async (stream, bounds, name, startTime, foreignKey, resource) => {
  const gpx = xmlBuilder
    .create('gpx', {
      encoding: 'UTF-8',
    })
    .att('creator', 'StravaGPX Android')
    .att('version', '1.1')
    .att('xmlns', 'http://www.topografix.com/GPX/1/1')
    .att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
    .att('xsi:schemaLocation', 'http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd');

  const metadata = gpx.ele('metadata');
  metadata.ele('name', name);
  metadata
    .ele('link')
    .att('href', `https://www.strava.com/${resource}/${foreignKey}`);
  metadata
    .ele('bounds')
    .att('minlat', bounds.minLat.toFixed(6))
    .att('minlon', bounds.minLng.toFixed(6))
    .att('maxlat', bounds.maxLat.toFixed(6))
    .att('maxlon', bounds.maxLng.toFixed(6));
  metadata.ele('keywords', `${resource}:${foreignKey}`);
  if (startTime) {
    metadata.ele('time', startTime);
  }

  const trk = gpx.ele('trk');
  if (name) {
    trk.ele('name', name);
  }

  const trkseg = trk.ele('trkseg');

  stream.latlng.data.map((e, index) => {
    const trkpt = trkseg
      .ele('trkpt')
      .att('lat', e[0].toFixed(6))
      .att('lon', e[1].toFixed(6));
    trkpt.ele('ele', stream.altitude.data[index]);
    if (startTime) {
      const time = dayJs(startTime).add(stream.time.data[index], 's');
      trkpt.ele('time', time.utc().format());
    }
  });
  return gpx.end({
    allowEmpty: true,
    indent: '  ',
    newline: '\n',
    pretty: true,
  });
}

const streamToGeoJson = async (stream, bounds, name) => {
  const coordinates = stream.latlng.data.map((e, index) => [
    parseFloat(e[1].toFixed(6)),
    parseFloat(e[0].toFixed(6)),
    stream.altitude.data[index],
  ]);
  const {
    minLat,
    minLng,
    maxLat,
    maxLng,
  } = bounds;
  const geoJson = {
    features: [
      {
        type: 'Feature',
        bbox: [minLng, minLat, maxLng, maxLat],
        geometry: {
          type: 'LineString',
          coordinates,
        },
        properties: {
          name,
        },
      },
    ],
    type: 'FeatureCollection',
  };
  return geoJson;
};

module.exports = async (stream, bounds, name, startTime, foreignKey, resource, type) => {
  if (type === 'gpx') {
    return streamToGpx(stream, bounds, name, startTime, foreignKey, resource);
  }
  return streamToGeoJson(stream, bounds, name);
};
