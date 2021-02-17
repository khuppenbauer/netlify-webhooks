const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const { GraphQLClient, gql } = require('graphql-request');
const db = require('../../database/mongodb');
const Track = require('../../models/track');

const url = process.env.GRAPHCMS_API_URL;
const token = process.env.GRAPHCMS_API_TOKEN;

module.exports = async (data) => {
  const { track } = data;
  const record = await Track.findById(track);
  const {
    minCoords,
    maxCoords,
    startCoords,
    endCoords,
  } = record;

  const graphcms = new GraphQLClient(
    url,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );

  const mutation = gql`
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

  const variables = {
    ...record._doc,
    minCoords: {
      latitude: minCoords.lat,
      longitude: minCoords.lon,
    },
    maxCoords: {
      latitude: maxCoords.lat,
      longitude: maxCoords.lon,
    },
    startCoords: {
      latitude: startCoords.lat,
      longitude: startCoords.lon,
    },
    endCoords: {
      latitude: endCoords.lat,
      longitude: endCoords.lon,
    },
  };

  return graphcms.request(mutation, variables);
};
