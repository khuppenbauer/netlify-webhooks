const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const Photo = require('../../models/photo');

module.exports = async (event, id) => {
  const { body } = event;
  const photo = JSON.parse(body);
  try {
    await Photo.findByIdAndUpdate(id, photo);
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
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(photo),
  };
};
