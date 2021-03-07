const { gql } = require('graphql-request');

module.exports = async () => {
  return gql`
    mutation AddTrack(
      $name: String!, 
      $date: DateTime, 
      $startTime: DateTime, 
      $endTime: DateTime,
      $distance: Float,
      $totalElevationGain: Float,
      $totalElevationLoss: Float,
      $elevLow: Float,
      $elevHigh: Float,
      $startElevation: Float,
      $endElevation: Float,
      $minCoords: LocationInput,
      $maxCoords: LocationInput,
      $startCoords: LocationInput,
      $endCoords: LocationInput,
      $startCity: String,
      $startState: String,
      $startCountry: String,
      $endCity: String,
      $endState: String,
      $endCountry: String,
      $geoJson: Json,
    ) {
      upsertTrack(
        where: {
          name: $name 
        }
        upsert: {
          create: {
            name: $name,
            date: $date,
            startTime: $startTime,
            endTime: $endTime,
            distance: $distance,
            totalElevationGain: $totalElevationGain,
            totalElevationLoss: $totalElevationLoss,
            elevLow: $elevLow,
            elevHigh: $elevHigh,
            startElevation: $startElevation,
            endElevation: $endElevation,
            minCoords: $minCoords,
            maxCoords: $maxCoords,
            startCoords: $startCoords,
            endCoords: $endCoords,
            startCity: $startCity,
            startState: $startState,
            startCountry: $startCountry,
            endCity: $endCity,
            endState: $endState,
            endCountry: $endCountry,
            geoJson: $geoJson,
          }
          update: {
            name: $name,
            date: $date,
            startTime: $startTime,
            endTime: $endTime,
            distance: $distance,
            totalElevationGain: $totalElevationGain,
            totalElevationLoss: $totalElevationLoss,
            elevLow: $elevLow,
            elevHigh: $elevHigh,
            startElevation: $startElevation,
            endElevation: $endElevation,
            minCoords: $minCoords,
            maxCoords: $maxCoords,
            startCoords: $startCoords,
            endCoords: $endCoords,
            startCity: $startCity,
            startState: $startState,
            startCountry: $startCountry,
            endCity: $endCity,
            endState: $endState,
            endCountry: $endCountry,
            geoJson: $geoJson,
          }
        }
      ) {
        name
        date
        startTime
        endTime
        distance
        totalElevationGain
        totalElevationLoss
        elevLow
        elevHigh
        startElevation
        endElevation
        minCoords {
          latitude
          longitude
        }
        maxCoords {
          latitude
          longitude
        }
        startCoords {
          latitude
          longitude
        }
        endCoords {
          latitude
          longitude
        }
        startCity
        startState
        startCountry
        endCity
        endState
        endCountry
        geoJson
      }
    }
  `;
};
