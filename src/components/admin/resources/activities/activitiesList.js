import * as React from 'react';
import { Fragment } from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  NumberField,
  BulkDeleteButton,
  Pagination,
} from 'react-admin';
import NumeralField from '../../components/NumeralField';
import DownloadField from '../../components/DownloadField';
import ReferenceField from '../../components/ReferenceField';
import StatusField from '../../components/StatusField';
import BulkImportButton from '../../components/BulkImportButton';
import ActivitiesFilter from './activitiesFilter';

const ActivitiesBulkActionButtons = (props) => (
  <Fragment>
    <BulkImportButton {...props} />
    <BulkDeleteButton {...props} />
  </Fragment>
);

const ActivitiesList = (props) => {
  const style = { whiteSpace: 'nowrap' };
  return (
    <List
      {...props}
      perPage={25}
      filters={<ActivitiesFilter />}
      pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
      sort={{ field: 'start_date', order: 'DESC' }}
      bulkActionButtons={<ActivitiesBulkActionButtons />}
    >
      <Datagrid>
        <StatusField source="status" label="Status" />
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
