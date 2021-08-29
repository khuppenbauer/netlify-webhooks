const { gql } = require('graphql-request');

module.exports = async () => {
  return gql`
    mutation PublishCollection(
      $id: ID!,  
    ) {
      publishCollection(
        where: { id: $id }
      ) {
        id
      }
    }  
  `;
};
