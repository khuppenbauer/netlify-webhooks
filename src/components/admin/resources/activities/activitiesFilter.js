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
        status: facet('status'),
        city: facet('city'),
        state: facet('state'),
        country: facet('country'),
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
  const {
    type,
    status,
    city,
    state,
    country,
  } = data[0];
  return (
    <Filter {...props}>
      <SearchInput source="q" alwaysOn />
      <SelectInput
        source="type"
        key="type-filter"
        choices={type.map((typeItem) => ({ id: typeItem.value, name: `${typeItem.value} (${typeItem.count})` }))}
      />
      <SelectInput
        source="status"
        key="status-filter"
        choices={status.map((statusItem) => ({ id: statusItem.value, name: `${statusItem.value} (${statusItem.count})` }))}
      />
      <SelectInput
        source="city"
        key="city-filter"
        choices={city.map((cityItem) => ({ id: cityItem.value, name: `${cityItem.value} (${cityItem.count})` }))}
      />
      <SelectInput
        source="state"
        key="state-filter"
        choices={state.map((stateItem) => ({ id: stateItem.value, name: `${stateItem.value} (${stateItem.count})` }))}
      />
      <SelectInput
        source="country"
        key="country-filter"
        choices={country.map((countryItem) => ({ id: countryItem.value, name: `${countryItem.value} (${countryItem.count})` }))}
      />
    </Filter>
  );
};

export default ActivitiesFilter;
