import * as React from 'react';
import { green, red, orange, blue } from '@material-ui/core/colors';
import SuccessIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import WarningIcon from '@material-ui/icons/Warning';
import PendingIcon from '@material-ui/icons/Autorenew';
import CloudUpload from '@material-ui/icons/CloudUpload';
import CloudDone from '@material-ui/icons/CloudDone';

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
      warning: <WarningIcon style={{ color: orange[900] }} />,
      new: <CloudUpload style={{ color: blue[900] }} />,
      synced: <CloudDone style={{ color: blue[900] }} />,
    }[record[source]]
  );
};

StatusField.defaultProps = {
  addLabel: true,
};

export default StatusField;
