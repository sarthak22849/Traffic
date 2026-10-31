# Crossroads AI – Intelligent Adaptive Traffic Management System

**Crossroads AI** is an AI-powered traffic management platform combining computer vision (YOLO11n + ByteTrack) and simulation (SUMO TraCI) to dynamically control traffic signals, clear congestion, and establish zero-delay emergency vehicle priority corridors.

---

## Quick Start (Run in 1 Command)

```bash
cd /Users/sarthakthakur/Desktop/Traffic
./start_services.sh
```

- **Dashboard UI:** [http://localhost:5174](http://localhost:5174)
- **FastAPI Interactive Docs:** [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs)
- **Backend Health Check:** [http://127.0.0.1:8001/api/health](http://127.0.0.1:8001/api/health)

---

## Architecture Overview

```
Traffic/
├── backend/
│   ├── main.py                     # FastAPI application entrypoint & WebSockets
│   ├── requirements.txt            # Backend dependencies
│   ├── test_api.py                 # Automated API test suite
│   ├── detection/
│   │   └── vehicle_detector.py     # YOLO11n + ByteTrack tracker (Cars, Bikes, Buses, Trucks)
│   ├── traffic/
│   │   ├── density.py              # Spatial lane density & multi-factor queue estimation
│   │   └── signal_controller.py    # Adaptive signal control logic
│   └── uploads/                    # Uploaded CCTV MP4s and annotated outputs
├── frontend/                       # React 18 + Vite + Tailwind CSS + Recharts + Lucide
│   └── src/
│       ├── App.jsx                 # Dark theme dashboard layout & live telemetry
│       ├── components/             # Reusable UI cards, 4-way intersection visualizer, charts
│       └── services/api.js         # API and WebSocket client
├── sample_videos/                  # Generated sample CCTV footage for immediate demo
└── yolo11n.pt                      # Pretrained Ultralytics YOLO11n weights
```

---

## Verifying the Test Suite

```bash
./venv/bin/python3 backend/test_api.py
```
Outputs validation across all endpoints:
- Health check
- Dashboard state snapshot
- Traffic light phases and transitions
- Simulation controls and metrics
- Emergency vehicle corridor activation
- YOLO11n + ByteTrack video processing on sample CCTV video
