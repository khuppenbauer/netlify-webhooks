// webHook.js
import mongoose from 'mongoose'

const schemaOptions = {
  timestamps: true,
};
// Set Product Schema
const schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  provider: {
    type: String
  },
  status: {
    type: String
  },
  task: {
    type: String
  },
  path: {
    type: String
  },
  httpMethod: {
    type: String
  },
  headers: {
    type: Object
  },
  queryStringParameters: {
    type: Object
  },
  body: {
    type: Object
  }

}, schemaOptions),
WebHook = mongoose.model('webHook', schema)

export default WebHook
