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

const TracksGrid = (props) => {
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
                  <TextField source="gpxFile" record={data[id]}/>
                </span>
                <ShowButton basePath="/tracks" record={data[id]}/>
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
              <NumberField source="totalElevationGain" record={data[id]} options={{ style: 'unit', unit: 'meter' }}/>
            </span>
            <span className={classes.cardContentRow}>
              Elev high:&nbsp;
              <NumberField source="elevHigh" record={data[id]} options={{ style: 'unit', unit: 'meter' }}/>
            </span>
            <span className={classes.cardContentRow}>
              Elev low:&nbsp;
              <NumberField source="elevLow" record={data[id]} options={{ style: 'unit', unit: 'meter' }}/>
            </span>
            <DeleteButton basePath="/tracks" resource="tracks" record={data[id]}/>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const TracksList = (props) => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const style = { whiteSpace: 'nowrap' };
  return (
    <List
      {...props}
      perPage={25}
      sort={{ field: 'createdAt', order: 'DESC' }}
    >
      {isSmall ? (
        <TracksGrid />
      ) : (
        <Datagrid
          rowClick="show"
        >
          <TextField source="gpxFile" />
          <NumeralField source="distance" options={{ from: 'm', to: 'km' }} style={style}/>
          <NumberField source="totalElevationGain" options={{ style: 'unit', unit: 'meter' }} style={style} />
          <NumberField source="elevHigh" options={{ style: 'unit', unit: 'meter' }} style={style} />
          <NumberField source="elevLow" options={{ style: 'unit', unit: 'meter' }} style={style} />
          <DeleteButton/>
        </Datagrid>
      )}
    </List>
  );
};

export default TracksList;
