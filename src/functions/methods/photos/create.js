const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Photo = require('../../models/photo');

module.exports = async (event, data) => {
  const { foreignKey } = data;
  const existing = await Photo.find({ foreignKey });
  if (existing.length > 0) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'Photo already exists',
    };
  }
  const photo = {
    ...data,
    _id: mongoose.Types.ObjectId(),
  };
  try {
    await Photo.create(photo);
  } catch (err) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: err.message,
      }),
    };
  }
  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(photo),
  };
};
