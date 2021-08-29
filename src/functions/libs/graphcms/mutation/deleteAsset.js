const { gql } = require('graphql-request');

module.exports = async () => {
  return gql`
    mutation DeleteAsset(
      $id: ID!,  
    ) {
      deleteAsset(
        where: { id: $id }
      ) {
        id
      }
    }  
  `;
};
