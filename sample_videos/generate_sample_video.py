"""
Crossroads AI - Test Video Generator
Generates a realistic synthetic CCTV intersection video for immediate testing & demonstration.
"""

import os
import cv2
import numpy as np

def generate_sample_traffic_video(output_path: str = "sample_videos/sample_cctv.mp4", num_frames: int = 90):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    width, height = 640, 480
    fps = 30
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    # Vehicle simulated trajectories [start_x, start_y, vx, vy, w, h, color, label]
    vehicles = [
        {"x": 100, "y": 200, "vx": 3.0, "vy": 0.0, "w": 65, "h": 35, "color": (50, 50, 220), "type": "car"},
        {"x": 20,  "y": 250, "vx": 4.5, "vy": 0.0, "w": 70, "h": 38, "color": (220, 100, 50), "type": "car"},
        {"x": 300, "y": 30,  "vx": 0.0, "vy": 3.5, "w": 40, "h": 85, "color": (50, 180, 220), "type": "bus"},
        {"x": 500, "y": 400, "vx": -3.5,"vy": 0.0, "w": 75, "h": 40, "color": (150, 50, 200), "type": "truck"},
        {"x": 350, "y": 420, "vx": 0.0, "vy": -4.0,"w": 25, "h": 40, "color": (50, 220, 100), "type": "motorcycle"},
    ]

    for frame_i in range(num_frames):
        # Asphalt background
        frame = np.full((height, width, 3), 45, dtype=np.uint8)

        # Crossroad markings
        cv2.rectangle(frame, (260, 0), (380, height), (55, 55, 55), -1)
        cv2.rectangle(frame, (0, 180), (width, 300), (55, 55, 55), -1)

        # Dashed lane lines
        for y in range(0, height, 40):
            cv2.line(frame, (320, y), (320, y + 20), (200, 200, 200), 2)
        for x in range(0, width, 40):
            cv2.line(frame, (x, 240), (x + 20, 240), (200, 200, 200), 2)

        # Draw simulated vehicles
        for v in vehicles:
            curr_x = int(v["x"] + v["vx"] * frame_i)
            curr_y = int(v["y"] + v["vy"] * frame_i)
            cv2.rectangle(frame, (curr_x, curr_y), (curr_x + v["w"], curr_y + v["h"]), v["color"], -1)
            cv2.rectangle(frame, (curr_x, curr_y), (curr_x + v["w"], curr_y + v["h"]), (255, 255, 255), 1)

        # Timestamp overlay
        cv2.putText(frame, f"CAM-04 INTERSECTION LIVE | FRAME: {frame_i:03d}", (15, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)
        out.write(frame)

    out.release()
    print(f"Generated sample CCTV video: {output_path} ({num_frames} frames)")

if __name__ == "__main__":
    generate_sample_traffic_video()
