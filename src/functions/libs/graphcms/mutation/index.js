const PublishAsset = require('./publishAsset');
const UpdateAsset = require('./updateAsset');
const PublishTrack = require('./publishTrack');
const UpdateTrack = require('./updateTrack');
const UpsertTrack = require('./upsertTrack');
const UpsertTrackConnectAsset = require('./upsertTrackConnectAsset');
const UpsertTrackConnectAssets = require('./upsertTrackConnectAssets');
const UpsertTrail = require('./upsertTrail');
const UpdateTrailConnectAssets = require('./updateTrailConnectAssets');

module.exports = {
  publishAsset: PublishAsset,
  updateAsset: UpdateAsset,
  publishTrack: PublishTrack,
  updateTrack: UpdateTrack,
  upsertTrack: UpsertTrack,
  upsertTrackConnectAsset: UpsertTrackConnectAsset,
  upsertTrackConnectAssets: UpsertTrackConnectAssets,
  upsertTrail: UpsertTrail,
  updateTrailConnectAssets: UpdateTrailConnectAssets,
};
