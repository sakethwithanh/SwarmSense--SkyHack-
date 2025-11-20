export enum ObjectType {
  SATELLITE = 'SATELLITE',
  DEBRIS = 'DEBRIS',
  ASSET = 'ASSET'
}

export enum AgentStatus {
  IDLE = 'IDLE',
  TRACKING = 'TRACKING',
  RECHARGING = 'RECHARGING'
}

export interface OrbitalElements {
  altitude: number; // km
  inclination: number; // degrees
  raan: number; // Right Ascension of Ascending Node (degrees)
  phase: number; // Initial phase (degrees)
  speed: number; // rad/s (simplified)
}

export interface SimulationObject {
  id: string;
  type: ObjectType;
  orbit: OrbitalElements;
  position: [number, number, number];
  status: AgentStatus | 'SAFE' | 'THREAT' | 'NEUTRALIZED';
  targetId?: string; // If satellite is tracking debris
  claimedBy?: string; // If debris is claimed by satellite
  neutralizationProgress?: number; // 0-100
  energy?: number; // 0-100 for satellites
  maxEnergy?: number;
}