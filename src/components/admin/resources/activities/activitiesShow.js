import * as React from 'react';
import {
  Show,
  SimpleShowLayout,
  TextField,
  DateField,
  BooleanField,
} from 'react-admin';
import JsonView from '../../components/JsonView';

const ActivitiesShow = (props) => (
  <Show title="Activity" {...props}>
    <SimpleShowLayout>
      <DateField source="start_date" />
      <JsonView source="athlete" />
      <TextField source="name" />
      <TextField source="distance" />
      <TextField source="moving_time" />
      <TextField source="elapsed_time" />
      <TextField source="total_elevation_gain" />
      <TextField source="type" />
      <TextField source="id" />
      <TextField source="visibility" />
      <TextField source="average_speed" />
      <TextField source="max_speed" />
      <TextField source="elev_high" />
      <TextField source="elev_low" />
      <JsonView source="start_latlng" />
      <JsonView source="end_latlng" />
      <JsonView source="photos" />
      <BooleanField source="private" />
    </SimpleShowLayout>
  </Show>
);

export default ActivitiesShow;
