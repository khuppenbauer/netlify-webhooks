const dotenv = require('dotenv').config();
const Pusher = require('pusher');

const appId = process.env.REACT_APP_PUSHER_APP_ID;
const key = process.env.REACT_APP_PUSHER_KEY;
const secret = process.env.REACT_APP_PUSHER_SECRET;
const cluster = process.env.REACT_APP_PUSHER_CLUSTER;
const encrypted = process.env.REACT_APP_PUSHER_ENCRYPTED;
const channel = process.env.REACT_APP_PUSHER_CHANNEL;

module.exports = async (event, data) => {
  const pusher = new Pusher({
    appId,
    key,
    secret,
    cluster,
    encrypted,
  });
  pusher.trigger(channel, event, data);
};
