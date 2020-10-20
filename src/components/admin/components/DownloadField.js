import * as React from 'react';
import CloudDownload from '@material-ui/icons/CloudDownload';

const cdnUrl = process.env.REACT_APP_FILE_BASE_URL;

const DownloadField = ({ record = {}, source }) => {
  return (
    <div>
      <a href={`${cdnUrl}${record[source]}`}>
        <CloudDownload />
      </a>
    </div>
  );
};

DownloadField.defaultProps = {
  addLabel: true,
};

export default DownloadField;
