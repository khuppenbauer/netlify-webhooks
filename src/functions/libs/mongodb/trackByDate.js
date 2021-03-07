const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Track = require('../../models/track');

module.exports = async (dateTimeOriginal) => {
  const filter = {
    startTime: {
      $lte: dateTimeOriginal,
    },
    endTime: {
      $gte: dateTimeOriginal,
    },
  };
  return Track.find(filter);
};
