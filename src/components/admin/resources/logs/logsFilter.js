import * as React from 'react';
import {
  Filter,
  SelectInput,
  useQuery,
} from 'react-admin';

const LogsFilter = (props) => {
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
        host: facet('host'),
        path: facet('path'),
        action: facet('action'),
        status: facet('status'),
      },
    },
  ];
  const { data } = useQuery({
    type: 'getAggregation',
    resource: 'logs',
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
  const {
    host, path, action, status,
  } = data[0];
  return (
    <Filter {...props}>
      <SelectInput
        source="host"
        key="host-filter"
        choices={host.map((hostItem) => ({ id: hostItem.value, name: `${hostItem.value} (${hostItem.count})` }))}
      />
      <SelectInput
        source="path"
        key="path-filter"
        choices={path.map((pathItem) => ({ id: pathItem.value, name: `${pathItem.value} (${pathItem.count})` }))}
      />
      <SelectInput
        source="action"
        key="action-filter"
        choices={action.map((actionItem) => ({ id: actionItem.value, name: `${actionItem.value} (${actionItem.count})` }))}
      />
      <SelectInput
        source="status"
        key="status-filter"
        choices={status.map((statusItem) => ({ id: statusItem.value, name: `${statusItem.value} (${statusItem.count})` }))}
      />
    </Filter>
  );
};

export default LogsFilter;
