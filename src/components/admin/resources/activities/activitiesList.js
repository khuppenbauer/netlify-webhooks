import * as React from 'react';
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
  NumberField,
} from 'react-admin';
import NumeralField from '../../components/NumeralField';

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

const ActivitiesGrid = (props) => {
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
                  Name:&nbsp;
                  <TextField source="name" record={data[id]}/>
                  &nbsp;
                  <TextField source="type" record={data[id]}/>
                </span>
                <ShowButton basePath="/activities" record={data[id]}/>
              </div>
            }
          />
          <CardContent className={classes.cardContent}>
            <span className={classes.cardContentRow}>
              Distance:&nbsp;
              <NumeralField source="distance" record={data[id]} options={{ from: 'm', to: 'km' }}/>
            </span>
            <span className={classes.cardContentRow}>
              Total Elevation Gain:&nbsp;
              <NumberField source="total_elevation_gain" record={data[id]} options={{ style: 'unit', unit: 'meter' }}/>
            </span>
            <span className={classes.cardContentRow}>
              Elev high:&nbsp;
              <NumberField source="elev_high" record={data[id]} options={{ style: 'unit', unit: 'meter' }}/>
            </span>
            <span className={classes.cardContentRow}>
              Elev low:&nbsp;
              <NumberField source="elev_low" record={data[id]} options={{ style: 'unit', unit: 'meter' }}/>
            </span>
            <DeleteButton basePath="/activities" resource="activities" record={data[id]}/>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const ActivitiesList = (props) => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const style = { whiteSpace: 'nowrap' };
  return (
    <List
      {...props}
      perPage={25}
      sort={{ field: 'start_date', order: 'DESC' }}
    >
      {isSmall ? (
        <ActivitiesGrid />
      ) : (
        <Datagrid
          rowClick="show"
        >
          <DateField source="start_date" />
          <TextField source="type" />
          <TextField source="name" />
          <NumeralField source="distance" options={{ from: 'm', to: 'km' }} style={style}/>
          <NumberField source="total_elevation_gain" options={{ style: 'unit', unit: 'meter' }} style={style} />
          <NumberField source="elev_high" options={{ style: 'unit', unit: 'meter' }} style={style} />
          <NumberField source="elev_low" options={{ style: 'unit', unit: 'meter' }} style={style} />
          <DeleteButton/>
        </Datagrid>
      )}
    </List>
  );
};

export default ActivitiesList;
