import React, { useEffect, useRef } from 'react';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

const mapboxToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const getMapData = (ids, data, geoJsonData) => {
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
    const { coordinates } = geometry;
    minLon.push(minCoords.lon);
    minLat.push(minCoords.lat);
    maxLon.push(maxCoords.lon);
    maxLat.push(maxCoords.lat);
    const color = `#${Math.random().toString(16).substr(2, 6)}`;
    return {
      type,
      geometry,
      properties: {
        ...properties,
        color,
        coordinates,
      },
    };
  });
  if (geoJsonData) {
    const { minCoords: min, maxCoords: max, geoJson } = geoJsonData;
    minLon.push(min.lon);
    minLat.push(min.lat);
    maxLon.push(max.lon);
    maxLat.push(max.lat);
    const geoJsonFeature = geoJson.features[0];
    const {
      properties,
    } = geoJsonFeature;
    const color = 'blue';
    geoJsonFeature.properties = { ...properties, color };
    features.unshift(geoJsonFeature);
  }
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

const MapboxField = ({ record, ids, data, geoJsonData }) => {
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
      const res = getMapData(ids, data, geoJsonData);
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
        id: 'polygon',
        type: 'fill',
        source: 'route',
        paint: {
          'fill-color': '#888888',
          'fill-opacity': 0.4,
        },
        filter: ['==', '$type', 'Polygon'],
      });
      map.addLayer({
        id: 'image',
        type: 'symbol',
        source: 'route',
        layout: {
          'icon-image': 'attraction-15',
          'icon-allow-overlap': true,
        },
        filter: ['==', 'type', 'image'],
      });
      map.addLayer({
        id: 'pass',
        type: 'symbol',
        source: 'route',
        layout: {
          'icon-image': 'mountain-15',
          'icon-allow-overlap': true,
        },
        filter: ['==', 'type', 'pass'],
      });
      map.addLayer({
        id: 'residence',
        type: 'symbol',
        source: 'route',
        layout: {
          'icon-image': 'town-hall-15',
          'icon-allow-overlap': true,
        },
        filter: ['==', 'type', 'residence'],
      });
      map.on('click', 'image', (e) => {
        const { geometry, properties } = e.features[0];
        const coordinates = geometry.coordinates.slice();
        const {
          url,
          name,
          width,
          height,
          imageWidth,
          imageHeight,
          size,
          dateTimeOriginal,
        } = properties;
        const ratio = width / height;
        const w = 200;
        const h = w / ratio;
        const image = `<img src="${url}" width="${w}" height="${h}" /><br />${imageWidth}<br />${imageHeight}<br />${size}<br />${dateTimeOriginal}<br /><a href="${url}" target="_blank">${name}</a>`;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(image)
          .addTo(map);
      });

      map.on('click', 'pass', (e) => {
        const { geometry, properties } = e.features[0];
        const coordinates = geometry.coordinates.slice();
        const {
          name,
          desc,
          cmt,
          coordinates: coord,
        } = properties;
        let html = `${name} (${JSON.parse(coord)[2]} m)`;
        if (desc && cmt) {
          html = `${html}<br />${desc}<br />${cmt.replace(/\r\n\r\n/g, '<br />')}`;
        }
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(html)
          .addTo(map);
      });

      map.on('click', 'residence', (e) => {
        const { geometry, properties } = e.features[0];
        const coordinates = geometry.coordinates.slice();
        const {
          name,
          desc,
          cmt,
          coordinates: coord,
        } = properties;
        let html = `${name} (${JSON.parse(coord)[2]} m)`;
        if (desc && cmt) {
          html = `${html}<br />${desc}<br />${cmt.replace(/\r\n/g, '<br />')}`;
        }
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(html)
          .addTo(map);
      });

      map.on('click', 'route', (e) => {
        const { geometry, properties } = e.features[0];
        const coordinates = geometry.coordinates[0].slice();
        const {
          name,
          distance,
          elevationHigh,
          elevationLow,
          averageGrade,
          maximumGrade,
          totalElevationGain,
          totalElevationLoss,
          startElevation,
          endElevation,
        } = properties;
        let html = `${name}`;
        if (distance && elevationHigh && elevationLow) {
          html = `${html}<br />${distance}<br />${elevationHigh}<br />${elevationLow}`
        }
        if (averageGrade && maximumGrade) {
          html = `${html}<br />${averageGrade}<br />${maximumGrade}`;
        }
        if (totalElevationGain && totalElevationLoss && startElevation && endElevation) {
          html = `${html}<br />${totalElevationGain}<br />${totalElevationLoss}<br />${startElevation}<br />${endElevation}`;
        }
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        if (html) {
          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(html)
            .addTo(map);
        }
      });

      map.on('mouseenter', 'image', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'image', () => {
        map.getCanvas().style.cursor = '';
      });

      map.on('mouseenter', 'pass', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'pass', () => {
        map.getCanvas().style.cursor = '';
      });

      map.on('mouseenter', 'residence', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'residence', () => {
        map.getCanvas().style.cursor = '';
      });

      map.on('mouseenter', 'route', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'route', () => {
        map.getCanvas().style.cursor = '';
      });
    })

    // hook up map events here, such as click, mouseenter, mouseleave
    // e.g., map.on('click', (e) => {})

    // when this component is destroyed, remove the map
    return () => {
      map.remove();
    };
  }, [record, ids, data, geoJsonData])

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
