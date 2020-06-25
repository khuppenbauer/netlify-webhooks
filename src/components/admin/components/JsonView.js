import * as React from 'react';
import ReactJson from 'react-json-view';

const JsonView = ({ record = {}, source }) => {
  return record[source] ? (
    <ReactJson
      src={record[source]}
      theme="monokai"
      collpased="true"
      enableClipboard="true"
      displayObjectSize="false"
      displayDataTypes="false"
    />
  ) : null;
};

JsonView.defaultProps = {
  addLabel: true,
};

export default JsonView;
