const dotenv = require('dotenv').config();
const axios = require('axios');

const dropboxSharingUrl = 'https://api.dropboxapi.com/2/sharing/';
const dropboxAccessToken = process.env.DROPBOX_ACCESS_TOKEN;

const executeDropboxApi = async (url, body) => {
  const res = await axios({
    method: 'post',
    url,
    headers: {
      Authorization: `Bearer ${dropboxAccessToken}`,
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(body),
  });
  return res.data;
};

module.exports = async (id) => {
  const url = `${dropboxSharingUrl}list_shared_links`;
  const body = {
    path: id,
  };
  const res = await executeDropboxApi(url, body);
  const { links } = res;
  let externalUrl;
  if (links.length === 0) {
    const createUrl = `${dropboxSharingUrl}create_shared_link_with_settings`;
    const createBody = {
      path: id,
      settings: {
        requested_visibility: 'public',
        audience: 'public',
        access: 'viewer',
      },
    };
    const createSharing = await executeDropboxApi(createUrl, createBody);
    externalUrl = createSharing.url;
  } else {
    externalUrl = links[0].url;
  }
  const { origin, pathname } = new URL(externalUrl);
  return `${origin}${pathname}?raw=1`;
};
