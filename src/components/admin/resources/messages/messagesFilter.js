import * as React from 'react';
import {
  Filter,
  SelectInput,
  useQuery,
} from 'react-admin';

const MessagesFilter = (props) => {
  const pipeline = [
    {
      $match: props.filterValues,
    },
    {
      $group: {
        _id: 0,
        status: {
          $addToSet: '$status',
        },
        app: {
          $addToSet: '$app',
        },
        event: {
          $addToSet: '$event',
        },
      },
    },
  ];
  const { data } = useQuery({
    type: 'getAggregation',
    resource: 'messages',
    payload: {
      query: {
        type: 'aggregate',
        pipeline,
      },
    },
  });
  if (data === undefined) {
    return [];
  }
  const { app, event, status } = data[0];
  return (
    <Filter {...props}>
      <SelectInput
        source="app"
        key="app-filter"
        choices={app.map((appItem) => ({ id: appItem, name: appItem }))}
      />
      <SelectInput
        source="event"
        key="event-filter"
        choices={event.map((eventItem) => ({ id: eventItem, name: eventItem }))}
      />
      <SelectInput
        source="status"
        key="status-filter"
        choices={status.map((statusItem) => ({ id: statusItem, name: statusItem }))}
      />
    </Filter>
  );
};

export default MessagesFilter;
