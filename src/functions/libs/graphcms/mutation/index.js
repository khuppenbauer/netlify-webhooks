const PublishAsset = require('./publishAsset');
const UpdateAsset = require('./updateAsset');
const UpsertTrack = require('./upsertTrack');
const UpsertTrackConnectAsset = require('./upsertTrackConnectAsset');
const UpsertTrackConnectAssets = require('./upsertTrackConnectAssets');
const UpsertTrail = require('./upsertTrail');
const UpdateTrailConnectAssets = require('./updateTrailConnectAssets');

module.exports = {
  publishAsset: PublishAsset,
  updateAsset: UpdateAsset,
  upsertTrack: UpsertTrack,
  upsertTrackConnectAsset: UpsertTrackConnectAsset,
  upsertTrackConnectAssets: UpsertTrackConnectAssets,
  upsertTrail: UpsertTrail,
  updateTrailConnectAssets: UpdateTrailConnectAssets,
};
