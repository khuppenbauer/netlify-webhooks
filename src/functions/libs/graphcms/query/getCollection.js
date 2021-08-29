const { gql } = require('graphql-request');

module.exports = async () => {
  return gql`
    query getCollection($id: ID!) {
      collection(where: { id: $id }) {
        name,
        tracks {
          id
          geoJson  
          maxCoords {
            latitude
            longitude
          }
          minCoords {
            latitude
            longitude
          }
          color {
            hex
          }
          distance
          totalElevationGain
          totalElevationLoss
        }
        staticImage {
          id
        }
      }
    }
  `;
};
