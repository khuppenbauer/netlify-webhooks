const { gql } = require('graphql-request');

module.exports = async (property) => {
  return gql`
    mutation ConnectAsset(
      $id: ID!,
      $name: String!,  
    ) {
      upsertTrack(
        where: { name: $name }
        upsert: {
          create: {
            ${property}: { 
              connect: {
                id: $id
              }
            }
            name: $name
          }
          update: {
            ${property}: { 
              connect: {
                where: {
                  id: $id
                }
                position: {
                  end: true
                }
              }
            }
          }
        }
      ) {
        id
      }
    }  
  `;
};
