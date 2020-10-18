import * as React from 'react';
import {
  Filter,
  SelectInput,
  useQuery,
} from 'react-admin';

const MessagesFilter = (props) => {
  const facet = (field) => [
    {
      $group: {
        _id: `$${field}`,
        count: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        value: '$_id',
        count: 1,
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
  ];

  const pipeline = [
    {
      $match: props.filterValues,
    },
    {
      $facet: {
        app: facet('app'),
        event: facet('event'),
        status: facet('status'),
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
  if (data === undefined || data.length === 0) {
    return [];
  }
  const { app, event, status } = data[0];
  return (
    <Filter {...props}>
      <SelectInput
        source="app"
        key="app-filter"
        choices={app.map((appItem) => ({ id: appItem.value, name: `${appItem.value} (${appItem.count})` }))}
      />
      <SelectInput
        source="event"
        key="event-filter"
        choices={event.map((eventItem) => ({ id: eventItem.value, name: `${eventItem.value} (${eventItem.count})` }))}
      />
      <SelectInput
        source="status"
        key="status-filter"
        choices={status.map((statusItem) => ({ id: statusItem.value, name: `${statusItem.value} (${statusItem.count})` }))}
      />
    </Filter>
  );
};

export default MessagesFilter;
