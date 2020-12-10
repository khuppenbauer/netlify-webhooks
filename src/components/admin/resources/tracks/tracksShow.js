import * as React from 'react';
import {
  Show,
  TextField,
  DateField,
  NumberField,
  TabbedShowLayout,
  Tab,
  ReferenceManyField,
  SingleFieldList,
  ImageField,
} from 'react-admin';
import JsonView from '../../components/JsonView';
import FileDisplayField from '../../components/FileDisplayField';
import DownloadField from '../../components/DownloadField';
import NumeralField from '../../components/NumeralField';
import MapboxField from '../../components/MapboxField';

const TracksShow = (props) => {
  const style = { whiteSpace: 'nowrap' };
  return (
    <Show title="Track" {...props}>
      <TabbedShowLayout>
        <Tab label="Data">
          <TextField source="name" />
          <FileDisplayField source="staticImage"/>
          <NumeralField source="distance" options={{ from: 'm', precision: 2 }}/>
          <NumberField source="totalElevationGain" options={{ style: 'unit', unit: 'meter' }} style={style} />
          <NumberField source="totalElevationLoss" options={{ style: 'unit', unit: 'meter' }} style={style} />
          <TextField source="startCity" />
          <TextField source="startState" />
          <TextField source="startCountry" />
          <TextField source="endCity" />
          <TextField source="endState" />
          <TextField source="endCountry" />
        </Tab>
        <Tab label="Meta">
          <NumberField source="elevLow" options={{ style: 'unit', unit: 'meter' }} style={style} />
          <NumberField source="elevHigh" options={{ style: 'unit', unit: 'meter' }} style={style} />
          <NumberField source="startElevation" options={{ style: 'unit', unit: 'meter' }} style={style} />
          <NumberField source="endElevation" options={{ style: 'unit', unit: 'meter' }} style={style} />
          <DateField source="startTime" showTime/>
          <DateField source="endTime" showTime/>
          <JsonView source="endCoords" />
          <JsonView source="startCoords" />
          <JsonView source="minCoords" />
          <JsonView source="maxCoords" />
          <DateField source="createdAt" showTime/>
          <DateField source="updatedAt" showTime/>
        </Tab>
        <Tab label="Photos">
          <ReferenceManyField
            reference="photos"
            target="track"
            label="photos"
          >
            <SingleFieldList>
              <ImageField source="url"/>
            </SingleFieldList>
          </ReferenceManyField>
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

export default TracksShow;
