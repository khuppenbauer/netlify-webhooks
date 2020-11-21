const dotenv = require('dotenv').config();
const Pusher = require('pusher');

const pusherActive = process.env.REACT_APP_PUSHER_ACTIVE;
const appId = process.env.REACT_APP_PUSHER_APP_ID;
const key = process.env.REACT_APP_PUSHER_KEY;
const secret = process.env.REACT_APP_PUSHER_SECRET;
const cluster = process.env.REACT_APP_PUSHER_CLUSTER;
const forceTLS = process.env.REACT_APP_PUSHER_ENCRYPTED;
const channel = process.env.REACT_APP_PUSHER_CHANNEL;

module.exports = async (event, data) => {
  if (pusherActive !== 'true') {
    return;
  }
  const pusher = new Pusher({
    appId,
    key,
    secret,
    cluster,
    forceTLS,
  });
  pusher.trigger(channel, event, data);
};
