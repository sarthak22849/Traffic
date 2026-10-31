import React from 'react';
import { ShieldAlert, Cpu, Radio, Network, Activity } from 'lucide-react';

export default function Navbar({ systemHealth, emergencyActive, wsConnected, onEmergencyClick }) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand & System Title */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
            <span className="text-xl">🚦</span>
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-base sm:text-lg font-black tracking-wider text-white font-mono flex items-center gap-2">
                CROSSROADS AI
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 font-mono tracking-tight font-semibold">
                v2.0 HACKATHON
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Intelligent Adaptive Traffic Management System • YOLO11n Vision + Dynamic Signals
            </p>
          </div>
        </div>

        {/* Live System Telemetry Badges & Emergency Control */}
        <div className="flex items-center space-x-3">
          
          {/* WebSocket Status Indicator */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-slate-300 font-mono text-[11px]">
              {wsConnected ? 'WS LIVE TELEMETRY' : 'WS CONNECTING'}
            </span>
          </div>

          {/* AI Detection Stack Pill */}
          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300 font-mono text-[11px]">
              YOLO11n + ByteTrack
            </span>
          </div>

          {/* Emergency Priority Trigger Button */}
          <button
            onClick={onEmergencyClick}
            className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              emergencyActive
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-rose-500/40 border border-rose-400'
                : 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="tracking-wide">
              {emergencyActive ? 'EMERGENCY OVERRIDE' : 'EMERGENCY PRIORITY'}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
}
