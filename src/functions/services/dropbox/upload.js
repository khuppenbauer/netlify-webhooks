const dotenv = require('dotenv').config();
const path = require('path');
const mime = require('mime-types');
const dropboxLib = require('../../libs/dropbox');
const File = require('../../models/file');

const getPath = async (name, filePath, outtype) => {
  const { name: fileName } = path.parse(name);
  const mimeType = mime.lookup(`${fileName}.${outtype}`);
  const extension = mime.extension(mimeType);
  const newFileName = `${fileName}.${extension}`;
  return `/convert/${extension}/${filePath}/${newFileName}`;
};

const dropboxUpload = async (data, filePath) => {
  const existingFile = await File.find({
    path_display: filePath,
  });
  if (existingFile.length > 0) {
    await dropboxLib.delete(filePath);
  }
  await dropboxLib.upload(data, filePath);
}

module.exports = async (event) => {
  const { event: data, content } = JSON.parse(event.body);
  const { body, params } = data;
  const {
    outtype,
    count,
  } = params;
  const distance = params.distance || '';
  const error = params.error || '';
  const { name } = body;
  const path = `${count}/${distance}${error}`;

  const filePath = await getPath(name, path, outtype);
  await dropboxUpload(content, filePath);
};
