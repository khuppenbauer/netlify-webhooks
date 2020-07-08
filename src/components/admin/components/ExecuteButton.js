import * as React from 'react';
import PropTypes from 'prop-types';
import Replay from '@material-ui/icons/Replay';
import {
  useUpdate,
  useNotify,
  useRedirect,
  Button,
} from 'react-admin';

const ExecuteButton = ({ record }) => {
  const notify = useNotify();
  const redirectTo = useRedirect();

  const [execute, { loading }] = useUpdate(
    'messageQueue',
    record.id,
    {},
    record,
    {
      undoable: true,
      onSuccess: () => {
        notify(
          'message executed',
          'info',
          {},
          true,
        );
        redirectTo('/messages');
      },
      onFailure: () => {
        notify(
          'message executed failed',
          'warning',
        );
      },
    },
  );
  return (
    <Button
      label="Execute"
      disabled={loading}
      onClick={execute}
    >
      <Replay />
    </Button>
  );
};

ExecuteButton.propTypes = {
  record: PropTypes.any,
};

export default ExecuteButton;
