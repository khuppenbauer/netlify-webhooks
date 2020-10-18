import * as React from 'react';
import {
  Filter,
  SelectInput,
  useQuery,
} from 'react-admin';

const FilesFilter = (props) => {
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
        mimeType: facet('mimeType'),
        extension: facet('extension'),
      },
    },
  ];
  const { data } = useQuery({
    type: 'getAggregation',
    resource: 'files',
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

  const { mimeType, extension } = data[0];
  return (
    <Filter {...props}>
      <SelectInput
        source="mimeType"
        key="mimeType-filter"
        choices={mimeType.map((mimeTypeItem) => ({ id: mimeTypeItem.value, name: `${mimeTypeItem.value} (${mimeTypeItem.count})` }))}
      />
      <SelectInput
        source="extension"
        key="extension-filter"
        choices={extension.map((extensionItem) => ({ id: extensionItem.value, name: `${extensionItem.value} (${extensionItem.count})` }))}
      />
    </Filter>
  );
};

export default FilesFilter;
