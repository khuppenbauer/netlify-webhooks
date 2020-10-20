import * as React from 'react';
import {
  List,
  Datagrid,
  NumberField,Pagination,
} from 'react-admin';
import NumeralField from '../../components/NumeralField';
import ReferenceField from '../../components/ReferenceField';
import DownloadField from '../../components/DownloadField';
import TracksFilter from './tracksFilter';

const TracksList = (props) => {
  const style = { whiteSpace: 'nowrap' };
  return (
    <List
      {...props}
      perPage={25}
      filters={<TracksFilter />}
      pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
      sort={{ field: 'createdAt', order: 'DESC' }}
    >
      <Datagrid>
        <ReferenceField source="id" reference="tracks" label="Name" property="name" />
        <NumeralField source="distance" options={{ from: 'm', precision: 2 }} style={style}/>
        <NumberField source="totalElevationGain" options={{ style: 'unit', unit: 'meter' }} style={style} />
        <NumberField source="totalElevationLoss" options={{ style: 'unit', unit: 'meter' }} style={style} />
        <DownloadField source="gpxFile" label="Download" />
      </Datagrid>
    </List>
  );
};

export default TracksList;
