import * as React from 'react';
import { useMediaQuery } from '@material-ui/core';
import {
  SimpleList,
  List,
  Datagrid,
  TextField,
  DateField,
  DeleteButton,
} from 'react-admin';

const PhotosList = (props) => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  return (
    <List
      {...props}
      sort={{ field: 'shootingDate', order: 'DESC' }}
    >
      {isSmall ? (
        <SimpleList
          primaryText={(record) => `${record.activity} ${record.url}`}
          secondaryText={(record) => record.shootingDate}
          linkType="show"
        />
      ) : (
        <Datagrid
          rowClick="show"
        >
          <TextField source="activity" />
          <DateField source="shootingDate" />
          <TextField source="url" />
          <DeleteButton/>
        </Datagrid>
      )}
    </List>
  );
};

export default PhotosList;
