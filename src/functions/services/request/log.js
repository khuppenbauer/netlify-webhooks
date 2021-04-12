const logs = require('../../methods/logs');

module.exports = async (res, startTime) => {
  const { config, headers, status } = res;
  const { url, baseURL } = config;
  const uri = baseURL ? `${baseURL}${url}` : url;
  const urlObject = new URL(uri);
  const logObject = {
    path: urlObject.pathname,
    queryStringParameters: {
      action: new URLSearchParams(urlObject.search).get('action'),
    },
    headers: {
      host: urlObject.host,
    },
  };
  const logData = {
    startTime,
    status,
    requestHeaders: headers,
  };
  await logs.create(logObject, logData);
};
