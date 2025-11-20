import React, { useRef, useEffect } from 'react';
import { Play, Pause, AlertTriangle, Shield, Globe, CheckCircle, Target, Battery, Zap, Radar } from 'lucide-react';
import { SimulationObject, ObjectType, AgentStatus } from '../types';
import { COLORS, EARTH_RADIUS_KM } from '../constants';

interface UIOverlayProps {
  objects: SimulationObject[];
  simulationTime: number;
  speed: number;
  setSpeed: (n: number) => void;
  isPlaying: boolean;
  togglePlay: () => void;
  logs: string[];
  selectedId: string | null;
}

const StatCard = ({ label, value, icon: Icon, color }: { label: string, value: string | number, icon: any, color: string }) => (
  <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700 p-3 rounded-lg flex items-center gap-3 min-w-[120px] shadow-lg">
    <div className={`p-2 rounded bg-opacity-20`} style={{ backgroundColor: color }}>
      <Icon size={20} style={{ color: color }} />
    </div>
    <div>
      <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{label}</div>
      <div className="text-lg font-mono text-white font-bold">{value}</div>
    </div>
  </div>
);

export const UIOverlay = ({ 
  objects, 
  simulationTime, 
  speed, 
  setSpeed, 
  isPlaying, 
  togglePlay,
  logs,
  selectedId
}: UIOverlayProps) => {
  
  const logContainerRef = useRef<HTMLDivElement>(null);
  const selectedObj = objects.find(o => o.id === selectedId);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `T+${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const threatCount = objects.filter(o => o.type === ObjectType.DEBRIS && o.status === 'THREAT').length;
  const trackingSats = objects.filter(o => o.type === ObjectType.SATELLITE && o.status === AgentStatus.TRACKING).length;
  const neutralizedCount = objects.filter(o => o.type === ObjectType.DEBRIS && o.status === 'NEUTRALIZED').length;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 select-none">
      
      {/* Top Header */}
      <div className="flex justify-between items-start pointer-events-auto w-full">
        <div className="flex flex-col">
           <h1 className="text-3xl font-bold text-white tracking-tighter flex items-center gap-3 drop-shadow-lg">
             <Globe className="text-blue-400 animate-pulse-slow" />
             GUARDIAN <span className="text-blue-400">ORBIT</span>
           </h1>
           <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <p className="text-blue-300/70 text-sm font-mono">SYSTEM ONLINE // MONITORING</p>
           </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-3">
          <StatCard label="Active Threats" value={threatCount} icon={AlertTriangle} color={threatCount > 0 ? COLORS.DEBRIS_THREAT : COLORS.DEBRIS} />
          <StatCard label="Intercepting" value={trackingSats} icon={Shield} color={COLORS.SATELLITE_TRACKING} />
          <StatCard label="Neutralized" value={neutralizedCount} icon={CheckCircle} color={COLORS.DEBRIS_NEUTRALIZED} />
        </div>
      </div>

      {/* Left Center - Selected Object Telemetry */}
      {selectedObj && (
        <div className="absolute left-6 top-1/3 w-64 pointer-events-auto">
           <div className="bg-gray-900/90 backdrop-blur-lg border border-blue-500/30 rounded-lg overflow-hidden shadow-2xl animate-in fade-in slide-in-from-left-10 duration-300">
              <div className="bg-blue-900/20 px-4 py-2 border-b border-blue-500/30 flex justify-between items-center">
                 <span className="font-mono font-bold text-blue-400">{selectedObj.id}</span>
                 <Target size={14} className="text-blue-400 animate-spin-slow" />
              </div>
              <div className="p-4 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <div className="text-[10px] text-gray-500 uppercase">Type</div>
                       <div className="text-sm font-bold text-white">{selectedObj.type}</div>
                    </div>
                    <div>
                       <div className="text-[10px] text-gray-500 uppercase">Status</div>
                       <div className={`text-sm font-bold ${selectedObj.status === 'THREAT' ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                         {selectedObj.status}
                       </div>
                    </div>
                    <div>
                       <div className="text-[10px] text-gray-500 uppercase">Altitude</div>
                       <div className="text-sm font-mono text-white">{selectedObj.orbit.altitude.toFixed(1)} km</div>
                    </div>
                    <div>
                       <div className="text-[10px] text-gray-500 uppercase">Velocity</div>
                       <div className="text-sm font-mono text-white">{(7.66 + (Math.random() * 0.1)).toFixed(2)} km/s</div>
                    </div>
                 </div>

                 {/* Satellite Specific Data */}
                 {selectedObj.type === ObjectType.SATELLITE && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                       <div className="flex justify-between items-center mb-1">
                          <div className="text-[10px] text-gray-500 uppercase flex items-center gap-1"><Battery size={10} /> Battery Array</div>
                          <div className="text-xs font-mono text-blue-300">{selectedObj.energy?.toFixed(0)}%</div>
                       </div>
                       <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                             className={`h-full ${selectedObj.energy && selectedObj.energy < 30 ? 'bg-red-500' : 'bg-blue-400'}`} 
                             style={{width: `${selectedObj.energy}%`}}
                          ></div>
                       </div>
                       {selectedObj.targetId && (
                          <div className="mt-2 text-xs text-orange-400 font-mono flex items-center gap-2">
                             <Zap size={12} />
                             Target Locked: {selectedObj.targetId}
                          </div>
                       )}
                    </div>
                 )}

                 {/* Asset/Threat Specific Data */}
                 {selectedObj.neutralizationProgress !== undefined && selectedObj.neutralizationProgress > 0 && (
                   <div className="mt-2">
                     <div className="text-[10px] text-gray-500 uppercase mb-1">Neutralization Sequence</div>
                     <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500" style={{width: `${selectedObj.neutralizationProgress}%`}}></div>
                     </div>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Middle Right - Terminal Logs */}
      <div className="absolute top-24 right-6 w-96 pointer-events-auto flex flex-col gap-2">
        <div className="bg-black/80 backdrop-blur border border-gray-700 rounded-lg overflow-hidden shadow-lg">
          <div className="bg-gray-800 px-3 py-1 text-xs font-mono text-gray-400 flex justify-between items-center border-b border-gray-700">
             <span className="flex items-center gap-2"><Radar size={12} /> TERMINAL_OUTPUT</span>
             <div className="flex gap-1.5">
               <div className="w-2 h-2 rounded-full bg-red-500"></div>
               <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
               <div className="w-2 h-2 rounded-full bg-green-500"></div>
             </div>
          </div>
          <div 
            ref={logContainerRef}
            className="h-64 overflow-y-auto p-3 font-mono text-xs space-y-1 custom-scrollbar"
          >
            {logs.length === 0 && <span className="text-gray-500 animate-pulse">Waiting for telemetry...</span>}
            {logs.map((log, i) => {
               let color = 'text-gray-300';
               if (log.includes('ALERT') || log.includes('WARN')) color = 'text-yellow-400';
               if (log.includes('CRITICAL')) color = 'text-red-400';
               if (log.includes('SUCCESS')) color = 'text-green-400';
               if (log.includes('Active') || log.includes('SYSTEM')) color = 'text-blue-400';

               return (
                <div key={i} className={`${color} break-words leading-tight border-l-2 border-transparent hover:border-gray-600 pl-1 transition-colors`}>
                  <span className="opacity-40 mr-2 select-none">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                  {log}
                </div>
               );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-end justify-between pointer-events-auto w-full">
        
        {/* Time & Playback */}
        <div className="bg-gray-900/90 backdrop-blur border border-gray-700 rounded-xl p-4 flex items-center gap-6 shadow-2xl">
           <div className="flex flex-col">
             <span className="text-[10px] text-gray-400 font-bold uppercase">Mission Time</span>
             <span className="text-2xl font-mono text-white">{formatTime(simulationTime)}</span>
           </div>
           
           <div className="h-8 w-px bg-gray-700"></div>

           <button 
             onClick={togglePlay}
             className={`p-3 rounded-full transition-all hover:scale-105 active:scale-95 ${isPlaying ? 'bg-amber-500 text-black' : 'bg-green-600 text-white'}`}
           >
             {isPlaying ? <Pause fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} />}
           </button>

           <div className="flex flex-col gap-1 min-w-[150px]">
             <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
               <span>Sim Speed</span>
               <span>{speed}x</span>
             </div>
             <input 
               type="range" 
               min="10" 
               max="500" 
               step="10"
               value={speed} 
               onChange={(e) => setSpeed(Number(e.target.value))}
               className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
             />
           </div>
        </div>

        {/* Legend */}
        <div className="bg-gray-900/80 backdrop-blur border border-gray-700 rounded-lg p-4 text-xs space-y-2 shadow-2xl">
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full" style={{background: COLORS.ASSET}}></div>
             <span className="text-gray-300">Asset (ISS)</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full" style={{background: COLORS.SATELLITE_IDLE}}></div>
             <span className="text-gray-300">Guardian (Idle)</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full animate-pulse" style={{background: COLORS.SATELLITE_TRACKING}}></div>
             <span className="text-gray-300">Guardian (Active)</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full" style={{background: COLORS.SATELLITE_RECHARGING}}></div>
             <span className="text-gray-300">Guardian (Recharging)</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full animate-pulse" style={{background: COLORS.DEBRIS_THREAT}}></div>
             <span className="text-red-400 font-bold">Debris (Threat)</span>
           </div>
        </div>

      </div>
    </div>
  );
};