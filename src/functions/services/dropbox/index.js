const Delete = require('./delete');
const Download = require('./download');
const List = require('./list');
const Sync = require('./sync');
const Upload = require('./upload');

module.exports = {
  delete: Delete,
  download: Download,
  list: List,
  sync: Sync,
  upload: Upload,
};
