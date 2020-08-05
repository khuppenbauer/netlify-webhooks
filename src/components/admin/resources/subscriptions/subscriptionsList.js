import * as React from 'react';
import { useMediaQuery } from '@material-ui/core';
import {
  SimpleList,
  List,
  Datagrid,
  TextField,
  EditButton,
  DeleteButton,
  BooleanField,
} from 'react-admin';

const SubscriptionsList = (props) => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  return (
    <List
      {...props}
      sort={{ field: 'app', order: 'ASC' }}
    >
      {isSmall ? (
        <SimpleList
          primaryText={(record) => `${record.app} ${record.event}`}
          secondaryText={(record) => record.url}
          linkType="edit"
        />
      ) : (
        <Datagrid
          rowClick="edit"
        >
          <BooleanField source="active"/>
          <TextField source="app"/>
          <TextField source="event"/>
          <TextField source="url"/>
          <EditButton/>
          <DeleteButton/>
        </Datagrid>
      )}
    </List>
  );
};

export default SubscriptionsList;
