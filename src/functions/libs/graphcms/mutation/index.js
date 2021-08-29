const PublishAsset = require('./publishAsset');
const UpdateAsset = require('./updateAsset');
const DeleteAsset = require('./deleteAsset');
const PublishTrack = require('./publishTrack');
const UpdateTrack = require('./updateTrack');
const UpdateCollection = require('./updateCollection');
const UpdateCollectionConnectAsset = require('./updateCollectionConnectAsset');
const PublishCollection = require('./publishCollection');
const UpsertTrack = require('./upsertTrack');
const UpsertTrackConnectAsset = require('./upsertTrackConnectAsset');
const UpsertTrackConnectAssets = require('./upsertTrackConnectAssets');
const UpsertTrail = require('./upsertTrail');
const UpdateTrailConnectAssets = require('./updateTrailConnectAssets');

module.exports = {
  publishAsset: PublishAsset,
  updateAsset: UpdateAsset,
  deleteAsset: DeleteAsset,
  publishTrack: PublishTrack,
  updateTrack: UpdateTrack,
  updateCollection: UpdateCollection,
  updateCollectionConnectAsset: UpdateCollectionConnectAsset,
  publishCollection: PublishCollection,
  upsertTrack: UpsertTrack,
  upsertTrackConnectAsset: UpsertTrackConnectAsset,
  upsertTrackConnectAssets: UpsertTrackConnectAssets,
  upsertTrail: UpsertTrail,
  updateTrailConnectAssets: UpdateTrailConnectAssets,
};
