const List = require('./list');
const Create = require('./create');
const Delete = require('./delete');
const Sync = require('./sync');

module.exports = {
  create: Create,
  list: List,
  delete: Delete,
  sync: Sync,
};
