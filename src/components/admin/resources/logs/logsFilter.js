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
        urlOrigin: facet('urlOrigin'),
        urlPathname: facet('urlPathname'),
        urlAction: facet('urlAction'),
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
  const { urlOrigin, urlPathname, urlAction, status } = data[0];
  return (
    <Filter {...props}>
      <SelectInput
        source="urlOrigin"
        key="urlOrigin-filter"
        choices={urlOrigin.map((urlOriginItem) => ({ id: urlOriginItem.value, name: `${urlOriginItem.value} (${urlOriginItem.count})` }))}
      />
      <SelectInput
        source="urlPathname"
        key="urlPathname-filter"
        choices={urlPathname.map((urlPathnameItem) => ({ id: urlPathnameItem.value, name: `${urlPathnameItem.value} (${urlPathnameItem.count})` }))}
      />
      <SelectInput
        source="urlAction"
        key="urlAction-filter"
        choices={urlAction.map((urlActionItem) => ({ id: urlActionItem.value, name: `${urlActionItem.value} (${urlActionItem.count})` }))}
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
