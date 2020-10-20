import * as React from 'react';
import { Link } from 'react-router-dom';

const ReferenceField = ({
  record,
  reference,
  source,
  property,
}) => {
  const id = `/${reference}/${record[source]}/show`;
  const name = record[property] ? record[property] : property;
  return record ? (
    <span className="MuiTypography-body2"><Link to={id}>{name}</Link></span>
  ) : null;
}

ReferenceField.defaultProps = {
  addLabel: true,
};

export default ReferenceField;
