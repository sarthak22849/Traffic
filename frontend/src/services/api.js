// Crossroads AI - API & WebSocket Service Layer

// Direct backend communication bypassing Vite dev proxy to avoid sandbox EPERM issues
const BACKEND_HOST = typeof window !== 'undefined' ? (window.location.hostname || '127.0.0.1') : '127.0.0.1';
const API_BASE = `http://${BACKEND_HOST}:8002/api`;

export const fetchHealth = async () => {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('fetchHealth error:', err);
    return { status: 'offline', error: err.message };
  }
};

export const fetchDashboard = async () => {
  try {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('fetchDashboard error:', err);
    throw err;
  }
};

export const fetchTrafficStatus = async () => {
  try {
    const res = await fetch(`${API_BASE}/traffic-status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('fetchTrafficStatus error:', err);
    throw err;
  }
};

export const uploadAndAnalyzeVideo = async (file, confidence = 0.35) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('confidence', confidence.toString());

  const res = await fetch(`${API_BASE}/analyze-video`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Upload and analysis failed' }));
    throw new Error(errorData.detail || `Upload failed with status ${res.status}`);
  }
  return await res.json();
};

export const runFoggyBenchmark = async () => {
  const res = await fetch(`${API_BASE}/benchmark/foggy`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Foggy benchmark request failed');
  return await res.json();
};

export const runDemoMedia = async (preset = 'intersection') => {
  const formData = new FormData();
  formData.append('preset', preset);

  const res = await fetch(`${API_BASE}/demo-media`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Demo preset failed' }));
    throw new Error(errorData.detail || `Demo request failed with status ${res.status}`);
  }
  return await res.json();
};

export const startSimulation = async (mode = 'adaptive', vehicleRate = 0.5) => {
  const res = await fetch(`${API_BASE}/simulation/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, vehicle_rate: vehicleRate }),
  });
  if (!res.ok) throw new Error('Failed to start simulation');
  return await res.json();
};

export const stopSimulation = async () => {
  const res = await fetch(`${API_BASE}/simulation/stop`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to stop simulation');
  return await res.json();
};

export const fetchSimulationMetrics = async () => {
  const res = await fetch(`${API_BASE}/simulation/metrics`);
  if (!res.ok) throw new Error('Failed to fetch simulation metrics');
  return await res.json();
};

export const triggerEmergencyPriority = async (approach = 'north', vehicleType = 'ambulance') => {
  const res = await fetch(`${API_BASE}/emergency/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approach, vehicle_type: vehicleType, duration_sec: 15 }),
  });
  if (!res.ok) throw new Error('Failed to trigger emergency priority');
  return await res.json();
};

export const fetchLatestDetection = async () => {
  try {
    const res = await fetch(`${API_BASE}/detection/latest`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('fetchLatestDetection error:', err);
    throw err;
  }
};

export const connectTrafficWebSocket = (onMessage, onOpen, onClose) => {
  const wsHost = typeof window !== 'undefined' ? (window.location.hostname || '127.0.0.1') : '127.0.0.1';
  const wsUrl = `ws://${wsHost}:8002/ws/traffic`;

  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    if (onOpen) onOpen();
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (onMessage) onMessage(data);
    } catch (e) {
      console.warn('WS message parse error:', e);
    }
  };

  ws.onclose = () => {
    if (onClose) onClose();
  };

  return ws;
};
