const Track = require('./models/track');
const Feature = require('./models/feature');
const sentry = require('./libs/sentry');
const messages = require('./methods/messages');
const features = require('./methods/features');
const cloudinary = require('./libs/cloudinary');

const handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const message = 'upload_cloudinary_image';
    const data = JSON.parse(event.body);
    const { folder, source } = data;
    const { foreignKey } = source;
    const res = await cloudinary.upload(data);
    const { secure_url: url } = res;
    const filter = { name: foreignKey };
    const track = await Track.findOne(filter);
    const { _id: trackId } = track;
    let update;
    if (folder === '/preview') {
      update = { previewImageUrl: url };
    } else if (folder === '/overview') {
      update = { overviewImageUrl: url };
    }
    if (update) {
      await Track.findByIdAndUpdate(trackId, update);
      const feature = await Feature.findOne({ foreignKey: trackId });
      const { _id, meta: metaData } = feature;
      const meta = {
        ...metaData,
        ...update,
      };
      const featureObject = {
        body: JSON.stringify({ ...feature._doc, meta }),
      };
      await features.update(featureObject, _id);
    }
    if (res) {
      const messageObject = {
        ...event,
        body: JSON.stringify(res),
      };
      await messages.create(messageObject, { foreignKey, app: 'messageQueue', event: message });
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
