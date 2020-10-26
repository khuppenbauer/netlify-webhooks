import * as React from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  NumberField,
  Pagination,
} from 'react-admin';
import NumeralField from '../../components/NumeralField';
import DownloadField from '../../components/DownloadField';
import ReferenceField from '../../components/ReferenceField';
import ActivitiesFilter from './activitiesFilter';

const ActivitiesList = (props) => {
  const style = { whiteSpace: 'nowrap' };
  return (
    <List
      {...props}
      perPage={25}
      filters={<ActivitiesFilter />}
      pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
      sort={{ field: 'start_date', order: 'DESC' }}
    >
      <Datagrid>
        <DateField source="start_date" />
        <ReferenceField source="id" reference="activities" label="Name" property="name" sortBy="name" />
        <TextField source="type" />
        <NumeralField source="distance" options={{ from: 'm', precision: 2 }} style={style}/>
        <NumberField source="total_elevation_gain" options={{ style: 'unit', unit: 'meter' }} style={style} />
        <DownloadField source="gpxFile" label="Download" />
      </Datagrid>
    </List>
  );
};

export default ActivitiesList;
