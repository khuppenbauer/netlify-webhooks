import * as React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import { useMediaQuery } from '@material-ui/core';
import {
  List,
  Datagrid,
  TextField,
  EditButton,
  DeleteButton,
  BooleanField,
} from 'react-admin';

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

const SubscriptionsGrid = (props) => {
  const { data, ids } = props;
  const classes = useListStyles();
  return (
    <div style={{ margin: '1em' }}>
      {ids.map(id => (
        <Card key={id} className={classes.card}>
          <CardContent className={classes.cardContent}>
            <span className={classes.cardContentRow}>
              Active:&nbsp;
              <BooleanField source="active" record={data[id]}/>
            </span>
            <span className={classes.cardContentRow}>
              App:&nbsp;
              <TextField source="app" record={data[id]}/>
            </span>
            <span className={classes.cardContentRow}>
              Event:&nbsp;
              <TextField source="event" record={data[id]}/>
            </span>
            <span className={classes.cardContentRow}>
              Url:&nbsp;
              <TextField source="url" record={data[id]}/>
            </span>
            <EditButton basePath="/subsciptions" record={data[id]}/>
            <DeleteButton basePath="/subsciptions" resource="subsciptions" record={data[id]}/>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const SubscriptionsList = (props) => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  return (
    <List
      {...props}
      sort={{ field: 'app', order: 'ASC' }}
    >
      {isSmall ? (
        <SubscriptionsGrid />
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
