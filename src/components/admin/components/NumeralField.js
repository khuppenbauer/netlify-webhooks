import * as React from 'react';
import PropTypes from 'prop-types';
import convert from 'convert-units';

const NumeralField = ({
  record = {},
  source,
  options,
  style,
}) => {
  const { from, to } = options;
  const value = convert(record[source]).from(from).to(to);
  const numberOptions = { style: 'unit', unit: 'kilometer' };
  const numeral = new Intl.NumberFormat('de-DE', numberOptions).format(value.toFixed(2));
  return (
    <div style={style}>{numeral}</div>
  );
};

NumeralField.defaultProps = {
  addLabel: true,
};

NumeralField.propTypes = {
  options: PropTypes.object,
};

export default NumeralField;
