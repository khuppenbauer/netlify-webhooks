import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const mapboxToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const MapboxField = ({ record }) => {
  const { minCoords, maxCoords, geoJson } = record;
  const bounds = [minCoords, maxCoords];
  // this ref holds the map DOM node so that we can pass it into Mapbox GL
  const mapNode = useRef(null)

  // this ref holds the map object once we have instantiated it, so that we
  // can use it in other hooks
  const mapRef = useRef(null)
  // construct the map within an effect that has no dependencies
  // this allows us to construct it only once at the time the
  // component is constructed.
  useEffect(() => {
    // Token must be set before constructing map
    mapboxgl.accessToken = mapboxToken
    const map = new mapboxgl.Map({
      container: mapNode.current,
      style: 'mapbox://styles/mapbox/outdoors-v11',
      bounds,
      fitBoundsOptions: (bounds, { padding: 50 }),
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
          'line-color': 'red',
          'line-width': 2,
        },
      });
    })

    // hook up map events here, such as click, mouseenter, mouseleave
    // e.g., map.on('click', (e) => {})

    // when this component is destroyed, remove the map
    return () => {
      map.remove();
    };
  }, [bounds, geoJson])

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
