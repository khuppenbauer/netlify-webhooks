import * as React from 'react';
import { List, Datagrid, TextField } from 'react-admin';

const subscriptionsList = (props) => (
  <List {...props}>
    <Datagrid>
      <TextField source="app" />
      <TextField source="event" />
      <TextField source="url" />
    </Datagrid>
  </List>
);

export default subscriptionsList;
