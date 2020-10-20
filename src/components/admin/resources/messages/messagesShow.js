import * as React from 'react';
import {
  Show,
  TextField,
  DateField,
  TabbedShowLayout,
  Tab,
} from 'react-admin';
import JsonView from '../../components/JsonView';
import StatusField from '../../components/StatusField';
import ExecuteButton from '../../components/ExecuteButton';

const MessageShowActions = ({ data }) => (
  <ExecuteButton record={data}/>
);

const MessagesShow = (props) => (
  <Show title="Message" actions={<MessageShowActions />} {...props}>
    <TabbedShowLayout>
      <Tab label="Message">
        <JsonView source="body" label="Message" />
      </Tab>
      <Tab label="Meta">
        <StatusField source="status" />
        <TextField source="foreignKey" />
        <TextField source="app" />
        <TextField source="event" />
        <DateField source="createdAt" showTime />
        <DateField source="updatedAt" showTime />
      </Tab>
      <Tab label="Request">
        <TextField source="httpMethod" />
        <TextField source="path" />
        <JsonView source="queryStringParameters" />
        <JsonView source="headers" />
        <JsonView source="body" />
      </Tab>
      <Tab label="Subscriptions">
        <JsonView source="message" label="Subscriptions" />
      </Tab>
    </TabbedShowLayout>
  </Show>
);

export default MessagesShow;
