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

const BulkActivateButton = ({ resource, selectedIds }) => {
  const notify = useNotify();
  const unselectAll = useUnselectAll('subscriptions');
  const refresh = useRefresh();
  const [activate, { loading }] = useUpdateMany(
    'subscriptions',
    selectedIds,
    { active: true },
    {
      action: CRUD_UPDATE_MANY,
      onSuccess: () => {
        notify(
          'subscription activation succeeded',
          'info',
          {},
          true,
        );
        unselectAll(resource);
        refresh();
      },
      onFailure: (error) => {
        notify(
          'subscription activation failed',
          'warning',
        );
      },
    },
  );

  return (
    <Button
      label="Activate"
      disabled={loading}
      onClick={activate}
    >
      <Check />
    </Button>
  );
};

BulkActivateButton.propTypes = {
  resource: PropTypes.string.isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default BulkActivateButton;
