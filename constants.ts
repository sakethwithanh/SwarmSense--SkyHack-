export const COLORS = {
  BACKGROUND: '#0a0e1a',
  EARTH: '#1a4b8c', // Deep blue
  EARTH_LAND: '#2a6e45', // Subtle green
  SATELLITE_IDLE: '#00d4ff',
  SATELLITE_TRACKING: '#ffaa00',
  SATELLITE_RECHARGING: '#555555',
  DEBRIS: '#888888',
  DEBRIS_THREAT: '#ff4444',
  DEBRIS_NEUTRALIZED: '#33aa33', // Green
  ASSET: '#ffd700',
  TRAIL_OPACITY: 0.6,
  LASER: '#ff3333',
  ORBIT_LINE: '#ffffff',
  SELECTION: '#ffffff',
};

export const THREAT_DISTANCE_KM = 1500; // Distance to trigger threat
export const ASSET_ID = 'ISS-ALPHA';
export const NEUTRALIZATION_SPEED = 40; // Percentage per second
export const ENERGY_DRAIN_RATE = 15; // Per second while firing
export const ENERGY_RECHARGE_RATE = 5; // Per second while idle

// Visual Configuration Constants
export const EARTH_RADIUS_KM = 6378;
export const SCALE_FACTOR = 0.001; // 1 unit = 1000km for rendering stability
export const SIMULATION_SPEED_DEFAULT = 100; // Multiplier for time