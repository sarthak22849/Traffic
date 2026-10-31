#!/bin/bash
# Crossroads AI - Development Services Runner

echo "=================================================="
echo "   CROSSROADS AI - SYSTEM STARTUP SCRIPT"
echo "=================================================="

# Export clean config dirs for matplotlib and ultralytics
export MPLCONFIGDIR="/tmp/matplotlib"
export YOLO_CONFIG_DIR="/tmp/Ultralytics"

# Function to stop background processes on Ctrl+C
cleanup() {
    echo ""
    echo "Shutting down Crossroads AI services..."
    kill $(jobs -p) 2>/dev/null
    exit
}
trap cleanup SIGINT SIGTERM

echo "[1/2] Starting FastAPI Backend on http://127.0.0.1:8001..."
./venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8001 --reload &
BACKEND_PID=$!

echo "[2/2] Starting React + Vite Dashboard on http://localhost:5174..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "Crossroads AI is up and running!"
echo "Dashboard UI: http://localhost:5174"
echo "Backend API Docs: http://localhost:8001/docs"
echo "Press Ctrl+C to stop both servers."
echo "=================================================="

wait
