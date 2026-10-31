import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { TrendingUp, BarChart2, ShieldCheck, Zap } from 'lucide-react';

export default function AnalyticsChart() {
  const comparisonData = [
    { metric: 'Avg Delay (s)', fixed: 48.2, adaptive: 24.5, unit: 'sec' },
    { metric: 'Avg Queue (veh)', fixed: 14.3, adaptive: 6.2, unit: 'veh' },
    { metric: 'Stops / Trip', fixed: 3.4, adaptive: 1.1, unit: 'stops' },
  ];

  const throughputTrend = [
    { time: '08:00', fixed: 520, adaptive: 710 },
    { time: '09:00 (Rush)', fixed: 620, adaptive: 845 },
    { time: '10:00', fixed: 590, adaptive: 820 },
    { time: '11:00', fixed: 540, adaptive: 760 },
    { time: '12:00', fixed: 580, adaptive: 790 },
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 mb-5 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Empirical Controller Benchmarking
            </h3>
            <p className="text-xs text-slate-400">
              Crossroads AI Adaptive Optimization vs Fixed-Time 45s Pre-Timed Cycle Baseline
            </p>
          </div>
        </div>

        {/* Improvement Summary Badges */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs font-mono text-emerald-400 font-bold shadow-sm">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>-49.1% DELAY</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-cyan-950/60 border border-cyan-800 text-xs font-mono text-cyan-400 font-bold shadow-sm">
            <Zap className="w-3.5 h-3.5" />
            <span>+36.3% CAPACITY</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Delay & Queue Comparison */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Intersection Delay & Queue Compression
            </h4>
            <span className="text-[10px] font-mono text-slate-500">Lower is better</span>
          </div>
          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="metric" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '10px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="fixed" name="Fixed-Time Baseline" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="adaptive" name="Crossroads AI" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Throughput Comparison */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Arterial Throughput Under Peak Demand (Veh/Hr)
            </h4>
            <span className="text-[10px] font-mono text-slate-500">Higher is better</span>
          </div>
          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={throughputTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '10px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="fixed" name="Fixed-Time Baseline" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="adaptive" name="Crossroads AI (v/h)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
