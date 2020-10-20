import * as React from 'react';
import {
  Show,
  TextField,
  DateField,
  ImageField,
  TabbedShowLayout,
  Tab,
} from 'react-admin';
import ReferenceField from '../../components/ReferenceField';

const PhotosShow = (props) => (
  <Show title="Photo" {...props}>
    <TabbedShowLayout>
      <Tab label="Image">
        <ImageField source="url" label="Image" />
        <DateField source="shootingDate" />
        <ReferenceField source="activity" reference="activities" property="Activity" />
      </Tab>
      <Tab label="Meta">
        <TextField source="foreignKey" />
        <DateField source="createdAt" showTime />
        <DateField source="updatedAt" showTime />
      </Tab>
    </TabbedShowLayout>
  </Show>
);

export default PhotosShow;
