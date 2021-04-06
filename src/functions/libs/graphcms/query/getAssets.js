const { gql } = require('graphql-request');

module.exports = async (property) => {
  return gql`
    query getAssets($value: String!) {
      assets(where: { ${property}: $value }) {
        id
        handle
        folder
        fileName
        extension
        mimeType
      }
    }
  `;
};
