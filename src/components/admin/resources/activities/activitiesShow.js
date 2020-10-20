import * as React from 'react';
import MuiGridList from '@material-ui/core/GridList';
import { makeStyles } from '@material-ui/core/styles';

import {
  Show,
  TextField,
  DateField,
  NumberField,
  BooleanField,
  TabbedShowLayout,
  Tab,
} from 'react-admin';
import JsonView from '../../components/JsonView';
import NumeralField from '../../components/NumeralField';
import DownloadField from '../../components/DownloadField';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: '-2px',
  },
  gridList: {
    width: '100%',
    margin: 0,
  },
  tileBar: {
    background:
      'linear-gradient(to top, rgba(0,0,0,0.8) 0%,rgba(0,0,0,0.4) 70%,rgba(0,0,0,0) 100%)',
  },
  placeholder: {
    backgroundColor: theme.palette.grey[300],
    height: '100%',
  },
  price: {
    display: 'inline',
    fontSize: '1em',
  },
  link: {
    color: '#fff',
  },
}));

const PhotosGrid = ({ record, source }) => {
  const classes = useStyles();
  const photos = record[source];
  if (!photos) return null;

  return (
    <div className={classes.root}>
      <MuiGridList
        cellHeight={180}
        cols={4}
        className={classes.gridList}
      >
        {Object.values(photos).map((photo) => (
            <img src={photo} alt="" key={photo} />
        ))}
      </MuiGridList>
    </div>
  );
};

const ActivitiesShow = (props) => {
  const style = { whiteSpace: 'nowrap' };
  return (
    <Show title="Activity" {...props}>
      <TabbedShowLayout>
        <Tab label="Data">
          <TextField source="name" />
          <DateField source="start_date" />
          <NumeralField source="distance" options={{ from: 'm', precision: 2 }}/>
          <NumberField source="total_elevation_gain" options={{ style: 'unit', unit: 'meter' }} style={style} />
          <NumberField source="elev_high" options={{ style: 'unit', unit: 'meter' }} style={style} />
          <NumberField source="elev_low" options={{ style: 'unit', unit: 'meter' }} style={style} />
          <NumeralField source="moving_time" options={{ from: 's', precision: 2 }}/>
          <NumeralField source="elapsed_time" options={{ from: 's' }}/>
          <NumeralField source="average_speed" options={{ from: 'm/s', to: 'km/h', precision: 1 }}/>
          <NumeralField source="max_speed" options={{ from: 'm/s', to: 'km/h', precision: 1 }}/>
        </Tab>
        <Tab label="Meta">
          <TextField source="type" />
          <JsonView source="start_latlng" />
          <JsonView source="end_latlng" />
          <TextField source="foreignKey" />
          <TextField source="visibility" />
          <BooleanField source="private" />
          <DateField source="createdAt" showTime/>
          <DateField source="updatedAt" showTime/>
        </Tab>
        <Tab label="Photos">
          <PhotosGrid source="photos" />
        </Tab>
        <Tab label="Download">
          <DownloadField source="gpxFile" label="Download" />
        </Tab>
      </TabbedShowLayout>
    </Show>
  );
};

export default ActivitiesShow;
