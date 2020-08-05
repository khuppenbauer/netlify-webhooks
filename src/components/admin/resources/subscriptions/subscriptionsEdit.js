import * as React from 'react';
import { Edit, SimpleForm, TextInput, BooleanInput } from 'react-admin';

const SubscriptionsEdit = (props) => (
  <Edit title="Subscription" {...props}>
    <SimpleForm>
      <TextInput disabled source="_id" />
      <BooleanInput source="active" />
      <TextInput source="app" />
      <TextInput source="event" />
      <TextInput source="url" />
    </SimpleForm>
  </Edit>
);

export default SubscriptionsEdit;
