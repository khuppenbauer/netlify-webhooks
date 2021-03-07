const { gql } = require('graphql-request');

module.exports = async () => {
  return gql`
    mutation PublishAsset(
      $id: ID!,  
    ) {
      publishAsset(
        where: { id: $id }
      ) {
        id
        stage
      }
    }  
  `;
};
