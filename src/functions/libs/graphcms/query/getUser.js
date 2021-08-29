const { gql } = require('graphql-request');

module.exports = async () => {
  return gql`
    query getUser($id: ID!) {
      user(where: { id: $id }) {
        id
        name
        kind
      }
    }
  `;
};
