import * as React from 'react';
import {
  Filter,
  SelectInput,
  SearchInput,
  useQuery,
} from 'react-admin';

const FeaturesFilter = (props) => {
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
        city: facet('city'),
        state: facet('state'),
        country: facet('country'),
        type: facet('type'),
        source: facet('source'),
      },
    },
  ];
  const { data } = useQuery({
    type: 'getAggregation',
    resource: 'features',
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
    city,
    state,
    country,
    type,
    source,
  } = data[0];
  return (
    <Filter {...props}>
      <SearchInput source="q" alwaysOn />
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
      <SelectInput
        source="type"
        key="type-filter"
        choices={type.map((typeItem) => ({ id: typeItem.value, name: `${typeItem.value} (${typeItem.count})` }))}
      />
      <SelectInput
        source="source"
        key="source-filter"
        choices={source.map((sourceItem) => ({ id: sourceItem.value, name: `${sourceItem.value} (${sourceItem.count})` }))}
      />
    </Filter>
  );
};

export default FeaturesFilter;
