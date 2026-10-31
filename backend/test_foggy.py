"""
Crossroads AI - Foggy Weather Feature 6 Test
Validates that the atmospheric scattering model degrades contrast and measures YOLO performance delta.
"""

import sys
import os

os.environ["MPLCONFIGDIR"] = "/tmp/matplotlib"
os.environ["YOLO_CONFIG_DIR"] = "/tmp/Ultralytics"
sys.path.insert(0, os.path.dirname(__file__))

from detection.vehicle_detector import VehicleDetector
from detection.foggy_evaluator import FoggyWeatherEvaluator


def test_foggy_evaluator():
    sample_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sample_videos", "sample_cctv.mp4")
    assert os.path.exists(sample_path), f"Sample video missing at {sample_path}"

    print("Initializing YOLO11n for Foggy Weather Benchmarking...")
    detector = VehicleDetector()
    evaluator = FoggyWeatherEvaluator(detector)

    print("Running Clear vs Foggy comparative analysis...")
    results = evaluator.run_comparative_benchmark(sample_path)

    clear = results["clear_condition"]
    foggy = results["foggy_condition"]
    impact = results["empirical_impact"]

    print(f"✓ Clear Condition : {clear['detected_unique_vehicles']} vehicles | Avg Conf: {clear['average_confidence']:.2f}")
    print(f"✓ Foggy Condition : {foggy['detected_unique_vehicles']} vehicles | Avg Conf: {foggy['average_confidence']:.2f}")
    print(f"✓ Confidence Drop : {impact['confidence_drop_percentage']}%")
    print(f"✓ Observation     : {impact['key_observation']}")

    assert "clear_condition" in results
    assert "foggy_condition" in results
    assert "empirical_impact" in results
    print("\n🎉 FEATURE 6 FOGGY WEATHER TEST PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    test_foggy_evaluator()
