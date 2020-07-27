import * as React from 'react';
import {
  Show,
  SimpleShowLayout,
  TextField,
  DateField,
  ImageField,
} from 'react-admin';

const PhotosShow = (props) => (
  <Show title="Photo" {...props}>
    <SimpleShowLayout>
      <DateField source="shootingDate" />
      <TextField source="activity" />
      <TextField source="foreignKey" />
      <ImageField source="url" />
    </SimpleShowLayout>
  </Show>
);

export default PhotosShow;
