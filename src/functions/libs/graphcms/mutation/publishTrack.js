const { gql } = require('graphql-request');

module.exports = async () => {
  return gql`
    mutation PublishTrack(
      $foreignKey: String,  
    ) {
      publishTrack(
        where: { foreignKey: $foreignKey }
      ) {
        id
        name
        foreignKey
        stage
      }
    }  
  `;
};
