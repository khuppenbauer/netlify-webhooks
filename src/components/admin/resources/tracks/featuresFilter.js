import * as React from 'react';
import {
  useQuery,
} from 'react-admin';
import MapboxField from '../../components/MapboxField';

const turf = require('@turf/turf');

const FeaturesFilter = ({ record = {}, type, operation }) => {
  const { geoJson, minCoords, maxCoords } = record;
  const { geometry } = geoJson.features[0];
  let geoFilter;
  if (operation === 'geoWithin') {
    const buffered = turf.buffer(geometry, 100, { units: 'meters' });
    const options = { precision: 6, coordinates: 2 };
    const polygon = turf.truncate(buffered, options);
    geoFilter = {
      'geoJson.features.0.geometry': {
        $geoWithin: {
          $geometry: polygon.geometry,
        },
      },
    };
  } else if (operation === 'geoIntersects') {
    geoFilter = {
      'geoJson.features.0.geometry': {
        $geoIntersects: {
          $geometry: geometry,
        },
      },
    };
  }

  const filter = {
    type: 'getFilter',
    resource: 'features',
    payload: {
      data: {
        ...geoFilter,
        type,
      },
    },
  };
  const { data } = useQuery(filter);
  if (data === undefined) {
    return [];
  }
  if (data.length === 0) {
    return <MapboxField record={record} />;
  }
  const ids = Array(data.length).fill(null).map((_, i) => i);
  //geoJson.features[0] = polygon;
  const geoJsonData = {
    minCoords,
    maxCoords,
    geoJson,
  }
  return <MapboxField ids={ids} data={data} geoJsonData={geoJsonData} />;
};

export default FeaturesFilter;
