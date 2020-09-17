import * as React from 'react';
import {
  Filter,
  SelectInput,
  useQuery,
} from 'react-admin';

const FilesFilter = (props) => {
  const pipeline = [
    {
      $match: props.filterValues,
    },
    {
      $group: {
        _id: 0,
        mimeType: {
          $addToSet: '$mimeType',
        },
        extension: {
          $addToSet: '$extension',
        },
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
  if (data === undefined) {
    return [];
  }
  const { mimeType, extension } = data[0];
  return (
    <Filter {...props}>
      <SelectInput
        source="mimeType"
        key="mimeType-filter"
        choices={mimeType.map((mimeTypeItem) => ({ id: mimeTypeItem, name: mimeTypeItem }))}
      />
      <SelectInput
        source="extension"
        key="extension-filter"
        choices={extension.map((extensionItem) => ({ id: extensionItem, name: extensionItem }))}
      />
    </Filter>
  );
};

export default FilesFilter;
