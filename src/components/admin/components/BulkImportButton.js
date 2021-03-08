import * as React from 'react';
import PropTypes from 'prop-types';
import CloudUpload from '@material-ui/icons/CloudUpload';
import {
  useUpdateMany,
  useRefresh,
  useNotify,
  useUnselectAll,
  Button,
  CRUD_UPDATE_MANY,
} from 'react-admin';

const BulkImportButton = ({ resource, selectedIds }) => {
  const notify = useNotify();
  const unselectAll = useUnselectAll();
  const refresh = useRefresh();
  const [executeMany, { loading }] = useUpdateMany(
    'trigger-activities',
    selectedIds,
    {},
    {
      action: CRUD_UPDATE_MANY,
      onSuccess: () => {
        notify(
          'activities importet',
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
            : error.message || 'activities import failed',
          'warning',
        );
      },
    },
  );

  return (
    <Button
      label="Import"
      disabled={loading}
      onClick={executeMany}
    >
      <CloudUpload />
    </Button>
  );
};

BulkImportButton.propTypes = {
  resource: PropTypes.string.isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default BulkImportButton;
