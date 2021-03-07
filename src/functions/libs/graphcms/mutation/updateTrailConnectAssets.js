const { gql } = require('graphql-request');

module.exports = async () => {
  return gql`
    mutation ConnectAsset(
      $foreignKey: String,  
      $sha1: String,
    ) {
      updateTrail(
        data: {
          photos: { 
            connect: {
              where: {
                sha1: $sha1
              }
            }
          }
        }
        where: { foreignKey: $foreignKey }
      ) {
        id
        photos{
          fileName
          sha1
        }
      }
    }  
  `;
};
