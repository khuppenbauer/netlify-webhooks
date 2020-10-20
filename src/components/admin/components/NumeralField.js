import * as React from 'react';
import PropTypes from 'prop-types';
import convert from 'convert-units';

const NumeralField = ({
  record = {},
  source,
  options,
  style,
}) => {
  let unit;
  let number;
  const { from, to, precision } = options;
  if (from === 's') {
    number = new Date(record[source] * 1000).toISOString().substr(11, 8);
    unit = '';
  } else if (to) {
    const value = convert(record[source]).from(from).to(to);
    number = new Intl.NumberFormat('de-DE', options).format(value.toFixed(precision));
    unit = to;
  } else {
    const value = convert(record[source]).from(from).toBest();
    number = new Intl.NumberFormat('de-DE', options).format(value.val.toFixed(precision));
    unit = value.unit;
  }
  return (
    <div style={style} className="MuiTypography-body2">{number} {unit}</div>
  );
};

NumeralField.defaultProps = {
  addLabel: true,
};

NumeralField.propTypes = {
  options: PropTypes.object,
};

export default NumeralField;
