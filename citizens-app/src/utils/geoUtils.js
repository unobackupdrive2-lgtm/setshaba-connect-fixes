import simplify from 'simplify-geojson';

/**
 * Simplifies GeoJSON polygons to reduce rendering complexity
 * @param {Object} geojson - The GeoJSON object
 * @param {number} tolerance - Simplification tolerance (higher = more simplified)
 * @returns {Object} Simplified GeoJSON
 */
export const simplifyGeoJSON = (geojson, tolerance = 0.001) => {
  try {
    return simplify(geojson, tolerance);
  } catch (error) {
    console.warn('Failed to simplify GeoJSON:', error);
    return geojson;
  }
};

/**
 * Checks if a point is within the current map bounds
 * @param {Object} point - {latitude, longitude}
 * @param {Object} bounds - Map bounds
 * @returns {boolean}
 */
export const isPointInBounds = (point, bounds) => {
  if (!bounds || !point) return true;
  
  return (
    point.latitude >= bounds.southWest.latitude &&
    point.latitude <= bounds.northEast.latitude &&
    point.longitude >= bounds.southWest.longitude &&
    point.longitude <= bounds.northEast.longitude
  );
};

/**
 * Filters GeoJSON features based on map bounds
 * @param {Object} geojson - The GeoJSON object
 * @param {Object} bounds - Map bounds
 * @returns {Object} Filtered GeoJSON
 */
export const filterGeoJSONByBounds = (geojson, bounds) => {
  if (!bounds || !geojson?.features) return geojson;

  const filteredFeatures = geojson.features.filter(feature => {
    if (!feature.geometry?.coordinates) return false;

    // For polygons, check if any coordinate is within bounds
    const coordinates = feature.geometry.coordinates[0] || [];
    return coordinates.some(coord => 
      isPointInBounds({ latitude: coord[1], longitude: coord[0] }, bounds)
    );
  });

  return {
    ...geojson,
    features: filteredFeatures
  };
};

/**
 * Calculates distance between two points using Haversine formula
 * @param {Object} point1 - {latitude, longitude}
 * @param {Object} point2 - {latitude, longitude}
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (point1, point2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
  const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};