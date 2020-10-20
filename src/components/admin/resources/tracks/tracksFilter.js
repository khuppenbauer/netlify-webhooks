import * as React from 'react';
import {
  Filter,
  SelectInput,
  SearchInput,
  DateInput,
  useQuery,
} from 'react-admin';

const TracksFilter = (props) => {
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
        endCity: facet('endCity'),
        endState: facet('endState'),
        endCountry: facet('endCountry'),
        startCity: facet('startCity'),
        startState: facet('startState'),
        startCountry: facet('startCountry'),
      },
    },
  ];
  const { data } = useQuery({
    type: 'getAggregation',
    resource: 'tracks',
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
    startCity,
    startState,
    startCountry,
    endCity,
    endState,
    endCountry,
  } = data[0];
  return (
    <Filter {...props}>
      <SearchInput source="q" alwaysOn />
      <DateInput source="date_gte" alwaysOn />
      <DateInput source="date_lte" alwaysOn />
      <SelectInput
        source="startCity"
        key="startCity-filter"
        choices={startCity.map((startCityItem) => ({ id: startCityItem.value, name: `${startCityItem.value} (${startCityItem.count})` }))}
      />
      <SelectInput
        source="startState"
        key="startState-filter"
        choices={startState.map((startStateItem) => ({ id: startStateItem.value, name: `${startStateItem.value} (${startStateItem.count})` }))}
      />
      <SelectInput
        source="startCountry"
        key="startCountry-filter"
        choices={startCountry.map((startCountryItem) => ({ id: startCountryItem.value, name: `${startCountryItem.value} (${startCountryItem.count})` }))}
      />
      <SelectInput
        source="endCity"
        key="endCity-filter"
        choices={endCity.map((endCityItem) => ({ id: endCityItem.value, name: `${endCityItem.value} (${endCityItem.count})` }))}
      />
      <SelectInput
        source="endState"
        key="endState-filter"
        choices={endState.map((endStateItem) => ({ id: endStateItem.value, name: `${endStateItem.value} (${endStateItem.count})` }))}
      />
      <SelectInput
        source="endCountry"
        key="endCountry-filter"
        choices={endCountry.map((endCountryItem) => ({ id: endCountryItem.value, name: `${endCountryItem.value} (${endCountryItem.count})` }))}
      />
    </Filter>
  );
};

export default TracksFilter;
