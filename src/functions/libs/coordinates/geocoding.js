const dayjs = require('dayjs');
const Track = require('../../models/track');

module.exports = async (date) => {
  const dayjsDate = dayjs(date);
  let time;
  const filter = {
    startTime: {
      $lte: date,
    },
    endTime: {
      $gte: date,
    },
  };
  const track = await Track.find(filter);
  if (track[0]) {
    const { geoJson } = track[0];
    if (geoJson) {
      const { properties, geometry } = geoJson.features[0];
      const { coordTimes } = properties;
      const { coordinates } = geometry;
      time = coordTimes.filter((el) => el >= dayjsDate.toJSON());
      if (time[0]) {
        const index = coordTimes.indexOf(time[0]);
        return coordinates[index];
      }
      const { endCoords } = track[0];
      const { lat, lon } = endCoords;
      return [lon, lat];
    }
  } else {
    const day = dayjsDate.format('YYYY-MM-DD');
    const nextDay = dayjsDate.add(1, 'day').format('YYYY-MM-DD');
    const dayFilter = {
      startTime: {
        $gte: day,
      },
      endTime: {
        $lte: nextDay,
      },
    };
    const dayTracks = await Track.find(dayFilter);
    if (dayTracks.length > 0) {
      const dateDiff = {};
      dayTracks.map((dayTrack) => {
        const {
          startTime,
          endTime,
          startCoords,
          endCoords,
        } = dayTrack;
        const startDiff = dayjsDate.diff(dayjs(startTime));
        const endDiff = dayjsDate.diff(dayjs(endTime));
        dateDiff[Math.abs(startDiff)] = [startCoords.lon, startCoords.lat];
        dateDiff[Math.abs(endDiff)] = [endCoords.lon, endCoords.lat];
      });
      return Object.values(dateDiff)[0];
    }
  }
  return false;
};
