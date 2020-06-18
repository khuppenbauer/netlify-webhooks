import * as React from 'react';
import { Edit, SimpleForm, TextInput } from 'react-admin';

const subscriptionsEdit = (props) => (
  <Edit title="Title" {...props}>
    <SimpleForm>
      <TextInput disabled source="_id" />
      <TextInput source="app" />
      <TextInput source="event" />
      <TextInput source="url" />
    </SimpleForm>
  </Edit>
);

export default subscriptionsEdit;
