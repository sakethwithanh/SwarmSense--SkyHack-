import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Trail, Line, Html, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { SimulationObject, ObjectType, AgentStatus } from '../types';
import { calculatePosition, getDistance } from '../utils/orbitalPhysics';
import { COLORS, THREAT_DISTANCE_KM, SCALE_FACTOR, EARTH_RADIUS_KM, NEUTRALIZATION_SPEED, ENERGY_DRAIN_RATE, ENERGY_RECHARGE_RATE } from '../constants';

// Type augmentation
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      group: any;
      sphereGeometry: any;
      meshPhongMaterial: any;
      meshBasicMaterial: any;
      ambientLight: any;
      pointLight: any;
      color: any;
      ringGeometry: any;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      group: any;
      sphereGeometry: any;
      meshPhongMaterial: any;
      meshBasicMaterial: any;
      ambientLight: any;
      pointLight: any;
      color: any;
      ringGeometry: any;
    }
  }
}

// --- Reusable Components ---

const Earth = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0005; 
    }
  });

  return (
    <mesh ref={earthRef} scale={EARTH_RADIUS_KM * SCALE_FACTOR}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshPhongMaterial 
        color={COLORS.EARTH} 
        emissive={0x112244}
        specular={0x555555}
        shininess={10}
      />
      <mesh scale={1.01}>
         <sphereGeometry args={[1, 32, 32]} />
         <meshBasicMaterial color={COLORS.SATELLITE_IDLE} wireframe transparent opacity={0.05} />
      </mesh>
    </mesh>
  );
};

const OrbitPath = ({ orbit }: { orbit: any }) => {
  const points = useMemo(() => {
    const pts = [];
    // Generate 100 points for a smooth orbit line
    for (let i = 0; i <= 100; i++) {
      const time = (i / 100) * (2 * Math.PI) / orbit.speed;
      pts.push(calculatePosition(orbit, time));
    }
    return pts;
  }, [orbit]);

  return (
    <Line 
      points={points} 
      color={COLORS.ORBIT_LINE} 
      transparent 
      opacity={0.15} 
      lineWidth={1} 
    />
  );
};

const ParticleExplosion = ({ position }: { position: [number, number, number] }) => {
  const particles = useMemo(() => {
    return new Array(12).fill(0).map(() => ({
      velocity: [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
      scale: Math.random() * 0.5
    }));
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const v = particles[i].velocity;
        child.position.x += v[0] * delta * 5;
        child.position.y += v[1] * delta * 5;
        child.position.z += v[2] * delta * 5;
        // @ts-ignore
        child.material.opacity -= delta * 1.5;
      });
    }
  });

  return (
    <group position={position} ref={groupRef}>
      {particles.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={COLORS.DEBRIS_NEUTRALIZED} transparent opacity={1} />
        </mesh>
      ))}
    </group>
  );
};

const LaserBeam = ({ start, end }: { start: [number, number, number], end: [number, number, number] }) => {
  return (
    <Line
      points={[start, end]}
      color={COLORS.LASER}
      lineWidth={1.5}
      dashed={true}
      dashScale={20}
      dashSize={0.5}
      gapSize={0.5}
    >
       <meshBasicMaterial color={COLORS.LASER} transparent opacity={0.6} blending={THREE.AdditiveBlending} />
    </Line>
  );
};

const SpaceObject = ({ 
  obj, 
  position,
  isSelected,
  onClick
}: { 
  obj: SimulationObject, 
  position: [number, number, number],
  isSelected: boolean,
  onClick: (id: string) => void
}) => {
  const getColor = () => {
    if (obj.type === ObjectType.ASSET) return COLORS.ASSET;
    if (obj.type === ObjectType.SATELLITE) {
      if (obj.status === AgentStatus.RECHARGING) return COLORS.SATELLITE_RECHARGING;
      return obj.status === AgentStatus.TRACKING ? COLORS.SATELLITE_TRACKING : COLORS.SATELLITE_IDLE;
    }
    if (obj.type === ObjectType.DEBRIS) {
      if (obj.status === 'NEUTRALIZED') return COLORS.DEBRIS_NEUTRALIZED;
      return obj.status === 'THREAT' ? COLORS.DEBRIS_THREAT : COLORS.DEBRIS;
    }
    return '#ffffff';
  };

  const getSize = () => {
    if (obj.type === ObjectType.ASSET) return 0.15;
    if (obj.type === ObjectType.SATELLITE) return 0.1;
    return 0.06; 
  };

  const color = getColor();
  const size = getSize();
  const isThreat = obj.status === 'THREAT' || obj.status === AgentStatus.TRACKING;
  const isNeutralized = obj.status === 'NEUTRALIZED';

  // Show orbit path if selected or is Asset
  const showOrbit = isSelected || obj.type === ObjectType.ASSET || (obj.type === ObjectType.SATELLITE);

  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick(obj.id); }}>
      
      {showOrbit && <OrbitPath orbit={obj.orbit} />}

      {/* Selection Bracket */}
      {isSelected && (
        <Billboard follow={true}>
           <mesh>
              <ringGeometry args={[size * 3, size * 3.2, 32]} />
              <meshBasicMaterial color={COLORS.SELECTION} opacity={0.8} transparent side={THREE.DoubleSide} />
           </mesh>
        </Billboard>
      )}

      {/* Trail */}
      {!isNeutralized && (
        <Trail
          width={1.5} 
          length={25} 
          color={color} 
          attenuation={(t) => t * t} 
        >
           <mesh>
              <sphereGeometry args={[size, 16, 16]} />
              <meshBasicMaterial color={color} toneMapped={false} />
           </mesh>
        </Trail>
      )}

      {isNeutralized && (
        <mesh>
          <sphereGeometry args={[size, 16, 16]} />
          <meshBasicMaterial color={color} toneMapped={false} opacity={0.5} transparent />
        </mesh>
      )}

      {isThreat && (
        <mesh>
          <sphereGeometry args={[size * 2.5, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} wireframe />
        </mesh>
      )}

      {/* Battery Bar for Satellites */}
      {obj.type === ObjectType.SATELLITE && obj.energy !== undefined && (
        <Html position={[0, -0.2, 0]} center>
           <div className={`w-8 h-1 bg-gray-800 rounded overflow-hidden border border-gray-600 ${isSelected ? 'scale-150' : ''}`}>
             <div 
               className={`h-full transition-all duration-300 ${obj.energy < 30 ? 'bg-red-500' : 'bg-cyan-400'}`} 
               style={{ width: `${obj.energy}%` }}
             />
           </div>
        </Html>
      )}

      {/* Neutralization Progress */}
      {obj.neutralizationProgress !== undefined && obj.neutralizationProgress > 0 && obj.neutralizationProgress < 100 && (
        <Html position={[0, 0.2, 0]} center>
           <div className="w-12 h-1 bg-gray-800 rounded overflow-hidden border border-gray-600">
             <div 
               className="h-full bg-red-500 transition-all duration-75 ease-linear" 
               style={{ width: `${obj.neutralizationProgress}%` }}
             />
           </div>
        </Html>
      )}

      {/* Simple Label (Only show ID if selected or important to avoid clutter) */}
      {(isSelected || isThreat || obj.type === ObjectType.ASSET) && (
        <Html distanceFactor={15} zIndexRange={[100, 0]} position={[0, 0.3, 0]}>
          <div className={`text-[10px] font-mono px-1 py-0.5 rounded bg-black/50 text-white whitespace-nowrap backdrop-blur-md border ${isSelected ? 'border-white' : 'border-transparent'} ${isThreat ? 'border-red-500' : ''}`}>
            {obj.id}
          </div>
        </Html>
      )}
    </group>
  );
};

interface SimulationManagerProps {
  objects: SimulationObject[];
  setObjects: React.Dispatch<React.SetStateAction<SimulationObject[]>>;
  simulationTime: number;
  speed: number;
  isPlaying: boolean;
  onTimeUpdate: (t: number) => void;
  setLogs: React.Dispatch<React.SetStateAction<string[]>>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const SimulationManager = ({ 
  objects, 
  setObjects, 
  simulationTime, 
  speed, 
  isPlaying,
  onTimeUpdate,
  setLogs,
  selectedId,
  onSelect
}: SimulationManagerProps) => {
  
  // State for one-time effects like explosions
  const [explosions, setExplosions] = useState<{id: string, position: [number, number, number], time: number}[]>([]);

  useFrame((state, delta) => {
    if (!isPlaying) return;

    const timeStep = delta * speed; 
    const newTime = simulationTime + timeStep;
    onTimeUpdate(newTime);

    // Calculate positions
    const currentObjectsState = objects.map(obj => ({
      ...obj,
      position: calculatePosition(obj.orbit, newTime)
    }));

    const updates: Record<string, Partial<SimulationObject>> = {};

    // 1. Threat Detection & Assignment Logic
    const asset = currentObjectsState.find(o => o.type === ObjectType.ASSET);
    
    if (asset) {
      currentObjectsState.forEach(obj => {
        if (obj.type === ObjectType.DEBRIS) {
          if (obj.status === 'NEUTRALIZED') return;

          const dist = getDistance(obj.position, asset.position);
          const isThreat = dist < THREAT_DISTANCE_KM;
          
          if (isThreat) {
             if (obj.status !== 'THREAT' && !updates[obj.id]?.status) {
                 updates[obj.id] = { ...updates[obj.id], status: 'THREAT' };
             }

             const currentlyClaimed = obj.claimedBy || (updates[obj.id] && updates[obj.id]!.claimedBy);
             
             if (!currentlyClaimed) {
                 const idleSats = currentObjectsState.filter(s => 
                    s.type === ObjectType.SATELLITE && 
                    s.status === AgentStatus.IDLE && 
                    (s.energy === undefined || s.energy > 10) && // Can only track if battery > 10%
                    !updates[s.id]
                 );
                 
                 if (idleSats.length > 0) {
                   // Find nearest
                   let nearestSat = idleSats[0];
                   let minSatDist = getDistance(nearestSat.position, obj.position);

                   for(let i=1; i<idleSats.length; i++) {
                     const d = getDistance(idleSats[i].position, obj.position);
                     if (d < minSatDist) {
                       minSatDist = d;
                       nearestSat = idleSats[i];
                     }
                   }

                   updates[nearestSat.id] = { status: AgentStatus.TRACKING, targetId: obj.id };
                   updates[obj.id] = { ...updates[obj.id], claimedBy: nearestSat.id };
                   setLogs(prev => [...prev, `[ALERT] ${obj.id} locked by ${nearestSat.id}`]);
                 }
             }
          } 
        }
      });
    }

    // 2. Satellite Logic (Energy + Neutralization)
    currentObjectsState.forEach(sat => {
      if (sat.type === ObjectType.SATELLITE) {
        let currentEnergy = sat.energy ?? 100;
        let newEnergy = currentEnergy;
        let newStatus = sat.status;

        // Handle RECHARGING
        if (sat.status === AgentStatus.RECHARGING) {
           newEnergy += delta * ENERGY_RECHARGE_RATE * (speed / 20); // Recharge faster than real time relative to sim speed
           if (newEnergy >= 100) {
             newEnergy = 100;
             newStatus = AgentStatus.IDLE;
             setLogs(prev => [...prev, `[SYSTEM] ${sat.id} fully charged. Online.`]);
           }
           updates[sat.id] = { ...updates[sat.id], energy: newEnergy, status: newStatus };
           return; // Can't do anything else while recharging
        }

        // Handle TRACKING/FIRING
        if (sat.status === AgentStatus.TRACKING && sat.targetId) {
          // Drain Energy
          newEnergy -= delta * ENERGY_DRAIN_RATE * (speed / 20); 
          
          if (newEnergy <= 0) {
             newEnergy = 0;
             newStatus = AgentStatus.RECHARGING;
             // Drop target
             const targetId = sat.targetId;
             updates[targetId] = { claimedBy: undefined }; // Release target
             setLogs(prev => [...prev, `[WARN] ${sat.id} battery depleted. Recharging.`]);
          }

          updates[sat.id] = { ...updates[sat.id], energy: newEnergy, status: newStatus };

          // Neutralize Target if still tracking
          if (newStatus === AgentStatus.TRACKING) {
             const target = currentObjectsState.find(o => o.id === sat.targetId);
             if (target && target.status === 'THREAT') {
                const increment = delta * NEUTRALIZATION_SPEED; 
                const currentProgress = target.neutralizationProgress || 0;
                const newProgress = Math.min(currentProgress + increment, 100);

                updates[target.id] = { ...updates[target.id], neutralizationProgress: newProgress };

                if (newProgress >= 100) {
                  updates[target.id] = { 
                    ...updates[target.id], 
                    status: 'NEUTRALIZED', 
                    claimedBy: undefined 
                  };
                  updates[sat.id] = { ...updates[sat.id], status: AgentStatus.IDLE, targetId: undefined };
                  
                  setLogs(prev => [...prev, `[SUCCESS] ${target.id} neutralized.`]);

                  // Trigger Explosion Visual
                  setExplosions(prev => [...prev, {
                     id: target.id + Date.now(),
                     position: target.position,
                     time: Date.now()
                  }]);
                }
             }
          }
        } 
        // Handle IDLE (Passive Recharge)
        else if (sat.status === AgentStatus.IDLE) {
           if (newEnergy < 100) {
             newEnergy += delta * ENERGY_RECHARGE_RATE * 0.5 * (speed / 20); // Slower recharge when just idle
             newEnergy = Math.min(newEnergy, 100);
             updates[sat.id] = { ...updates[sat.id], energy: newEnergy };
           }
        }
      }
    });

    // Apply updates
    if (Object.keys(updates).length > 0) {
      setObjects(prev => prev.map(o => updates[o.id] ? { ...o, ...updates[o.id] } : o));
    }
  });

  // Cleanup old explosions
  useEffect(() => {
     if (explosions.length > 0) {
       const timer = setTimeout(() => {
          setExplosions(prev => prev.filter(e => Date.now() - e.time < 2000));
       }, 2000);
       return () => clearTimeout(timer);
     }
  }, [explosions]);

  const trackingSats = objects.filter(o => o.type === ObjectType.SATELLITE && o.status === AgentStatus.TRACKING && o.targetId);

  return (
    <>
      {objects.map(obj => (
        <SpaceObject 
          key={obj.id} 
          obj={obj} 
          position={calculatePosition(obj.orbit, simulationTime)} 
          isSelected={selectedId === obj.id}
          onClick={onSelect}
        />
      ))}
      
      {trackingSats.map(sat => {
        const target = objects.find(o => o.id === sat.targetId);
        if (!target) return null;
        const start = calculatePosition(sat.orbit, simulationTime);
        const end = calculatePosition(target.orbit, simulationTime);
        return <LaserBeam key={`laser-${sat.id}`} start={start} end={end} />;
      })}

      {explosions.map(ex => (
        <ParticleExplosion key={ex.id} position={ex.position} />
      ))}
    </>
  );
};

export const Scene = (props: SimulationManagerProps) => {
  return (
    <Canvas camera={{ position: [15, 10, 15], fov: 45 }} onClick={() => props.onSelect('')}>
      <color attach="background" args={[COLORS.BACKGROUND]} />
      <ambientLight intensity={0.4} color="#ccccff" />
      <pointLight position={[50, 20, 30]} intensity={2.5} color="#ffeeb1" />
      <pointLight position={[-20, -10, -20]} intensity={0.5} color="#4444ff" />
      <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Earth />
      <SimulationManager {...props} />
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        maxDistance={60} 
        minDistance={8}
        autoRotate={!props.isPlaying && !props.selectedId}
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
};