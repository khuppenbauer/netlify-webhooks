import * as React from 'react';
import { Show, SimpleShowLayout, TextField } from 'react-admin';

const subscriptionsShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="app" />
      <TextField source="event" />
      <TextField source="url" />
    </SimpleShowLayout>
  </Show>
);

export default subscriptionsShow;
