import * as React from 'react';
import { Show, SimpleShowLayout, TextField, DateField } from 'react-admin';

const SubscriptionsShow = (props) => (
  <Show title="Subscription" {...props}>
    <SimpleShowLayout>
      <TextField source="app" />
      <TextField source="event" />
      <TextField source="url" />
      <DateField source="createdAt" />
      <DateField source="updatedAt" />
    </SimpleShowLayout>
  </Show>
);

export default SubscriptionsShow;
