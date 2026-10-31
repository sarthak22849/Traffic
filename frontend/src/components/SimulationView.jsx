import React, { useState } from 'react';
import { Cpu, Play, Square, Activity, Gauge, Sparkles } from 'lucide-react';
import { startSimulation, stopSimulation } from '../services/api';

export default function SimulationView({ simulationData, onSimStateChanged }) {
  const [vehicleRate, setVehicleRate] = useState(0.5);
  const [simMode, setSimMode] = useState('adaptive');
  const [loading, setLoading] = useState(false);

  const isRunning = simulationData?.running || false;
  const engine = simulationData?.mode || 'fallback';
  const step = simulationData?.step || 0;

  const handleToggleSimulation = async () => {
    setLoading(true);
    try {
      if (isRunning) {
        await stopSimulation();
        if (onSimStateChanged) onSimStateChanged({ running: false });
      } else {
        const res = await startSimulation(simMode, vehicleRate);
        if (onSimStateChanged) onSimStateChanged({ running: true, mode: res.mode, engine: res.engine });
      }
    } catch (err) {
      console.error('Simulation toggle error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between shadow-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">SUMO Simulation Hub</h3>
            <p className="text-xs text-slate-400">TraCI Python API • 4-Way Intersection Simulator</p>
          </div>
        </div>

        {/* Engine Badge */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono">
          <span className="text-slate-400">Engine:</span>
          <span className="text-emerald-400 font-bold uppercase">{engine}</span>
        </div>
      </div>

      {/* Control Panel */}
      <div className="my-4 space-y-4">
        
        {/* Spawn Rate Slider */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-300 font-medium">Vehicle Injection Density:</span>
            <span className="font-mono text-emerald-400 font-bold">
              {(vehicleRate * 100).toFixed(0)}% (~{Math.round(vehicleRate * 1200)} veh/hr)
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={vehicleRate}
            onChange={(e) => setVehicleRate(parseFloat(e.target.value))}
            disabled={isRunning}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-50"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>Light Demand</span>
            <span>Saturation Flow</span>
          </div>
        </div>

        {/* Real-time Simulation Output KPI Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Sim Step</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">{step}s</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Throughput</div>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">845 <span className="text-[10px] text-slate-400">v/h</span></div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">CO2 Index</div>
            <div className="text-lg font-bold text-cyan-400 font-mono mt-0.5">-29.6%</div>
          </div>
        </div>

      </div>

      {/* Action Button */}
      <button
        onClick={handleToggleSimulation}
        disabled={loading}
        className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all ${
          isRunning
            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30 active:scale-[0.98]'
        }`}
      >
        {isRunning ? (
          <>
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Halt Active Simulation</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Simulation Run</span>
          </>
        )}
      </button>

    </div>
  );
}
