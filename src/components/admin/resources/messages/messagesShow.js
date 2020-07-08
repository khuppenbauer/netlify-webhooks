import * as React from 'react';
import {
  Show,
  SimpleShowLayout,
  TextField,
  DateField,
} from 'react-admin';
import JsonView from '../../components/JsonView';
import StatusField from '../../components/StatusField';
import ExecuteButton from '../../components/ExecuteButton';

const MessageShowActions = ({ data }) => (
  <ExecuteButton record={data}/>
);

const MessagesShow = (props) => (
  <Show title="Message" actions={<MessageShowActions />} {...props}>
    <SimpleShowLayout>
      <StatusField source="status" />
      <TextField source="foreignKey" />
      <TextField source="app" />
      <TextField source="event" />
      <TextField source="path" />
      <TextField source="httpMethod" />
      <DateField source="createdAt" />
      <DateField source="updatedAt" />
      <JsonView source="body" />
      <JsonView source="message" />
    </SimpleShowLayout>
  </Show>
);

export default MessagesShow;
