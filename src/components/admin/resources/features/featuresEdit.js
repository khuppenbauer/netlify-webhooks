import * as React from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
} from 'react-admin';

const FeaturesEdit = (props) => (
  <Edit title="Track" {...props}>
    <SimpleForm>
      <TextInput disabled source="_id" />
      <TextInput source="name" />
    </SimpleForm>
  </Edit>
);

export default FeaturesEdit;
