import * as React from 'react';
import PropTypes from 'prop-types';
import Clear from '@material-ui/icons/Clear';
import {
  useUpdateMany,
  useRefresh,
  useNotify,
  useUnselectAll,
  Button,
  CRUD_UPDATE_MANY,
} from 'react-admin';

const BulkDeactivateButton = ({ resource, selectedIds }) => {
  const notify = useNotify();
  const unselectAll = useUnselectAll('subscriptions');
  const refresh = useRefresh();
  const [deactivate, { loading }] = useUpdateMany(
    'subscriptions',
    selectedIds,
    { active: false },
    {
      action: CRUD_UPDATE_MANY,
      onSuccess: () => {
        notify(
          'subscription deactivation succeeded',
          'info',
          {},
          true,
        );
        unselectAll(resource);
        refresh();
      },
      onFailure: (error) => {
        notify(
          'subscription deactivation failed',
          'warning',
        );
      },
    },
  );

  return (
    <Button
      label="Deactivate"
      disabled={loading}
      onClick={deactivate}
    >
      <Clear />
    </Button>
  );
};

BulkDeactivateButton.propTypes = {
  resource: PropTypes.string.isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default BulkDeactivateButton;
