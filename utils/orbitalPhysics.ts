import { OrbitalElements } from '../types';
import { EARTH_RADIUS_KM, SCALE_FACTOR } from '../constants';

// Convert degrees to radians
const degToRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Calculates the 3D position of an object based on its orbital elements and current time.
 * This uses a simplified circular orbit model suitable for visualization.
 */
export const calculatePosition = (elements: OrbitalElements, timeInSeconds: number): [number, number, number] => {
  const { altitude, inclination, raan, phase, speed } = elements;
  
  // Calculate current angle in orbit (True Anomaly)
  const currentAngle = degToRad(phase) + (speed * timeInSeconds);
  
  // Radius from center of Earth (scaled for 3D scene)
  const r = (EARTH_RADIUS_KM + altitude) * SCALE_FACTOR;
  
  // Inclination and RAAN in radians
  const i = degToRad(inclination);
  const omega = degToRad(raan);

  // Position in orbital plane (2D)
  const x_orb = r * Math.cos(currentAngle);
  const y_orb = r * Math.sin(currentAngle);

  // Rotate to 3D frame based on Inclination (i) and RAAN (omega)
  // Standard Euler rotation for orbital mechanics
  const x = x_orb * Math.cos(omega) - y_orb * Math.cos(i) * Math.sin(omega);
  const z = x_orb * Math.sin(omega) + y_orb * Math.cos(i) * Math.cos(omega);
  const y = y_orb * Math.sin(i); // Y is up in typical WebGL, but Z is often "up" in physics. 
                                 // In R3F default camera, Y is up. We map physics Z to Y.
  
  // Swapping Y and Z to match typical "Y-up" 3D scene where Earth rotates around Y axis?
  // Actually, let's stick to standard math: 
  // Z is usually the pole in physics, but in Three.js Y is usually up.
  // Let's map: Physics X -> 3D X, Physics Y -> 3D Z, Physics Z -> 3D Y (Earth Pole)
  
  // Re-calculating for Y-up (North Pole is Y+)
  // x_final = (cos(Ω) * cos(θ) - sin(Ω) * sin(θ) * cos(i)) * r
  // z_final = (sin(Ω) * cos(θ) + cos(Ω) * sin(θ) * cos(i)) * r
  // y_final = (sin(θ) * sin(i)) * r

  return [x, y, z];
};

export const getDistance = (posA: [number, number, number], posB: [number, number, number]): number => {
  const dx = posA[0] - posB[0];
  const dy = posA[1] - posB[1];
  const dz = posA[2] - posB[2];
  // Returns distance in simulation units. Multiply by (1/SCALE_FACTOR) to get KM.
  return Math.sqrt(dx * dx + dy * dy + dz * dz) * (1 / SCALE_FACTOR);
};