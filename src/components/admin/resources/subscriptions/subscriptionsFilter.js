import * as React from 'react';
import {
  Filter,
  SelectInput,
  useQuery,
} from 'react-admin';

const SubscriptionsFilter = (props) => {
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
        active: facet('active'),
      },
    },
  ];
  const { data } = useQuery({
    type: 'getAggregation',
    resource: 'subscriptions',
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
  const { app, event, active } = data[0];
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
        source="active"
        key="active-filter"
        choices={active.map((activeItem) => ({ id: activeItem.value, name: `${activeItem.value} (${activeItem.count})` }))}
      />
    </Filter>
  );
};

export default SubscriptionsFilter;
