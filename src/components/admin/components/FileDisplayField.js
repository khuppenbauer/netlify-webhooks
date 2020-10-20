import * as React from 'react';

const cdnUrl = process.env.REACT_APP_FILE_BASE_URL;

const FileDisplayField = ({ record = {}, source }) => {
  const { name, mimeType } = record;
  if (!mimeType) {
    return (
      <div>
        <img src={`${cdnUrl}${record[source]}`} alt={name} />
      </div>
    );
  }
  return (
    <>
      { mimeType.startsWith('image')
        ? (
          <div>
            <img src={`${cdnUrl}${record[source]}`} alt={name} />
          </div>
        )
        : null
      }
    </>
  );
};

FileDisplayField.defaultProps = {
  addLabel: false,
};

export default FileDisplayField;
