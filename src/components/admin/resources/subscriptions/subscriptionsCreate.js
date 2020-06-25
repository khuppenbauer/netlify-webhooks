import * as React from 'react';
import { Create, SimpleForm, TextInput } from 'react-admin';

const SubscriptionsCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="app" />
      <TextInput source="event" />
      <TextInput source="url" />
    </SimpleForm>
  </Create>
);

export default SubscriptionsCreate;
