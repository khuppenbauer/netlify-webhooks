const axios = require('axios');
const path = require('path');
const featureService = require('./services/feature');
const coordinatesLib = require('./libs/coordinates');
const sentry = require('./libs/sentry');

const parseData = async (event) => {
  const body = JSON.parse(event.body);
  const { url } = body;
  const { name } = path.parse(url);
  const geoJson = await coordinatesLib.toGeoJson(await (await axios.get(url)).data);
  await geoJson.features.reduce(async (lastPromise, feature) => {
    const accum = await lastPromise;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const featureCollection = {
      features: [
        feature,
      ],
      type: 'FeatureCollection',
    };
    await featureService.create(featureCollection, name, 'poi');
    return [...accum, {}];
  }, Promise.resolve([]));
};

const handler = async (event) => {
  if (event.httpMethod === 'POST') {
    await parseData(event);
    return {
      statusCode: 200,
      body: 'Ok',
    };
  }
  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};

exports.handler = sentry.wrapHandler(handler, {
  captureTimeoutWarning: false,
});
