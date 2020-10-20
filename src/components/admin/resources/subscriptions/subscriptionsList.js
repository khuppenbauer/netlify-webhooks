import * as React from 'react';
import { Fragment } from 'react';
import {
  List,
  Datagrid,
  TextField,
  EditButton,
  BooleanField,
  BulkDeleteButton,
  Pagination,
} from 'react-admin';
import BulkActivateButton from '../../components/BulkActivateButton';
import BulkDeactivateButton from '../../components/BulkDeactivateButton';
import SubscriptionsFilter from './subscriptionsFilter';

const SubscriptionsBulkActionButtons = (props) => (
  <Fragment>
    <BulkActivateButton {...props} />
    <BulkDeactivateButton {...props} />
    <BulkDeleteButton {...props} />
  </Fragment>
);

const SubscriptionsList = (props) => {
  return (
    <List
      {...props}
      perPage={25}
      filters={<SubscriptionsFilter />}
      pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
      sort={{ field: 'app', order: 'ASC' }}
      bulkActionButtons={<SubscriptionsBulkActionButtons />}
    >
      <Datagrid>
        <BooleanField source="active"/>
        <TextField source="app"/>
        <TextField source="event"/>
        <TextField source="url"/>
        <EditButton/>
      </Datagrid>
    </List>
  );
};

export default SubscriptionsList;
