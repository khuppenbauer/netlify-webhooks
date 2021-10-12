const Elevation = require('./elevation');
const GeoFunctions = require('./geoFunctions');
const GeoLib = require('./geoLib');
const Location = require('./location');
const ToGeoJson = require('./toGeoJson');
const Geocoding = require('./geocoding');

module.exports = {
  elevation: Elevation,
  geoFunctions: GeoFunctions,
  geoLib: GeoLib,
  geocoding: Geocoding,
  location: Location,
  toGeoJson: ToGeoJson,
};
