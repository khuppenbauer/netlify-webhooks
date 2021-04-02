const { gql } = require('graphql-request');

module.exports = async () => {
  return gql`
    query getAsset($sha1: String!) {
      asset(where: { sha1: $sha1 }) {
        id
        handle
      }
    }
  `;
};
