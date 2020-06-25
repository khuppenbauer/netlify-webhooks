import * as React from 'react';
import { Show, SimpleShowLayout, TextField, DateField } from 'react-admin';
import JsonView from '../../components/JsonView';
import StatusField from '../../components/StatusField';

const MessagesShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <StatusField source="status" />
      <TextField source="foreignKey" />
      <TextField source="app" />
      <TextField source="event" />
      <TextField source="path" />
      <TextField source="httpMethod" />
      <DateField source="createdAt" />
      <DateField source="updatedAt" />
      <JsonView source="body" />
      <JsonView source="message" />
    </SimpleShowLayout>
  </Show>
);

export default MessagesShow;
