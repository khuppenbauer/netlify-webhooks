import React from 'react';
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
  Filter,
  SelectInput,
  useQuery,
} from 'react-admin';
import StatusField from '../../components/StatusField';

const MessagesFilter = (props) => {
  const pipeline = [
    {
      $group: {
        _id: 0,
        status: {
          $addToSet: '$status',
        },
        app: {
          $addToSet: '$app',
        },
        event: {
          $addToSet: '$event',
        },
      },
    },
    {
      $match: props.filterValues,
    },
  ];
  const { data } = useQuery({
    type: 'getAggregation',
    resource: 'messages',
    payload: {
      query: {
        type: 'aggregate',
        pipeline,
      },
    },
  });
  if (data === undefined) {
    return null;
  }
  const { app, event, status } = data[0];
  return (
    <Filter {...props}>
      <SelectInput
        source="app"
        key="app-filter"
        choices={app.map((appItem) => ({ id: appItem, name: appItem }))}
      />
      <SelectInput
        source="event"
        key="event-filter"
        choices={event.map((eventItem) => ({ id: eventItem, name: eventItem }))}
      />
      <SelectInput
        source="status"
        key="status-filter"
        choices={status.map((statusItem) => ({ id: statusItem, name: statusItem }))}
      />
    </Filter>
  );
};

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
