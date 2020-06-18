// in src/posts.js
import React from 'react';
import { List, Datagrid, TextField, DateField } from 'react-admin';

const messagesList = (props) => (
  <List {...props}>
    <Datagrid>
      <TextField source="app" />
      <TextField source="event" />
      <TextField source="path" />
      <TextField source="status" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export default messagesList;
