import React from 'react';
import { Car, Bike, Bus, Truck, Clock, Activity, Zap } from 'lucide-react';

export default function MetricCards({ metrics }) {
  const {
    total_vehicles = 0,
    categories = { cars: 0, motorcycles: 0, buses: 0, trucks: 0 },
    congestion_status = 'LOW',
    average_waiting_time = 0,
    average_queue_length = 0,
    vehicles_passed = 0
  } = metrics || {};

  const getCongestionBadge = (status) => {
    switch (status) {
      case 'HIGH':
        return {
          text: 'HIGH CONGESTION',
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/20 shadow-sm'
        };
      case 'MEDIUM':
        return {
          text: 'MODERATE DENSITY',
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/20 shadow-sm'
        };
      default:
        return {
          text: 'OPTIMAL FLOW',
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20 shadow-sm'
        };
    }
  };

  const badge = getCongestionBadge(congestion_status);
  const total = Math.max(1, total_vehicles);

  const getPercent = (count) => {
    if (!total_vehicles) return '0%';
    return `${Math.round(((count || 0) / total) * 100)}%`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
      
      {/* ── Active Vehicles KPI ── */}
      <div className="glass-panel rounded-2xl p-4 col-span-2 md:col-span-2 lg:col-span-2 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500"></div>
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Active Fleet Detected
          </span>
          <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
            {badge.text}
          </span>
        </div>

        <div className="flex items-baseline space-x-3">
          <span className="text-3xl lg:text-4xl font-extrabold text-white font-mono tracking-tight">
            {total_vehicles}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {total_vehicles === 1 ? 'vehicle in frame' : 'vehicles in frame'}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
          <span>Processed Flow: <strong className="text-slate-200">{vehicles_passed}</strong></span>
          <span className="text-cyan-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" />
            ByteTrack Active
          </span>
        </div>
      </div>

      {/* ── Cars ── */}
      <div className="glass-panel rounded-2xl p-3.5 border border-slate-800 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-500/80"></div>
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-semibold text-slate-300">Cars</span>
          <Car className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-2xl font-bold text-white font-mono">{categories.cars || 0}</div>
        <div className="text-[10px] text-slate-400 font-mono mt-1 flex justify-between">
          <span>1.0 PCU</span>
          <span className="text-cyan-400">{getPercent(categories.cars)}</span>
        </div>
      </div>

      {/* ── Motorcycles ── */}
      <div className="glass-panel rounded-2xl p-3.5 border border-slate-800 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500/80"></div>
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-semibold text-slate-300">Bikes</span>
          <Bike className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-bold text-white font-mono">{categories.motorcycles || 0}</div>
        <div className="text-[10px] text-slate-400 font-mono mt-1 flex justify-between">
          <span>0.5 PCU</span>
          <span className="text-emerald-400">{getPercent(categories.motorcycles)}</span>
        </div>
      </div>

      {/* ── Buses ── */}
      <div className="glass-panel rounded-2xl p-3.5 border border-slate-800 relative overflow-hidden group hover:border-amber-500/40 transition-all">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-500/80"></div>
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-semibold text-slate-300">Buses</span>
          <Bus className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-2xl font-bold text-white font-mono">{categories.buses || 0}</div>
        <div className="text-[10px] text-slate-400 font-mono mt-1 flex justify-between">
          <span>2.5 PCU</span>
          <span className="text-amber-400">{getPercent(categories.buses)}</span>
        </div>
      </div>

      {/* ── Trucks ── */}
      <div className="glass-panel rounded-2xl p-3.5 border border-slate-800 relative overflow-hidden group hover:border-purple-500/40 transition-all">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-purple-500/80"></div>
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-semibold text-slate-300">Trucks</span>
          <Truck className="w-4 h-4 text-purple-400" />
        </div>
        <div className="text-2xl font-bold text-white font-mono">{categories.trucks || 0}</div>
        <div className="text-[10px] text-slate-400 font-mono mt-1 flex justify-between">
          <span>2.2 PCU</span>
          <span className="text-purple-400">{getPercent(categories.trucks)}</span>
        </div>
      </div>

      {/* ── Average Delay & Queue ── */}
      <div className="glass-panel rounded-2xl p-3.5 border border-slate-800 col-span-2 md:col-span-2 lg:col-span-1 relative overflow-hidden group hover:border-blue-500/40 transition-all">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-500/80"></div>
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-semibold text-slate-300">Avg Delay</span>
          <Clock className="w-4 h-4 text-blue-400" />
        </div>
        <div className="text-2xl font-bold text-white font-mono">
          {average_waiting_time.toFixed(1)}<span className="text-xs text-slate-400 ml-0.5">s</span>
        </div>
        <div className="text-[10px] text-slate-400 font-mono mt-1">
          Queue: ~{average_queue_length.toFixed(1)} veh
        </div>
      </div>

    </div>
  );
}
