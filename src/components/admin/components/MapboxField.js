import React, { useEffect, useRef } from 'react';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const mapboxToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const getMapData = (ids, data) => {
  const minLon = [];
  const minLat = [];
  const maxLat = [];
  const maxLon = [];
  const features = ids.map((id) => {
    const { geoJson, minCoords, maxCoords } = data[id];
    const feature = geoJson.features[0];
    const {
      type,
      geometry,
      properties,
    } = feature;
    minLon.push(minCoords.lon);
    minLat.push(minCoords.lat);
    maxLon.push(maxCoords.lon);
    maxLat.push(maxCoords.lat);
    const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    return {
      type,
      geometry,
      properties: { ...properties, color },
    };
  });
  return {
    geoJson: {
      features,
      type: 'FeatureCollection',
    },
    minCoords: {
      lat: Math.min(...minLat),
      lon: Math.min(...minLon),
    },
    maxCoords: {
      lat: Math.max(...maxLat),
      lon: Math.max(...maxLon),
    },
  };
}

const MapboxField = ({ record, ids, data }) => {
  // this ref holds the map DOM node so that we can pass it into Mapbox GL
  const mapNode = useRef(null)

  // this ref holds the map object once we have instantiated it, so that we
  // can use it in other hooks
  const mapRef = useRef(null)
  // construct the map within an effect that has no dependencies
  // this allows us to construct it only once at the time the
  // component is constructed.
  useEffect(() => {
    let minCoords;
    let maxCoords;
    let geoJson;
    let padding;
    if (record) {
      minCoords = record.minCoords;
      maxCoords = record.maxCoords;
      geoJson = record.geoJson;
      padding = 100;
    } else if (ids && data) {
      const res = getMapData(ids, data);
      minCoords = res.minCoords;
      maxCoords = res.maxCoords;
      geoJson = res.geoJson;
      padding = 10;
    }
    const bounds = [minCoords, maxCoords];
    // Token must be set before constructing map
    mapboxgl.accessToken = mapboxToken
    const map = new mapboxgl.Map({
      container: mapNode.current,
      style: 'mapbox://styles/mapbox/outdoors-v11',
      bounds,
      fitBoundsOptions: (bounds, { padding }),
    })
    mapRef.current = map
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.on('load', () => {
      // add sources
      map.addSource('route', {
        type: 'geojson',
        data: geoJson,
      });
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2,
        },
        filter: ['==', '$type', 'LineString'],
      });
      map.addLayer({
        id: 'point',
        type: 'circle',
        source: 'route',
        paint: {
          'circle-radius': 3,
          'circle-color': 'red',
        },
        filter: ['==', '$type', 'Point'],
      });
    })

    // hook up map events here, such as click, mouseenter, mouseleave
    // e.g., map.on('click', (e) => {})

    // when this component is destroyed, remove the map
    return () => {
      map.remove();
    };
  }, [record, ids, data])

  // You can use other `useEffect` hooks to update the state of the map
  // based on incoming props.  Just beware that you might need to add additional
  // refs to share objects or state between hooks.
  return (
    <div ref={mapNode} style={{ height: '75vh', width: '75vh' }} />
  );
};

MapboxField.defaultProps = {
  addLabel: false,
};

export default MapboxField;
