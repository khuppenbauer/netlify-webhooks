import * as React from 'react';
import {
  Filter,
  SelectInput,
  SearchInput,
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
        folder: facet('folder'),
        extension: facet('extension'),
        status: facet('status'),
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

  const { folder, extension, status } = data[0];
  return (
    <Filter {...props}>
      <SearchInput source="q" alwaysOn />
      <SelectInput
        source="folder"
        key="folder-filter"
        choices={folder.map((folderItem) => ({ id: folderItem.value, name: `${folderItem.value} (${folderItem.count})` }))}
      />
      <SelectInput
        source="extension"
        key="extension-filter"
        choices={extension.map((extensionItem) => ({ id: extensionItem.value, name: `${extensionItem.value} (${extensionItem.count})` }))}
      />
      <SelectInput
        source="status"
        key="status-filter"
        choices={status.map((statusItem) => ({ id: statusItem.value, name: `${statusItem.value} (${statusItem.count})` }))}
      />
    </Filter>
  );
};

export default FilesFilter;
