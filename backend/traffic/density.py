"""
Crossroads AI - Traffic Density & Queue Estimation Module
Calculates spatial density, approach assignment, queue length, and multi-factor congestion levels.
"""

from typing import Dict, List, Any, Tuple, Optional


class TrafficDensityAnalyzer:
    """
    Analyzes spatial distribution of vehicles at an intersection.
    Uses multi-factor evaluation combining:
    1. Spatial lane occupancy ratio (area occupied by bounding boxes vs approach area)
    2. Active queue length (stationary/slow-moving clustered vehicles)
    3. Approach volume (vehicle count per approach)
    """

    APPROACH_ZONES = {
        # Normalized bounding coordinates (xmin, ymin, xmax, ymax) in camera perspective
        "north": (0.25, 0.0, 0.75, 0.45),
        "south": (0.25, 0.55, 0.75, 1.0),
        "west": (0.0, 0.25, 0.45, 0.75),
        "east": (0.55, 0.25, 1.0, 0.75),
    }

    # Equivalent Passenger Car Units (PCU) for accurate congestion weight
    PCU_WEIGHTS = {
        "car": 1.0,
        "motorcycle": 0.5,
        "bus": 2.5,
        "truck": 2.2,
    }

    def __init__(self, frame_width: int = 1280, frame_height: int = 720):
        self.frame_width = frame_width
        self.frame_height = frame_height

    def classify_approach(self, box: List[float], width: Optional[int] = None, height: Optional[int] = None) -> str:
        """
        Assigns a detected bounding box to an intersection approach
        based on its centroid normalized coordinates.
        box format: [x1, y1, x2, y2]
        """
        w = width or self.frame_width or 1280
        h = height or self.frame_height or 720
        cx = ((box[0] + box[2]) / 2.0) / max(1, w)
        cy = ((box[1] + box[3]) / 2.0) / max(1, h)

        # Quadrant / centroid distance check relative to center
        dx = cx - 0.5
        dy = cy - 0.5

        if abs(dy) >= abs(dx):
            return "north" if dy < 0 else "south"
        else:
            return "west" if dx < 0 else "east"

    def calculate_density(
        self,
        detected_vehicles: List[Dict[str, Any]],
        frame_width: Optional[int] = None,
        frame_height: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Takes list of detected vehicle objects:
        [
          { "track_id": int, "class_name": str, "box": [x1, y1, x2, y2], "speed": float, ... }
        ]
        Returns detailed approach statistics and overall intersection congestion level.
        """
        fw = frame_width or self.frame_width or 1280
        fh = frame_height or self.frame_height or 720

        approach_stats = {
            "north": {"count": 0, "pcu_sum": 0.0, "total_box_area": 0.0, "queue_length": 0, "vehicles": []},
            "south": {"count": 0, "pcu_sum": 0.0, "total_box_area": 0.0, "queue_length": 0, "vehicles": []},
            "east": {"count": 0, "pcu_sum": 0.0, "total_box_area": 0.0, "queue_length": 0, "vehicles": []},
            "west": {"count": 0, "pcu_sum": 0.0, "total_box_area": 0.0, "queue_length": 0, "vehicles": []},
        }

        frame_area = fw * fh
        approach_estimated_area = frame_area * 0.25

        for veh in detected_vehicles:
            box = veh["box"]
            cls = veh.get("class_name", "car").lower()
            approach = self.classify_approach(box, width=fw, height=fh)
            
            box_area = max(0, (box[2] - box[0]) * (box[3] - box[1]))
            pcu = self.PCU_WEIGHTS.get(cls, 1.0)
            
            stats = approach_stats[approach]
            stats["count"] += 1
            stats["pcu_sum"] += pcu
            stats["total_box_area"] += box_area
            stats["vehicles"].append(veh)

            # Queue heuristic: vehicles moving slowly (< 5 px/frame or stationary)
            speed = veh.get("speed", 0.0)
            if speed < 3.0:
                stats["queue_length"] += 1

        # Calculate density indices (0.0 to 1.0) per approach
        results_approaches = {}
        total_pcu = 0.0
        total_queue = 0

        for name, data in approach_stats.items():
            spatial_occupancy = min(1.0, data["total_box_area"] / (approach_estimated_area * 0.45))
            pcu_density = min(1.0, data["pcu_sum"] / 15.0)  # 15 PCU represents saturation flow
            
            # Weighted multi-factor density: 60% spatial occupancy + 40% PCU density
            combined_density = round(0.60 * spatial_occupancy + 0.40 * pcu_density, 3)
            queue_est = max(data["queue_length"], int(data["count"] * 0.65))

            results_approaches[name] = {
                "vehicle_count": data["count"],
                "pcu_volume": round(data["pcu_sum"], 1),
                "density": combined_density,
                "queue_length": queue_est,
                "congestion_level": self._classify_level(combined_density, queue_est),
            }

            total_pcu += data["pcu_sum"]
            total_queue += queue_est

        # Overall intersection congestion status
        avg_density = sum(a["density"] for a in results_approaches.values()) / 4.0
        avg_queue = total_queue / 4.0
        overall_status = self._classify_level(avg_density, avg_queue)

        return {
            "overall_status": overall_status,
            "average_density": round(avg_density, 3),
            "average_queue_length": round(avg_queue, 1),
            "total_pcu_load": round(total_pcu, 1),
            "approaches": results_approaches
        }

    @staticmethod
    def _classify_level(density: float, queue: float) -> str:
        """
        Classifies congestion level into LOW, MEDIUM, or HIGH
        based on both spatial density AND queue length.
        """
        if density >= 0.70 or queue >= 8.0:
            return "HIGH"
        elif density >= 0.35 or queue >= 3.0:
            return "MEDIUM"
        else:
            return "LOW"
