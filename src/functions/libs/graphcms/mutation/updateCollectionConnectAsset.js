const { gql } = require('graphql-request');

module.exports = async (property) => {
  return gql`
    mutation ConnectAsset(
      $collection: ID!
      $asset: ID!,  
    ) {
      updateCollection(
        where: { id: $collection }
        data: { 
          ${property}: { 
            connect: {
              id: $asset
            }
          }
        }
      ) {
        id
      }
    }  
  `;
};
