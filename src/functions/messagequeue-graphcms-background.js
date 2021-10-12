const sentry = require('./libs/sentry');
const messages = require('./methods/messages');
const graphcms = require('./libs/graphcms');
const Track = require('./models/track');

const handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const { type, action } = event.queryStringParameters;
    const data = JSON.parse(event.body);
    let message;
    let res;
    if (type === 'track') {
      message = `${action}_track`;
      res = await graphcms.track(data, action);
    } else if (type === 'file') {
      res = await graphcms.asset(data);
      const { folder, extension, source, url } = res;
      const dir = folder.replace('/', '');
      const { foreignKey } = source;
      const filter = { name: foreignKey };
      let update;
      if (folder === '/preview') {
        update = { staticImageUrl: url };
      } else if (folder === '/tracks') {
        if (extension === 'gpx') {
          update = { gpxFileUrl: url };
        } else if (extension === 'json') {
          update = { geoJsonFileUrl: url };
        }
      } else if (folder === '/convert/gpx') {
        update = { gpxFileSmallUrl: url };
      }
      await Track.findOneAndUpdate(filter, update);
      message = `upload_${dir}_${extension}_file`;
    } else if (type === 'segment') {
      message = 'add_segment';
      res = await graphcms.trail(data);
    } else if (type === 'collection') {
      message = 'update_collection';
      res = await graphcms.collection(data);
    }
    if (res) {
      const messageObject = {
        ...event,
        body: JSON.stringify(res),
      };
      await messages.create(messageObject, { foreignKey: data.path_display, app: 'graphcms', event: message });
    }
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
