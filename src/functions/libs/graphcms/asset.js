const dotenv = require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const { GraphQLClient, gql } = require('graphql-request');
const db = require('../../database/mongodb');
const File = require('../../models/file');

const url = process.env.GRAPHCMS_API_URL;
const token = process.env.GRAPHCMS_API_TOKEN;

const graphcms = new GraphQLClient(
  url,
  {
    headers: {
      authorization: `Bearer ${token}`,
    },
  },
);

const uploadAsset = async (record) => {
  const { externalUrl, sha1 } = record;
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
      return res.data.id;
    }
    return assetObj.id;
  }
  return false;
};

const updateAsset = async (asset, record) => {
  const { coords } = record;
  const mutation = gql`
    mutation UpdateAsset(
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
  const res = await graphcms.request(mutation, mutationVariables);
  return res;
};

const publishAsset = async (asset) => {
  const mutation = gql`
    mutation PublishAsset(
      $id: ID!,  
    ) {
      publishAsset(
        where: { id: $id }
      ) {
        id
        stage
      }
    }  
  `;

  const mutationVariables = {
    id: asset,
  };
  const res = await graphcms.request(mutation, mutationVariables);
  return res;
};

const createMultipleReferenceMutation = async (property) => (
  gql`
    mutation ConnectAsset(
      $id: ID!
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
  `
);

const createSingleReferenceMutation = async (property) => (
  gql`
    mutation ConnectAsset(
      $id: ID!
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
                id: $id
              }
            }
          }
        }
      ) {
        id
      }
    }  
  `
);

const updateTrack = async (asset, record, mutation) => {
  const { source } = record;
  const { foreignKey } = source;

  const mutationVariables = {
    id: asset,
    name: foreignKey,
  };
  const res = await graphcms.request(mutation, mutationVariables);
  return res;
};

module.exports = async (data) => {
  const { _id: file } = data;
  const record = await File.findById(file);
  const { folder, extension } = record;
  const asset = await uploadAsset(record);
  if (asset) {
    const res = await updateAsset(asset, record);
    let mutation;
    if (folder === '/images') {
      mutation = await createMultipleReferenceMutation('photos');
    } else {
      let property;
      if (folder === '/preview') {
        property = 'staticImage';
      } else if (folder === '/tracks') {
        if (extension === 'gpx') {
          property = 'gpxFile';
        } else if (extension === 'json') {
          property = 'geoJsonFile';
        }
      } else if (folder === '/convert/gpx') {
        property = 'gpxFileSmall';
      }
      mutation = await createSingleReferenceMutation(property);
    }
    if (mutation) {
      await updateTrack(asset, record, mutation);
    }
    await publishAsset(asset);
    return res;
  }
};
