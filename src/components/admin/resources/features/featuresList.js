import * as React from 'react';
import { useState } from 'react';
import {
  Tabs,
  Tab,
} from '@material-ui/core';
import {
  List,
  Datagrid,
  TextField,
  Pagination,
} from 'react-admin';
import ReferenceField from '../../components/ReferenceField';
import DownloadField from '../../components/DownloadField';
import FeaturesFilter from './featuresFilter';
import MapboxField from '../../components/MapboxField';

const TabbedDataGrid = ({
  ids,
  data,
}) => {
  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <>
      <Tabs
        variant="fullWidth"
        centered
        value={value}
        indicatorColor="primary"
        onChange={handleChange}
      >
        <Tab label="list" />
        <Tab label="map" />
      </Tabs>
      <div>
        {value === 0 && (
          <Datagrid>
            <ReferenceField source="id" reference="features" label="Name" property="name" sortBy="name" />
            <TextField source="type"/>
            <TextField source="source"/>
            <DownloadField source="gpxFile" label="Download" />
          </Datagrid>
        )}
        {value === 1 && (
          <div>
            <MapboxField ids={ids} data={data} />
          </div>
        )}
      </div>
    </>
  );
};

const FeaturesList = (props) => {
  return (
    <List
      {...props}
      perPage={25}
      filters={<FeaturesFilter />}
      pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
      sort={{ field: 'createdAt', order: 'DESC' }}
    >
      <TabbedDataGrid />
    </List>
  );
};

export default FeaturesList;
