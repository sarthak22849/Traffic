import React from 'react';
import { Sliders, CheckCircle2, Zap, Clock, ShieldAlert } from 'lucide-react';

export default function SignalControllerPanel({ controllerMode, onModeChange, approaches }) {
  const isAdaptive = controllerMode === 'adaptive';
  const nsGreen = approaches?.north?.green_time || 25;
  const ewGreen = approaches?.east?.green_time || 40;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between shadow-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Signal Optimization Core</h3>
            <p className="text-xs text-slate-400">Dynamic phase duration & conflict mitigation</p>
          </div>
        </div>

        {/* Mode Selector Toggle */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onModeChange('adaptive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isAdaptive
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Adaptive AI
          </button>
          <button
            onClick={() => onModeChange('fixed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !isAdaptive
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fixed-Time (45s)
          </button>
        </div>
      </div>

      {/* Rules & Constraints Config */}
      <div className="my-4 space-y-3">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
          <span className="text-slate-400">Controller Strategy:</span>
          <span className="text-cyan-300 font-mono font-bold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            {isAdaptive ? 'Density-Weighted Queue Clearance' : 'Pre-Timed Fixed Cyclic Rotation'}
          </span>
        </div>

        {/* Dynamic Green Allocations */}
        <div className="space-y-2 pt-1">
          <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Dynamic Green Signal Allocations:</span>
            <span className="text-[10px] font-mono text-slate-500">Min 15s • Max 60s</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* N-S Axis */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>North-South Axis:</span>
                <span className="text-emerald-400 font-mono font-bold">{nsGreen}s</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (nsGreen / 60) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">
                {isAdaptive ? 'Computed via queue demand' : 'Fixed baseline quota'}
              </div>
            </div>

            {/* E-W Axis */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>East-West Axis:</span>
                <span className="text-cyan-400 font-mono font-bold">{ewGreen}s</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (ewGreen / 60) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">
                {isAdaptive ? 'Prioritizes heavy corridor' : 'Fixed baseline quota'}
              </div>
            </div>
          </div>
        </div>

        {/* Safety Bounds Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800">
            <div className="text-slate-400 text-[11px]">Min Green Threshold</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">15 seconds</div>
            <div className="text-[10px] text-slate-500">Pedestrian safety clearance</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800">
            <div className="text-slate-400 text-[11px]">Max Green Ceiling</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">60 seconds</div>
            <div className="text-[10px] text-slate-500">Prevents starvation deadlock</div>
          </div>
        </div>
      </div>

      {/* Safety Interlock Assurance */}
      <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 flex items-center space-x-2 text-xs text-emerald-300">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Fail-Safe Conflict Interlock Active: Zero simultaneous conflicting green phases</span>
      </div>

    </div>
  );
}
