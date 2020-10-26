import * as React from 'react';
import {
  List,
  Datagrid,
  TextField,
  Pagination,
} from 'react-admin';
import ReferenceField from '../../components/ReferenceField';
import DownloadField from '../../components/DownloadField';
import FeaturesFilter from './featuresFilter';

const FeaturesList = (props) => {
  return (
    <List
      {...props}
      perPage={25}
      filters={<FeaturesFilter />}
      pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
      sort={{ field: 'createdAt', order: 'DESC' }}
    >
      <Datagrid>
        <ReferenceField source="id" reference="features" label="Name" property="name" />
        <TextField source="type"/>
        <TextField source="source"/>
        <DownloadField source="gpxFile" label="Download" />
      </Datagrid>
    </List>
  );
};

export default FeaturesList;
