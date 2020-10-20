import * as React from 'react';
import {
  Filter,
  SelectInput,
  SearchInput,
  useQuery,
} from 'react-admin';

const ActivitiesFilter = (props) => {
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
  const { q } = props.filterValues;
  let search = props.filterValues;
  if (q) {
    search = {
      ...props.filterValues,
      name: {
        $regex: q,
        $options: 'i',
      },
    };
    delete search['q'];
  }
  const pipeline = [
    {
      $match: search,
    },
    {
      $facet: {
        type: facet('type'),
      },
    },
  ];
  const { data } = useQuery({
    type: 'getAggregation',
    resource: 'activities',
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
  const { type } = data[0];
  return (
    <Filter {...props}>
      <SearchInput source="q" alwaysOn />
      <SelectInput
        source="type"
        key="type-filter"
        choices={type.map((typeItem) => ({ id: typeItem.value, name: `${typeItem.value} (${typeItem.count})` }))}
      />
    </Filter>
  );
};

export default ActivitiesFilter;
