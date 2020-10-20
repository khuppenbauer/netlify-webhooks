import * as React from 'react';
import { Fragment, useEffect } from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  Pagination,
  BulkDeleteButton,
  useRefresh,
} from 'react-admin';
import StatusField from '../../components/StatusField';
import MessagesFilter from './messagesFilter';
import BulkExecuteButton from '../../components/BulkExecuteButton';

const Pusher = require('pusher-js');

const MessagesBulkActionButtons = (props) => (
  <Fragment>
    <BulkExecuteButton {...props} />
    <BulkDeleteButton {...props} />
  </Fragment>
);

const MessagesList = (props) => {
  const key = process.env.REACT_APP_PUSHER_KEY;
  const cluster = process.env.REACT_APP_PUSHER_CLUSTER;
  const channel = process.env.REACT_APP_PUSHER_CHANNEL;
  const refresh = useRefresh();
  useEffect(() => {
    const pusher = new Pusher(key, {
      cluster,
    });
    const pusherChannel = pusher.subscribe(channel);
    pusherChannel.bind('message', function(data) {
      refresh();
    });
  });
  return (
    <List {...props}
      perPage={25}
      filters={<MessagesFilter />}
      pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
      sort={{ field: 'createdAt', order: 'DESC' }}
      bulkActionButtons={<MessagesBulkActionButtons />}
    >
      <Datagrid
        rowClick="show"
      >
        <StatusField source="status" />
        <TextField source="app"/>
        <TextField source="event"/>
        <TextField source="foreignKey"/>
        <DateField source="createdAt" showTime/>
      </Datagrid>
    </List>
  );
};

export default MessagesList;
