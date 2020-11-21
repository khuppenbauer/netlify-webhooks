import * as React from 'react';
import PropTypes from 'prop-types';
import Replay from '@material-ui/icons/Replay';
import {
  useUpdateMany,
  useRefresh,
  useNotify,
  useUnselectAll,
  Button,
  CRUD_UPDATE_MANY,
} from 'react-admin';

const BulkExecuteButton = ({ resource, selectedIds }) => {
  const notify = useNotify();
  const unselectAll = useUnselectAll();
  const refresh = useRefresh();
  const [executeMany, { loading }] = useUpdateMany(
    'trigger-messagequeue',
    selectedIds,
    {},
    {
      action: CRUD_UPDATE_MANY,
      onSuccess: () => {
        notify(
          'messages executed',
          'info',
          { smart_count: selectedIds.length },
          true,
        );
        unselectAll(resource);
        refresh();
      },
      onFailure: (error) => {
        notify(
          typeof error === 'string'
            ? error
            : error.message || 'messages executed failed',
          'warning',
        );
      },
    },
  );

  return (
    <Button
      label="Execute"
      disabled={loading}
      onClick={executeMany}
    >
      <Replay />
    </Button>
  );
};

BulkExecuteButton.propTypes = {
  resource: PropTypes.string.isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default BulkExecuteButton;
