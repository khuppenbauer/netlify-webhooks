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

const BulkStatusButton = ({ resource, selectedIds, status }) => {
  const notify = useNotify();
  const unselectAll = useUnselectAll(resource);
  const refresh = useRefresh();
  const [setStatus, { loading }] = useUpdateMany(
    resource,
    selectedIds,
    { status },
    {
      action: CRUD_UPDATE_MANY,
      onSuccess: () => {
        notify(
          `Status ${status} succeeded`,
          'info',
          {},
          true,
        );
        unselectAll(resource);
        refresh();
      },
      onFailure: (error) => {
        notify(
          `Status ${status} failed`,
          'warning',
        );
      },
    },
  );
  const label = `Status ${status}`;
  return (
    <Button
      label={label}
      disabled={loading}
      onClick={setStatus}
    >
      <Check />
    </Button>
  );
};

BulkStatusButton.propTypes = {
  resource: PropTypes.string.isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.any).isRequired,
  status: PropTypes.string,
};

export default BulkStatusButton;
