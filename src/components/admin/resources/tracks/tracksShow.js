import * as React from 'react';
import {
  Show,
  SimpleShowLayout,
  TextField,
} from 'react-admin';
import JsonView from '../../components/JsonView';

const TracksShow = (props) => (
  <Show title="track" {...props}>
    <SimpleShowLayout>
      <TextField source="gpxFile"/>
      <TextField source="geoJsonFile"/>
      <TextField source="staticImage"/>
      <TextField source="distance" />
      <TextField source="totalElevationGain" />
      <TextField source="totalElevationLoss" />
      <TextField source="elevHigh" />
      <TextField source="elevLow" />
      <TextField source="startCity" />
      <TextField source="startState" />
      <TextField source="startCountry" />
      <TextField source="endCity" />
      <TextField source="endState" />
      <TextField source="endCountry" />
      <TextField source="startElevation" />
      <TextField source="endElevation" />
      <JsonView source="geoJson" />
      <JsonView source="endCoords" />
      <JsonView source="startCoords" />
      <JsonView source="minCoords" />
      <JsonView source="maxCoords" />
    </SimpleShowLayout>
  </Show>
);

export default TracksShow;
