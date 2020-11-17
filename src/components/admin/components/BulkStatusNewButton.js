import * as React from 'react';
import PropTypes from 'prop-types';
import Check from '@material-ui/icons/Check';
import {
  useUpdateMany,
  useRefresh,
  useNotify,
  useUnselectAll,
  Button,
  CRUD_UPDATE_MANY,
} from 'react-admin';

const BulkStatusNewButton = ({ resource, selectedIds }) => {
  console.log([resource, selectedIds]);
  const notify = useNotify();
  const unselectAll = useUnselectAll('files');
  const refresh = useRefresh();
  const [setStatus, { loading }] = useUpdateMany(
    'files',
    selectedIds,
    { status: 'new' },
    {
      action: CRUD_UPDATE_MANY,
      onSuccess: () => {
        notify(
          'files status new succeeded',
          'info',
          {},
          true,
        );
        unselectAll(resource);
        refresh();
      },
      onFailure: (error) => {
        notify(
          'files status new failed',
          'warning',
        );
      },
    },
  );

  return (
    <Button
      label="Status New"
      disabled={loading}
      onClick={setStatus}
    >
      <Check />
    </Button>
  );
};

BulkStatusNewButton.propTypes = {
  resource: PropTypes.string.isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default BulkStatusNewButton;
