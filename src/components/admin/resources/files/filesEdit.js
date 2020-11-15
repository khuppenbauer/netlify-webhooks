import * as React from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
} from 'react-admin';

const FilesEdit = (props) => (
  <Edit title="File" {...props}>
    <SimpleForm>
      <TextInput disabled source="_id" />
      <TextInput source="status" />
    </SimpleForm>
  </Edit>
);

export default FilesEdit;
