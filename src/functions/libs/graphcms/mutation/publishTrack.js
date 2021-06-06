const { gql } = require('graphql-request');

module.exports = async () => {
  return gql`
    mutation PublishTrack(
      $name: String,  
    ) {
      publishTrack(
        where: { name: $name }
      ) {
        id
        name
        stage
      }
    }  
  `;
};
