const axios = require('axios');
const filesLib = require('../../libs/files');
const dropboxLib = require('../../libs/dropbox');

const netlifyBaseUrl = 'https://api.netlify.com/api/v1/';
const token = process.env.NETLIFY_ACCESS_TOKEN;

const uploadFiles = async (id, sha1, path_display, data) => {
  const netlifyFileUploadEndpoint = `deploys/${id}/files/${path_display}`;
  await axios({
    method: 'put',
    url: `${netlifyBaseUrl}${netlifyFileUploadEndpoint}`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
    },
    data,
  });
};

module.exports = async (event, message) => {
  const data = JSON.parse(event.body);
  const {
    id,
    sha1,
    path_display,
    externalUrl,
    foreignKey,
  } = data;
  let fileData;
  if (externalUrl) {
    fileData = await filesLib.data(externalUrl, 'string');
  } else {
    fileData = await dropboxLib.download(foreignKey);
  }
  await uploadFiles(id, sha1, path_display, fileData);
  await filesLib.message(event, message, data);
};
