import * as React from 'react';
import { green, red, orange } from '@material-ui/core/colors';
import SuccessIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import PendingIcon from '@material-ui/icons/Autorenew';

const StatusField = ({ record = {}, source }) => {
  if (record[source] === undefined) {
    return (
      <div></div>
    );
  }
  return (
    {
      pending: <PendingIcon style={{ color: orange[900] }} />,
      success: <SuccessIcon style={{ color: green[900] }} />,
      error: <ErrorIcon style={{ color: red[900] }} />,
    }[record[source]]
  );
};

StatusField.defaultProps = {
  addLabel: true,
};

export default StatusField;
