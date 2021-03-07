const { gql } = require('graphql-request');

module.exports = async () => {
  return gql`
    mutation AddTrail(
      $name: String,
      $foreignKey: String!,
      $city: String,
      $state: String,
      $country: String,
      $distance: Float,
      $averageGrade: Float,
      $maximumGrade: Float,
      $elevationLow: Float,
      $elevationHigh: Float,
      $startLatLng: LocationInput,
      $endLatLng: LocationInput,
      $minCoords: LocationInput,
      $maxCoords: LocationInput,
      $geoJson: Json,
    ) {
      upsertTrail(
        where: {
          foreignKey: $foreignKey 
        }
        upsert: {
          create: {
            name: $name,
            foreignKey: $foreignKey,
            city: $city,
            state: $state,
            country: $country,
            distance: $distance,
            averageGrade: $averageGrade,
            maximumGrade: $maximumGrade,
            elevationHigh: $elevationHigh,
            elevationLow: $elevationLow,
            startLatLng: $startLatLng,
            endLatLng: $endLatLng,
            minCoords: $minCoords,
            maxCoords: $maxCoords,
            geoJson: $geoJson,
          }
          update: {
            name: $name,
            foreignKey: $foreignKey,
            city: $city,
            state: $state,
            country: $country,
            distance: $distance,
            averageGrade: $averageGrade,
            maximumGrade: $maximumGrade,
            elevationHigh: $elevationHigh,
            elevationLow: $elevationLow,
            startLatLng: $startLatLng,
            endLatLng: $endLatLng,
            minCoords: $minCoords,
            maxCoords: $maxCoords,
            geoJson: $geoJson,
          }
        }
      ) {
        name
        foreignKey
        city
        state
        country
        distance
        averageGrade
        maximumGrade
        elevationLow
        elevationHigh
        startLatLng {
          latitude
          longitude
        }
        endLatLng {
          latitude
          longitude
        }
        minCoords {
          latitude
          longitude
        }
        maxCoords {
          latitude
          longitude
        }
        geoJson
      }
    }
  `;
};
