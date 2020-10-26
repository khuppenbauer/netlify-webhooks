import * as React from 'react';
import { Fragment } from 'react';
import {
  List,
  Datagrid,
  Pagination,
  BulkDeleteButton,
  ShowButton,
} from 'react-admin';
import FilesFilter from './filesFilter';
import DownloadField from '../../components/DownloadField';
import ReferenceField from '../../components/ReferenceField';
import NumeralField from '../../components/NumeralField';

const FilesBulkActionButtons = (props) => (
  <Fragment>
    <BulkDeleteButton {...props} />
  </Fragment>
);

const FilesList = (props) => {
  const style = { whiteSpace: 'nowrap' };
  return (
    <List {...props}
      perPage={25}
      filters={<FilesFilter />}
      pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
      sort={{ field: 'updatedAt', order: 'DESC' }}
      bulkActionButtons={<FilesBulkActionButtons />}
    >
      <Datagrid>
        <ReferenceField source="id" reference="files" label="Name" property="name" sortBy="name" />
        <NumeralField source="size" options={{ from: 'B' }} style={style}/>
        <DownloadField source="path_display" label="Download" />
        <ShowButton/>
      </Datagrid>
    </List>
  );
};

export default FilesList;
