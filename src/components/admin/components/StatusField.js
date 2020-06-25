import * as React from 'react';
import { green, red } from '@material-ui/core/colors';
import SuccessIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';

const StatusField = ({ record = {}, source }) => {
  return record[source] === 'success' ? (
    <SuccessIcon style={{ color: green[900] }} />
  ) : (
    <ErrorIcon style={{ color: red[900] }} />
  );
};

StatusField.defaultProps = {
  addLabel: true,
};

export default StatusField;
