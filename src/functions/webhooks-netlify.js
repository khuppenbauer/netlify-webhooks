const messages = require('./methods/messages');

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const data = JSON.parse(event.body);
    const { id: foreignKey, name, state } = data;
    const app = 'netlify';
    return messages.create(event, { foreignKey, app, event: `${name}_${state}` });
  }
  return {
    statusCode: 405,
    body: 'Method Not Allowed',
  };
};
