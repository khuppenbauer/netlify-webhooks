exports.handler = async (event, context) => {
  if (event.httpMethod === 'GET') {
    const params = event.queryStringParameters;
    console.log(params);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    }
  } else if (event.httpMethod === 'POST') {
    const data = JSON.parse(event.body);
    console.log(data);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  } else {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }
};