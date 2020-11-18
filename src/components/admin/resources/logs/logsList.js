import * as React from 'react';
import { Fragment, useState } from 'react';
import {
  Tabs,
  Tab,
} from '@material-ui/core';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  NumberField,
  Pagination,
  BulkDeleteButton,
} from 'react-admin';
import LogsFilter from './logsFilter';

const LogsBulkActionButtons = (props) => (
  <Fragment>
    <BulkDeleteButton {...props} />
  </Fragment>
);

const TabbedDataGrid = ({
  ids,
  data,
}) => {
  const chartsBaseUrl = process.env.REACT_APP_CHARTS_BASE_URL;
  const chartsId = process.env.REACT_APP_CHARTS_ID;
  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const divStyle = {
    background: '#FFFFFF',
    border: 'none',
    'border-radius': '2px',
    'box-shadow': '0 2px 10px 0 rgba(70, 76, 79, .2)',
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
        <Tab label="chart" />
      </Tabs>
      <div>
        {value === 0 && (
          <Datagrid
            rowClick="show"
          >
            <TextField source="urlOrigin"/>
            <TextField source="urlPathname"/>
            <TextField source="urlAction"/>
            <TextField source="status" />
            <NumberField source="responseTime" />
            <DateField source="createdAt" showTime/>
          </Datagrid>
        )}
        {value === 1 && (
          <iframe
            title="chart"
            style={divStyle}
            width="640"
            height="480"
            src={`${chartsBaseUrl}/embed/charts?id=${chartsId}&theme=light`} />
        )}
      </div>
    </>
  );
};

const LogsList = (props) => {
  return (
    <List {...props}
      perPage={25}
      filters={<LogsFilter />}
      pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
      sort={{ field: 'createdAt', order: 'DESC' }}
      bulkActionButtons={<LogsBulkActionButtons />}
    >
      <TabbedDataGrid />
    </List>
  );
};

export default LogsList;
