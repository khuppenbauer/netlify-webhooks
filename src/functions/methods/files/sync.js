const axios = require('axios');

const netlifyBaseUrl = 'https://api.netlify.com/api/v1/';
const netlifyDeployEndpoint = `sites/${process.env.NETLIFY_CDN_ID}/deploys`
const netlifyFilesEndpoint = `sites/${process.env.NETLIFY_CDN_ID}/files`
const token = process.env.NETLIFY_ACCESS_TOKEN;

const uploadFiles = async (id, sha1, pathDisplay, data) => {
  const netlifyFileUploadEndpoint = `deploys/${id}/files/${pathDisplay}`;
  const base64Data = Buffer.from(data, 'base64');
  const fileData = base64Data.toString('base64') === data ? base64Data : data;
  return axios({
    method: 'put',
    url: `${netlifyBaseUrl}${netlifyFileUploadEndpoint}`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
    },
    data: fileData,
  });
};

const syncFiles = async (metaData) => {
  const {
    path_display: pathDisplay,
    sha1,
    fileData,
  } = metaData;
  const files = await axios({
    method: 'get',
    url: `${netlifyBaseUrl}${netlifyFilesEndpoint}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const filesData = files.data.reduce(
    (acc, item) => (acc[item.path] = item.sha, acc),
    {},
  );
  filesData[pathDisplay] = sha1;
  const body = {
    files: filesData,
  };
  const res = await axios({
    method: 'post',
    url: `${netlifyBaseUrl}${netlifyDeployEndpoint}`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(body),
  });
  if (res.data.required) {
    await res.data.required.reduce(async (lastPromise, item) => {
      const accum = await lastPromise;
      await uploadFiles(res.data.id, sha1, pathDisplay, fileData);
      return [...accum, {}];
    }, Promise.resolve([]));
  }
  return res.data;
};

module.exports = async (metaData) => {
  await syncFiles(metaData);
  return {
    statusCode: 200,
    body: 'Ok',
  };
};
