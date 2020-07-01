import * as React from 'react';
import { useMediaQuery } from '@material-ui/core';
import {
  SimpleList,
  List,
  Datagrid,
  TextField,
  DateField,
  ShowButton,
  DeleteButton,
  Pagination,
} from 'react-admin';
import StatusField from '../../components/StatusField';
import MessagesFilter from './messagesFilter';

const MessagesList = (props) => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  return (
    <List {...props}
      perPage={25}
      filters={<MessagesFilter />}
      pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
      sort={{ field: 'createdAt', order: 'DESC' }}
    >
      {isSmall ? (
        <SimpleList
          primaryText={(record) => `${record.app} ${record.event}`}
          secondaryText={(record) => record.status}
          tertiaryText={(record) => new Date(record.createdAt).toLocaleDateString()}
          linkType="show"
        />
      ) : (
        <Datagrid
          rowClick="show"
        >
          <StatusField source="status" />
          <TextField source="app"/>
          <TextField source="event"/>
          <TextField source="foreignKey"/>
          <DateField source="createdAt"/>
          <ShowButton/>
          <DeleteButton/>
        </Datagrid>
      )}
    </List>
  );
};

export default MessagesList;
