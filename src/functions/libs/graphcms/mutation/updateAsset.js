const { gql } = require('graphql-request');

module.exports = async () => {
  return gql`
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
      $fileName: String,
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
          fileName: $fileName,
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
        fileName
      }
    }  
  `;
};
