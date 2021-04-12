import * as React from 'react';
import {
  Show,
  TextField,
  DateField,
  NumberField,
  SimpleShowLayout,
} from 'react-admin';
import JsonView from '../../components/JsonView';

const LogsShow = (props) => (
  <Show title="Message" {...props}>
    <SimpleShowLayout>
      <TextField source="url" />
      <TextField source="host" />
      <TextField source="path" />
      <TextField source="action" />
      <JsonView source="body" />
      <JsonView source="data" />
      <JsonView source="headers" />
      <NumberField source="responseTime" />
      <DateField source="createdAt" showTime />
      <DateField source="updatedAt" showTime />
    </SimpleShowLayout>
  </Show>
);

export default LogsShow;
