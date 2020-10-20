import * as React from 'react';
import {
  Show,
  SimpleShowLayout,
  TextField,
  DateField,
  BooleanField,
} from 'react-admin';

const SubscriptionsShow = (props) => (
  <Show title="Subscription" {...props}>
    <SimpleShowLayout>
      <BooleanField source="active" />
      <TextField source="app" />
      <TextField source="event" />
      <TextField source="url" />
      <DateField source="createdAt" showTime />
      <DateField source="updatedAt" showTime />
    </SimpleShowLayout>
  </Show>
);

export default SubscriptionsShow;
