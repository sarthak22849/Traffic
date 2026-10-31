import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ShieldAlert, CheckCircle, Navigation } from 'lucide-react';

export default function IntersectionVisualizer({ approaches, currentPhase, remainingSec, emergency }) {
  // Traffic Signal 3-Aspect Box Renderer
  const renderSignalBox = (state, direction) => {
    const isGreen = state === 'GREEN';
    const isYellow = state === 'YELLOW';
    const isRed = state === 'RED';

    return (
      <div className="flex flex-col items-center bg-slate-950 p-1 rounded-md border border-slate-700/80 shadow-md space-y-1">
        <div
          className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
            isRed
              ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.9)] border border-rose-300'
              : 'bg-rose-950/40 opacity-30'
          }`}
        />
        <div
          className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
            isYellow
              ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)] border border-amber-200 animate-pulse'
              : 'bg-amber-950/40 opacity-30'
          }`}
        />
        <div
          className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
            isGreen
              ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)] border border-emerald-200'
              : 'bg-emerald-950/40 opacity-30'
          }`}
        />
      </div>
    );
  };

  const north = approaches?.north || { density: 0.2, queue_length: 2, signal: 'RED', green_time: 25 };
  const south = approaches?.south || { density: 0.2, queue_length: 2, signal: 'RED', green_time: 25 };
  const east = approaches?.east || { density: 0.6, queue_length: 6, signal: 'GREEN', green_time: 35 };
  const west = approaches?.west || { density: 0.5, queue_length: 5, signal: 'GREEN', green_time: 35 };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 relative overflow-hidden flex flex-col justify-between shadow-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
            <span>4-Way Intersection Telemetry</span>
            {emergency?.active && (
              <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-700 px-2 py-0.5 rounded-full font-mono flex items-center gap-1 animate-pulse">
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                EMERGENCY CORRIDOR: {emergency.approach?.toUpperCase()}
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400">
            Active Signal Phase: <span className="text-cyan-400 font-mono font-semibold">{currentPhase}</span>
          </p>
        </div>
        
        {/* Countdown Ring */}
        <div className="text-right flex items-center space-x-3">
          <div className="relative flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center bg-slate-950">
              <span className="text-lg font-black font-mono text-cyan-400">{remainingSec}</span>
            </div>
          </div>
          <div>
            <div className="text-xs font-bold font-mono text-white">SECONDS</div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Phase Timer</div>
          </div>
        </div>
      </div>

      {/* ── Visual 4-Way Crossroad Simulation Canvas ── */}
      <div className="relative w-full aspect-[4/3] max-h-[360px] mx-auto my-3 flex items-center justify-center bg-slate-950/90 rounded-2xl border border-slate-800/90 p-3 overflow-hidden shadow-inner">
        
        {/* Road Crossroad Graphic Background */}
        {/* North-South Road */}
        <div className="absolute inset-y-0 w-28 bg-slate-900/95 border-x border-slate-700/60 flex flex-col justify-between items-center py-2 shadow-2xl">
          <div className="text-[9px] font-mono tracking-widest text-slate-400 font-bold">NORTH AXIS</div>
          <div className="w-0.5 h-14 border-r-2 border-dashed border-amber-400/50"></div>
          <div className="w-0.5 h-14 border-r-2 border-dashed border-amber-400/50"></div>
          <div className="text-[9px] font-mono tracking-widest text-slate-400 font-bold">SOUTH AXIS</div>
        </div>

        {/* East-West Road */}
        <div className="absolute inset-x-0 h-28 bg-slate-900/95 border-y border-slate-700/60 flex justify-between items-center px-2 shadow-2xl">
          <div className="text-[9px] font-mono tracking-widest text-slate-400 font-bold [writing-mode:vertical-lr] rotate-180">WEST AXIS</div>
          <div className="h-0.5 w-14 border-b-2 border-dashed border-amber-400/50"></div>
          <div className="h-0.5 w-14 border-b-2 border-dashed border-amber-400/50"></div>
          <div className="text-[9px] font-mono tracking-widest text-slate-400 font-bold [writing-mode:vertical-lr]">EAST AXIS</div>
        </div>

        {/* Center Intersection Hub */}
        <div className="relative z-10 w-28 h-28 bg-slate-950 rounded-2xl border border-cyan-500/40 flex flex-col items-center justify-center p-1 text-center shadow-2xl">
          <span className="text-[9px] text-slate-400 uppercase font-mono font-bold">Adaptive AI</span>
          <span className="text-xs font-black text-cyan-400 font-mono tracking-wider">CROSSROADS</span>
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping mt-1"></div>
        </div>

        {/* ── NORTH APPROACH ── */}
        <div className="absolute top-2 flex flex-col items-center space-y-1 z-20">
          <div className="flex items-center space-x-2">
            {renderSignalBox(north.signal, 'north')}
            <div className="bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700/80 text-[10px] font-mono shadow-md">
              <div className="text-slate-300 font-bold">NORTH: {north.queue_length} veh</div>
              <div className="text-cyan-400">Density: {Math.round(north.density * 100)}%</div>
            </div>
          </div>
          {north.signal === 'GREEN' && (
            <ArrowDown className="w-4 h-4 text-emerald-400 animate-bounce" />
          )}
        </div>

        {/* ── SOUTH APPROACH ── */}
        <div className="absolute bottom-2 flex flex-col items-center space-y-1 z-20">
          {south.signal === 'GREEN' && (
            <ArrowUp className="w-4 h-4 text-emerald-400 animate-bounce" />
          )}
          <div className="flex items-center space-x-2">
            <div className="bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700/80 text-[10px] font-mono shadow-md">
              <div className="text-slate-300 font-bold">SOUTH: {south.queue_length} veh</div>
              <div className="text-cyan-400">Density: {Math.round(south.density * 100)}%</div>
            </div>
            {renderSignalBox(south.signal, 'south')}
          </div>
        </div>

        {/* ── WEST APPROACH ── */}
        <div className="absolute left-2 flex items-center space-x-1.5 z-20">
          <div className="bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700/80 text-[10px] font-mono shadow-md">
            <div className="text-slate-300 font-bold">WEST: {west.queue_length} veh</div>
            <div className="text-cyan-400">Density: {Math.round(west.density * 100)}%</div>
          </div>
          {renderSignalBox(west.signal, 'west')}
          {west.signal === 'GREEN' && (
            <ArrowRight className="w-4 h-4 text-emerald-400 animate-pulse" />
          )}
        </div>

        {/* ── EAST APPROACH ── */}
        <div className="absolute right-2 flex items-center space-x-1.5 z-20">
          {east.signal === 'GREEN' && (
            <ArrowLeft className="w-4 h-4 text-emerald-400 animate-pulse" />
          )}
          {renderSignalBox(east.signal, 'east')}
          <div className="bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700/80 text-[10px] font-mono shadow-md">
            <div className="text-slate-300 font-bold">EAST: {east.queue_length} veh</div>
            <div className="text-cyan-400">Density: {Math.round(east.density * 100)}%</div>
          </div>
        </div>

      </div>

      {/* Safety Interlock Assurance Footer */}
      <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-800/80 text-slate-400 font-mono">
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <span>Conflict Interlock: <strong>Zero Conflicting Greens</strong></span>
        </div>
        <div className="flex items-center space-x-1.5 justify-end">
          <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
          <span>Intervals: <strong>3s Amber + 2s All-Red</strong></span>
        </div>
      </div>

    </div>
  );
}
