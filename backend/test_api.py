"""
Crossroads AI - Backend Smoke Tests & Milestone 1 Verification
"""

import sys
import os

os.environ["MPLCONFIGDIR"] = "/tmp/matplotlib"
os.environ["YOLO_CONFIG_DIR"] = "/tmp/Ultralytics"

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    data = res.json()
    assert data["status"] == "healthy"
    assert data["features"]["adaptive_controller"] is True
    print("✓ Health Check Passed:", data["service"])

def test_dashboard():
    res = client.get("/api/dashboard")
    assert res.status_code == 200, f"Dashboard snapshot failed: {res.text}"
    data = res.json()
    assert "total_vehicles" in data
    assert "approaches" in data
    assert "north" in data["approaches"]
    assert "emergency" in data
    print("✓ Dashboard Endpoint Passed:", f"Vehicles: {data['total_vehicles']}, Congestion: {data['congestion_status']}")

def test_traffic_status():
    res = client.get("/api/traffic-status")
    assert res.status_code == 200
    data = res.json()
    assert "current_phase" in data
    assert "approaches" in data
    print("✓ Traffic Status Passed: Active Phase =", data["current_phase"])

def test_simulation_endpoints():
    # Start
    start_res = client.post("/api/simulation/start", json={"mode": "adaptive", "vehicle_rate": 0.6})
    assert start_res.status_code == 200
    start_data = start_res.json()
    assert start_data["status"] == "started"

    # Metrics
    metrics_res = client.get("/api/simulation/metrics")
    assert metrics_res.status_code == 200
    metrics = metrics_res.json()
    assert "fixed_time" in metrics
    assert "adaptive" in metrics
    assert "improvement_pct" in metrics

    # Stop
    stop_res = client.post("/api/simulation/stop")
    assert stop_res.status_code == 200
    print("✓ Simulation Endpoints Passed:", f"Waiting Time Reduction = {metrics['improvement_pct']['waiting_time_reduction']}%")

def test_emergency_priority():
    res = client.post("/api/emergency/activate", json={
        "approach": "west",
        "vehicle_type": "ambulance",
        "duration_sec": 20
    })
    assert res.status_code == 200
    data = res.json()
    assert data["approach"] == "west"
    assert data["status"] == "emergency_priority_activated"
    print("✓ Emergency Priority Activation Passed:", data["message"])

def test_video_upload_endpoint():
    sample_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sample_videos", "sample_cctv.mp4")
    if os.path.exists(sample_path):
        with open(sample_path, "rb") as f:
            video_bytes = f.read()
        filename = "sample_cctv.mp4"
    else:
        video_bytes = b"fake video bytes for testing upload flow"
        filename = "test_cctv.mp4"

    res = client.post(
        "/api/analyze-video",
        files={"file": (filename, video_bytes, "video/mp4")},
        data={"confidence": "0.25"}
    )
    assert res.status_code == 200, f"Analysis endpoint failed: {res.text}"
    data = res.json()
    assert data["status"] == "success"
    assert "total_unique_vehicles" in data
    assert "category_counts" in data
    assert "density_analysis" in data
    print("✓ Video Analysis Endpoint Passed:", f"Processed {data['filename']}, Status: {data['congestion_status']}, FPS: {data['processing_stats']['fps']}")

if __name__ == "__main__":
    print("Running Crossroads AI Milestone 1 Tests...")
    test_health()
    test_dashboard()
    test_traffic_status()
    test_simulation_endpoints()
    test_emergency_priority()
    test_video_upload_endpoint()
    print("\n🎉 ALL MILESTONE 1 SMOKE TESTS PASSED!")
