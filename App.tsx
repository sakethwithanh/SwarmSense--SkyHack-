import React, { useState, useEffect } from 'react';
import { Scene } from './components/Scene';
import { UIOverlay } from './components/UIOverlay';
import { SimulationObject, ObjectType, AgentStatus } from './types';
import { ASSET_ID, SIMULATION_SPEED_DEFAULT } from './constants';

// Helper to generate random orbital parameters
const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

function App() {
  const [objects, setObjects] = useState<SimulationObject[]>([]);
  const [simulationTime, setSimulationTime] = useState(0);
  const [speed, setSpeed] = useState(SIMULATION_SPEED_DEFAULT);
  const [isPlaying, setIsPlaying] = useState(true);
  const [logs, setLogs] = useState<string[]>(['System Initializing...', 'Radar Online.']);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Initialize Scenario
  useEffect(() => {
    const initObjects: SimulationObject[] = [];

    // 1. Create the Asset (ISS)
    initObjects.push({
      id: ASSET_ID,
      type: ObjectType.ASSET,
      orbit: {
        altitude: 420,
        inclination: 51.6,
        raan: 0,
        phase: 0,
        speed: 0.0011 
      },
      position: [0, 0, 0],
      status: 'SAFE'
    });

    // 2. Create 5 Guardian Satellites
    for (let i = 0; i < 5; i++) {
      initObjects.push({
        id: `SWARM-${(i + 1).toString().padStart(2, '0')}`,
        type: ObjectType.SATELLITE,
        orbit: {
          altitude: 500,
          inclination: 51.6,
          raan: i * (360 / 5) + 10, // Slight offset
          phase: i * (360 / 5), 
          speed: 0.00105
        },
        position: [0, 0, 0],
        status: AgentStatus.IDLE,
        energy: 100, // Start full battery
        maxEnergy: 100
      });
    }

    // 3. Create 60 Debris pieces 
    for (let i = 0; i < 60; i++) {
      const isNearCollision = i < 15; 
      
      initObjects.push({
        id: `DEB-${Math.floor(randomRange(1000, 9999))}`,
        type: ObjectType.DEBRIS,
        orbit: {
          altitude: isNearCollision ? randomRange(415, 425) : randomRange(380, 650),
          inclination: isNearCollision ? 51.6 + randomRange(-3, 3) : randomRange(0, 98),
          raan: isNearCollision ? randomRange(-15, 15) : randomRange(0, 360),
          phase: randomRange(0, 360),
          speed: randomRange(0.0009, 0.0012)
        },
        position: [0, 0, 0],
        status: 'SAFE'
      });
    }

    setObjects(initObjects);
    setLogs(prev => [...prev, 'Guardian Protocol Active. Scanning for threats...']);
  }, []);

  const handleTimeUpdate = (newTime: number) => {
    setSimulationTime(newTime);
  };

  const handleSelect = (id: string) => {
    setSelectedId(id === selectedId ? null : id);
  };

  return (
    <div className="relative w-full h-screen bg-[#0a0e1a] overflow-hidden">
      <Scene 
        objects={objects}
        setObjects={setObjects}
        simulationTime={simulationTime}
        speed={speed}
        isPlaying={isPlaying}
        onTimeUpdate={handleTimeUpdate}
        setLogs={setLogs}
        selectedId={selectedId}
        onSelect={handleSelect}
      />
      <UIOverlay 
        objects={objects}
        simulationTime={simulationTime}
        speed={speed}
        setSpeed={setSpeed}
        isPlaying={isPlaying}
        togglePlay={() => setIsPlaying(!isPlaying)}
        logs={logs}
        selectedId={selectedId}
      />
    </div>
  );
}

export default App;