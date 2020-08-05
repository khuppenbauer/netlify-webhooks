import * as React from 'react';
import { Fragment } from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import { useMediaQuery } from '@material-ui/core';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  ShowButton,
  DeleteButton,
  Pagination,
  BulkDeleteButton,
} from 'react-admin';
import StatusField from '../../components/StatusField';
import MessagesFilter from './messagesFilter';
import BulkExecuteButton from '../../components/BulkExecuteButton';
import ExecuteButton from '../../components/ExecuteButton';

const useListStyles = makeStyles(theme => ({
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    margin: '0.5rem 0',
  },
  cardTitleContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardContent: theme.typography.body1,
  cardContentRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    margin: '0.5rem 0',
  },
}));

const MessagesBulkActionButtons = (props) => (
  <Fragment>
    <BulkExecuteButton {...props} />
    <BulkDeleteButton {...props} />
  </Fragment>
);

const MessagesGrid = (props) => {
  const { data, ids } = props;
  const classes = useListStyles();
  return (
    <div style={{ margin: '1em' }}>
      {ids.map(id => (
        <Card key={id} className={classes.card}>
          <CardHeader
            title={
              <div className={classes.cardTitleContent}>
                <span>
                  Message:&nbsp;
                  <TextField source="app" record={data[id]}/>
                  &nbsp;
                  <TextField source="event" record={data[id]}/>
                </span>
                <ShowButton basePath="/messages" record={data[id]}/>
              </div>
            }
          />
          <CardContent className={classes.cardContent}>
            <span className={classes.cardContentRow}>
              Status:&nbsp;
              <StatusField source="status" record={data[id]}/>
            </span>
            <span className={classes.cardContentRow}>
              ForeignKey:&nbsp;
              <TextField record={data[id]} source="foreignKey"/>
            </span>
            <span className={classes.cardContentRow}>
              Date:&nbsp;
              <DateField source="createdAt" record={data[id]}/>
            </span>
            <ExecuteButton record={data[id]}/>
            <DeleteButton basePath="/messages" resource="messages" record={data[id]}/>
          </CardContent>
        </Card>
      ))}
    </div>
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
      bulkActionButtons={<MessagesBulkActionButtons />}
    >
      {isSmall ? (
        <MessagesGrid />
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
