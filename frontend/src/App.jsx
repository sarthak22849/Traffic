import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MetricCards from './components/MetricCards';
import IntersectionVisualizer from './components/IntersectionVisualizer';
import SignalControllerPanel from './components/SignalControllerPanel';
import VideoAnalysis from './components/VideoAnalysis';
import SimulationView from './components/SimulationView';
import AnalyticsChart from './components/AnalyticsChart';
import EmergencyModal from './components/EmergencyModal';
import { fetchHealth, fetchDashboard, connectTrafficWebSocket } from './services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [controllerMode, setControllerMode] = useState('adaptive');
  const [wsConnected, setWsConnected] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Initial load and health check
  useEffect(() => {
    const checkSystem = async () => {
      const h = await fetchHealth();
      setHealth(h);
      if (h.status === 'healthy') {
        setIsOffline(false);
        try {
          const d = await fetchDashboard();
          setDashboard(d);
          if (d.controller_mode) setControllerMode(d.controller_mode);
        } catch (e) {
          console.warn('Dashboard fetch error:', e);
        }
      } else {
        setIsOffline(true);
      }
    };
    checkSystem();

    // WebSocket telemetry subscription
    let ws;
    try {
      ws = connectTrafficWebSocket(
        (data) => {
          setDashboard((prev) => ({
            ...prev,
            ...data,
          }));
          setWsConnected(true);
          setIsOffline(false);
        },
        () => setWsConnected(true),
        () => setWsConnected(false)
      );
    } catch (err) {
      console.warn('WebSocket connection init failed:', err);
    }

    // Secondary polling fallback (every 3 seconds) in case WebSocket is not active
    const interval = setInterval(async () => {
      try {
        const d = await fetchDashboard();
        setDashboard(d);
        setIsOffline(false);
      } catch (err) {
        // Only set offline if health also fails
      }
    }, 3000);

    return () => {
      if (ws) ws.close();
      clearInterval(interval);
    };
  }, []);

  const handleModeChange = (mode) => {
    setControllerMode(mode);
    setDashboard((prev) => prev ? { ...prev, controller_mode: mode } : null);
  };

  const handleAnalysisComplete = (analysisResult) => {
    // Wire real YOLO detection results into the live dashboard state.
    // This replaces all hardcoded mock values with actual backend data.
    if (!analysisResult) return;

    const cats = analysisResult.category_counts || {};
    const density = analysisResult.density_analysis || {};
    const approachesFromCV = density.approaches || {};

    setDashboard((prev) => ({
      ...prev,
      // Real vehicle counts from YOLO11n + ByteTrack
      total_vehicles: analysisResult.total_unique_vehicles ?? prev?.total_vehicles,
      categories: {
        cars: cats.cars ?? prev?.categories?.cars ?? 0,
        motorcycles: cats.motorcycles ?? prev?.categories?.motorcycles ?? 0,
        buses: cats.buses ?? prev?.categories?.buses ?? 0,
        trucks: cats.trucks ?? prev?.categories?.trucks ?? 0,
      },
      // Real congestion status from density analyzer
      congestion_status: analysisResult.congestion_status ?? prev?.congestion_status,
      // Real queue length from density analyzer
      average_queue_length: density.average_queue_length ?? prev?.average_queue_length,
      // Merge per-approach density + queue length from CV results
      approaches: prev?.approaches
        ? Object.fromEntries(
            Object.entries(prev.approaches).map(([dir, data]) => [
              dir,
              {
                ...data,
                density: approachesFromCV[dir]?.density ?? data.density,
                queue_length: approachesFromCV[dir]?.queue_length ?? data.queue_length,
                green_time: approachesFromCV[dir]?.green_time ?? data.green_time,
              },
            ])
          )
        : prev?.approaches,
    }));
  };

  const handleSimStateChanged = (simState) => {
    setDashboard((prev) => prev ? {
      ...prev,
      simulation: {
        ...(prev.simulation || {}),
        ...simState
      }
    } : null);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 bg-grid-pattern selection:bg-cyan-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        systemHealth={health}
        emergencyActive={dashboard?.emergency?.active || false}
        wsConnected={wsConnected}
        onEmergencyClick={() => setEmergencyModalOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Offline Warning Banner */}
        {isOffline && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Backend server is connecting or starting up at <code className="bg-slate-900 px-1 py-0.5 rounded">http://127.0.0.1:8002</code>. Real-time telemetry will sync automatically.
              </span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-900/60 hover:bg-amber-800 text-white font-medium"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Section 1: Core Metrics Bar */}
        <MetricCards metrics={dashboard} />

        {/* Section 2: Intersection & Video Processing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: 4-Way Intersection & Controller (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            <IntersectionVisualizer
              approaches={dashboard?.approaches}
              currentPhase={dashboard?.current_phase || 'EAST_WEST_GREEN'}
              remainingSec={dashboard?.phase_remaining_sec ?? 20}
              emergency={dashboard?.emergency}
            />
            <SignalControllerPanel
              controllerMode={controllerMode}
              onModeChange={handleModeChange}
              approaches={dashboard?.approaches}
            />
          </div>

          {/* Right Column: CCTV Analysis & SUMO Simulation (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            <VideoAnalysis onAnalysisComplete={handleAnalysisComplete} />
            <SimulationView
              simulationData={dashboard?.simulation}
              onSimStateChanged={handleSimStateChanged}
            />
          </div>

        </div>

        {/* Section 3: Performance Comparison & Benchmark Analytics */}
        <AnalyticsChart />

      </main>

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
        onActivated={(res) => {
          setDashboard((prev) => prev ? {
            ...prev,
            emergency: {
              active: true,
              approach: res.approach,
              vehicle: res.vehicle,
              remaining_sec: res.duration_sec
            }
          } : null);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 font-mono">
        Crossroads AI • Hackathon Edition • Intelligent Adaptive Traffic Management • YOLO11n + ByteTrack + TraCI
      </footer>

    </div>
  );
}
