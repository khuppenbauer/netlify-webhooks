const messages = require('./methods/messages');

exports.handler = async (event, context) => {
  if (event.httpMethod === 'POST') {
    const data = JSON.parse(event.body);
    const { id, name, state } = data;
    const app = 'netlify';
    return messages.create(event, context, {id, app, event: `${name}_${state}`});
  } else {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }
};
