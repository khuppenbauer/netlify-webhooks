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

const ActivitiesList = (props) => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  return (
    <List
      {...props}
      sort={{ field: 'start_date', order: 'DESC' }}
    >
      {isSmall ? (
        <SimpleList
          primaryText={(record) => `${record.name} ${record.distance}`}
          secondaryText={(record) => record.type}
          linkType="edit"
        />
      ) : (
        <Datagrid
          rowClick="show"
        >
          <DateField source="start_date" />
          <TextField source="type" />
          <TextField source="name" />
          <TextField source="distance" />
          <TextField source="total_elevation_gain" />
          <TextField source="elev_high" />
          <TextField source="elev_low" />
          <DeleteButton/>
        </Datagrid>
      )}
    </List>
  );
};

export default ActivitiesList;
