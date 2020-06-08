const Create = require('./create')
const Read = require('./read')
const Update = require('./update')
const Delete = require('./delete')
const ReadAll = require('./readall')

module.exports = {
  create: Create,
  read: Read,
  readAll: ReadAll,
  update: Update,
  delete: Delete
}