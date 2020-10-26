import * as React from 'react';
import {
  Show,
  TextField,
  DateField,
  TabbedShowLayout,
  Tab,
} from 'react-admin';
import JsonView from '../../components/JsonView';
import DownloadField from '../../components/DownloadField';
import MapboxField from '../../components/MapboxField';

const FeaturesShow = (props) => {
  return (
    <Show title="Feature" {...props}>
      <TabbedShowLayout>
        <Tab label="Data">
          <TextField source="name" />
          <TextField source="type" />
          <TextField source="source" />
          <TextField source="city" />
          <TextField source="state" />
          <TextField source="country" />
        </Tab>
        <Tab label="Meta">
          <TextField source="foreignKey" />
          <JsonView source="meta" />
          <DateField source="createdAt" showTime/>
          <DateField source="updatedAt" showTime/>
        </Tab>
        <Tab label="Downloads">
          <DownloadField source="gpxFile"/>
        </Tab>
        <Tab label="Map">
          <MapboxField/>
        </Tab>
        <Tab label="GeoJson">
          <JsonView source="geoJson" />
        </Tab>
      </TabbedShowLayout>
    </Show>
  );
};

export default FeaturesShow;
