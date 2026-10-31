import React, { useState } from 'react';
import { ShieldAlert, X, AlertTriangle, Siren, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { triggerEmergencyPriority } from '../services/api';

export default function EmergencyModal({ isOpen, onClose, onActivated }) {
  const [approach, setApproach] = useState('north');
  const [vehicleType, setVehicleType] = useState('ambulance');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleActivate = async () => {
    setSubmitting(true);
    try {
      const res = await triggerEmergencyPriority(approach, vehicleType);
      if (onActivated) onActivated(res);
      onClose();
    } catch (err) {
      console.error('Emergency activation error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-red-800/80 shadow-2xl shadow-red-950/50">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-red-400">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
            <h3 className="text-base font-bold uppercase tracking-wider text-white">Emergency Vehicle Priority</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 my-3">
          Simulate an inbound emergency vehicle approaching the intersection. The adaptive controller halts active phases, safely transitions conflicting signals to red, and locks a green corridor.
        </p>

        {/* Vehicle Selection */}
        <div className="space-y-3 mb-4">
          <label className="text-xs font-semibold text-slate-400 uppercase">Emergency Vehicle Type</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'ambulance', label: 'Ambulance 🚑' },
              { id: 'fire_truck', label: 'Fire Truck 🚒' },
              { id: 'police', label: 'Police 🚓' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setVehicleType(v.id)}
                className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-all ${
                  vehicleType === v.id
                    ? 'bg-red-950 border-red-500 text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Approach Direction Selection */}
        <div className="space-y-3 mb-5">
          <label className="text-xs font-semibold text-slate-400 uppercase">Approach Direction</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'north', label: 'North Approach', icon: ArrowUp },
              { id: 'south', label: 'South Approach', icon: ArrowDown },
              { id: 'east', label: 'East Approach', icon: ArrowRight },
              { id: 'west', label: 'West Approach', icon: ArrowLeft },
            ].map((d) => {
              const Icon = d.icon;
              return (
                <button
                  key={d.id}
                  onClick={() => setApproach(d.id)}
                  className={`py-2.5 px-3 text-xs font-medium rounded-lg border flex items-center justify-center space-x-2 transition-all ${
                    approach === d.id
                      ? 'bg-cyan-950 border-cyan-500 text-white font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{d.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Safety Note */}
        <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-[11px] text-amber-300 flex items-start space-x-2 mb-5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Priority grant initiates instantaneous 3-second yellow clearance for conflicting streams before corridor green locks.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="w-1/2 py-2.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleActivate}
            disabled={submitting}
            className="w-1/2 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-red-600/40"
          >
            {submitting ? 'Triggering...' : 'Lock Green Corridor'}
          </button>
        </div>

      </div>
    </div>
  );
}
