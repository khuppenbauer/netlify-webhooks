const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const { GraphQLClient, gql } = require('graphql-request');
const db = require('../../database/mongodb');

const url = process.env.GRAPHCMS_API_URL;
const token = process.env.GRAPHCMS_API_TOKEN;

module.exports = async (data) => {
  const {
    id: foreignKey,
    name,
    city,
    state,
    country,
    distance,
    average_grade: averageGrade,
    maximum_grade: maximumGrade,
    elevation_high: elevationHigh,
    elevation_low: elevationLow,
    start_latitude: startLat,
    start_longitude: startLng,
    end_latitude: endLat,
    end_longitude: endLng,
  } = data;

  const graphcms = new GraphQLClient(
    url,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );

  const mutation = gql`
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
      }
    }
  `;

  const variables = {
    name,
    foreignKey: `${foreignKey}`,
    city,
    state,
    country,
    distance,
    averageGrade,
    maximumGrade,
    elevationHigh,
    elevationLow,
    startLatLng: {
      latitude: startLat,
      longitude: startLng,
    },
    endLatLng: {
      latitude: endLat,
      longitude: endLng,
    },
  };

  return graphcms.request(mutation, variables);
};
