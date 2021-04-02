const { gql } = require('graphql-request');

module.exports = async (property) => {
  return gql`
    mutation UpdateTrack(
      $name: String!,
      $value: String,
    ) {
      updateTrack(
        where: { name: $name }
        data: {
          ${property}: $value
        }
      ) {
        id
      }
    }
  `;
};
