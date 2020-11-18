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
      <TextField source="status" />
      <TextField source="statusText" />
      <TextField source="url" />
      <TextField source="urlOrigin" />
      <TextField source="urlPathname" />
      <TextField source="urlAction" />
      <TextField source="method" />
      <NumberField source="responseTime" />
      <JsonView source="subscription" />
      <DateField source="createdAt" showTime />
      <DateField source="updatedAt" showTime />
    </SimpleShowLayout>
  </Show>
);

export default LogsShow;
