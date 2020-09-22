const geohash = require("ngeohash");

class Geo {
  distanceBetweenHashes(geoHash1, geoHash2) {
    const coords1 = geohash.decode(geoHash1);
    const coords2 = geohash.decode(geoHash2);
    const lat1 = coords1.latitude;
    const lon1 = coords1.longitude;
    const lat2 = coords2.latitude;
    const lon2 = coords2.longitude;

    if (lat1 === lat2 && lon1 === lon2) {
      return {
        miles: 0,
        kilometers: 0
      };
    } else {
      let radlat1 = (Math.PI * lat1) / 180;
      let radlat2 = (Math.PI * lat2) / 180;
      let theta = lon1 - lon2;
      let radtheta = (Math.PI * theta) / 180;
      let dist =
        Math.sin(radlat1) * Math.sin(radlat2) +
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = (dist * 180) / Math.PI;
      dist = dist * 60 * 1.1515;

      return {
        miles: dist,
        kilometers: dist * 1.609344
      };
    }
  }

  hashRange(hash, distance) {
    const { latitude, longitude } = geohash.decode(hash); // decoded hash
    const lat = 0.0144927536231884; // degrees latitude per mile
    const lon = 0.0181818181818182; // degrees longitude per mile

    const lowerLat = latitude - lat * distance;
    const lowerLon = longitude - lon * distance;

    const upperLat = latitude + lat * distance;
    const upperLon = longitude + lon * distance;

    const lower = geohash.encode(lowerLat, lowerLon);
    const upper = geohash.encode(upperLat, upperLon);

    return {
      lower,
      upper
    };
  }
}

module.exports = new Geo();
