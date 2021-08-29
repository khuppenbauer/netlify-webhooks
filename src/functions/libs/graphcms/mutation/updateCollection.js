const { gql } = require('graphql-request');

module.exports = async (property) => {
  return gql`
    mutation UpdateCollection(
      $id: ID!
      $geoJson: Json,
      $minCoords: LocationInput,
      $maxCoords: LocationInput,
    ) {
      updateCollection(
        where: { id: $id }
        data: { 
          geoJson: $geoJson,
          minCoords: $minCoords,
          maxCoords: $maxCoords,
        }
      ) {
        id
      }
    }  
  `;
};
