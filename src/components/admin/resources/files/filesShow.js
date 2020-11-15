import * as React from 'react';
import {
  Show,
  TextField,
  DateField,
  TabbedShowLayout,
  Tab,
} from 'react-admin';
import DownloadField from '../../components/DownloadField';
import FileDisplayField from '../../components/FileDisplayField';
import NumeralField from '../../components/NumeralField';

const FilesShow = (props) => {
  const style = { whiteSpace: 'nowrap' };
  return (
    <Show title="File" {...props}>
      <TabbedShowLayout>
        <Tab label="File">
          <FileDisplayField source="path_display"/>
          <DownloadField source="path_display" label="Download"/>
          <TextField source="name"/>
          <TextField source="path_display"/>
          <TextField source="path_lower"/>
        </Tab>
        <Tab label="Meta">
          <NumeralField source="size" options={{ from: 'B' }} style={style}/>
          <TextField source="mimeType"/>
          <TextField source="extension"/>
          <TextField source="sha1"/>
          <TextField source="foreignKey"/>
          <DateField source="client_modified" showTime/>
          <DateField source="server_modified" showTime/>
          <DateField source="createdAt" showTime/>
          <DateField source="updatedAt" showTime/>
          <TextField source="status"/>
        </Tab>
      </TabbedShowLayout>
    </Show>
  );
};

export default FilesShow;
