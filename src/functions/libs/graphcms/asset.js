const dotenv = require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const { GraphQLClient, gql } = require('graphql-request');
const db = require('../../database/mongodb');
const File = require('../../models/file');

const url = process.env.GRAPHCMS_API_URL;
const token = process.env.GRAPHCMS_API_TOKEN;

module.exports = async (data) => {
  const { _id: file } = data;
  const record = await File.findById(file);
  const { externalUrl, coords, sha1 } = record;
  let asset;

  const graphcms = new GraphQLClient(
    url,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );

  if (externalUrl) {
    const query = gql`
      query getAsset($sha1: String!) {
        asset(where: { sha1: $sha1 }) {
          id
        }
      }
    `;

    const queryVariables = {
      sha1,
    };

    const queryRes = await graphcms.request(query, queryVariables);
    const { asset: assetObj } = queryRes;
    if (!assetObj) {
      const res = await axios({
        method: 'post',
        url: `${url}/upload`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: `url=${encodeURIComponent(externalUrl)}`,
      });
      asset = res.data.id;
    } else {
      asset = assetObj.id;
    }
  }
  if (asset) {
    const mutation = gql`
      mutation AddAsset(
        $id: ID!,  
        $source: Json, 
        $dateTimeOriginal: DateTime, 
        $extension: String, 
        $folder: String,
        $externalUrl: String,
        $foreignKey: String,
        $sha1: String,
        $location: LocationInput,
      ) {
        updateAsset(
          where: { id: $id }
          data: {
            source: $source,
            dateTimeOriginal: $dateTimeOriginal,
            extension: $extension,
            folder: $folder,
            externalUrl: $externalUrl,
            foreignKey: $foreignKey,
            sha1: $sha1,
            location: $location,
          }
        ) {
          id  
          source
          dateTimeOriginal
          extension
          folder
          externalUrl
          foreignKey
          sha1
          location {
            latitude
            longitude
          }  
        }
      }  
    `;

    let mutationVariables = {
      ...record._doc,
      id: asset,
    };
    if (coords) {
      mutationVariables = {
        ...mutationVariables,
        location: {
          latitude: coords.lat,
          longitude: coords.lon,
        },
      };
    }
    return graphcms.request(mutation, mutationVariables);
  }
};
