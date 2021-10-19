const dotenv = require('dotenv').config();
const path = require('path');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const db = require('../../database/mongodb');
const File = require('../../models/file');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = async (data) => {
  const {
    _id,
    externalUrl,
    path_display: pathDisplay,
  } = data;
  if (externalUrl) {
    const { dir, name } = path.parse(pathDisplay);
    const publicId = `${dir.replace(/\//, '')}/${name}`;
    const res = await cloudinary.uploader.upload(externalUrl,
      {
        public_id: publicId,
      });
    const { secure_url: secureUrl } = res;
    await File.findByIdAndUpdate(_id, { url: secureUrl, status: 'deployed' });
    return res;
  }
  return false;
};
