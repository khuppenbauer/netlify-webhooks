exports.handler = async (event) => {
  if (event.httpMethod === 'GET') {
    const params = event.queryStringParameters;
    console.log(params);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    };
  } if (event.httpMethod === 'POST') {
    const data = JSON.parse(event.body);
    console.log(data);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  }
  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};
