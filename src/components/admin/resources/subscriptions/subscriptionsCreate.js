import * as React from 'react';
import { Create, SimpleForm, TextInput, BooleanInput } from 'react-admin';

const SubscriptionsCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <BooleanInput source="active" />
      <TextInput source="app" />
      <TextInput source="event" />
      <TextInput source="url" />
    </SimpleForm>
  </Create>
);

export default SubscriptionsCreate;
