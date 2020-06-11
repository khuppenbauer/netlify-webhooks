// mongodb.js
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

// Initialize connection to database
const DB_URL = process.env.MONGO_DB_URL;
const DB_NAME = process.env.MONGO_DB_NAME;
const DB_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

// Set DB from mongoose connection
mongoose.connect(`${DB_URL}/${DB_NAME}`, DB_OPTIONS);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
export default db;
