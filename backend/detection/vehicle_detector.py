"""
Crossroads AI - Vehicle Detector & Tracker
Ultralytics YOLO11n with ByteTrack Multi-Object Tracking
Detects and tracks Cars, Motorcycles, Buses, and Trucks.
"""

import os
import cv2
import time
import numpy as np
from typing import Dict, Any, List, Tuple, Optional
from ultralytics import YOLO

# Set clean write paths for temp caches
os.environ["YOLO_CONFIG_DIR"] = "/tmp/Ultralytics"
os.environ["MPLCONFIGDIR"] = "/tmp/matplotlib"

# COCO Vehicle Class ID Mapping
TARGET_CLASSES = {
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck"
}

# Distinct UI Colors (BGR format for OpenCV)
CLASS_COLORS = {
    "car": (245, 180, 0),         # Amber / Cyan
    "motorcycle": (74, 222, 128),  # Vibrant Green
    "bus": (234, 179, 8),          # Amber / Orange
    "truck": (168, 85, 247)        # Purple
}


class VehicleDetector:
    def __init__(self, model_path: str = "yolo11n.pt", device: str = "cpu"):
        """
        Initializes the YOLO11n model and verifies target vehicle classes.
        """
        # Ensure path exists, fallback to local root if needed
        if not os.path.isabs(model_path):
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            candidate = os.path.join(base_dir, model_path)
            if os.path.exists(candidate):
                model_path = candidate

        self.model = YOLO(model_path)
        self.device = device
        self.target_class_ids = list(TARGET_CLASSES.keys())

    def analyze_frame(
        self,
        frame: np.ndarray,
        confidence: float = 0.35,
        persist: bool = True
    ) -> Tuple[np.ndarray, List[Dict[str, Any]]]:
        """
        Runs YOLO11n detection + tracking on a single frame.
        Handles both video sequences (ByteTrack) and static frames.
        Returns: (annotated_frame, list_of_detected_objects)
        """
        # Ensure frame is 3-channel BGR
        if frame.ndim == 3 and frame.shape[2] == 4:
            frame = cv2.cvtColor(frame, cv2.COLOR_BGRA2BGR)
        elif frame.ndim == 2:
            frame = cv2.cvtColor(frame, cv2.COLOR_GRAY2BGR)

        h, w = frame.shape[:2]

        if persist:
            # Video sequence: ByteTrack tracker for temporal association
            results = self.model.track(
                source=frame,
                classes=self.target_class_ids,
                conf=confidence,
                persist=True,
                tracker="bytetrack.yaml",
                verbose=False,
                device=self.device
            )
        else:
            # Static image: standard YOLO inference (fast & deterministic)
            results = self.model(
                source=frame,
                classes=self.target_class_ids,
                conf=confidence,
                verbose=False,
                device=self.device
            )

        detections = []
        annotated_frame = frame.copy()

        if len(results) > 0 and results[0].boxes is not None:
            boxes = results[0].boxes

            for i, box in enumerate(boxes):
                cls_id = int(box.cls[0].item())
                conf = float(box.conf[0].item())
                xyxy = box.xyxy[0].tolist()  # [x1, y1, x2, y2]
                
                # Use tracker ID if available, else sequential vehicle index
                track_id = int(box.id[0].item()) if (hasattr(box, "id") and box.id is not None) else (i + 1)
                class_name = TARGET_CLASSES.get(cls_id, "unknown")

                detections.append({
                    "track_id": track_id,
                    "class_id": cls_id,
                    "class_name": class_name,
                    "confidence": round(conf, 2),
                    "box": [round(coord, 1) for coord in xyxy],
                    "centroid": [round((xyxy[0] + xyxy[2]) / 2.0, 1), round((xyxy[1] + xyxy[3]) / 2.0, 1)]
                })

                # Draw high-visibility bounding box and label
                x1, y1, x2, y2 = [int(v) for v in xyxy]
                color = CLASS_COLORS.get(class_name, (0, 255, 255))
                
                # Bounding box with clean outline
                cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, 2)
                
                # Label tag
                label = f"#{track_id} {class_name.upper()} {conf:.2f}"
                (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
                
                # Semi-transparent label background banner
                banner_y1 = max(0, y1 - 22)
                banner_y2 = max(22, y1)
                cv2.rectangle(annotated_frame, (x1, banner_y1), (x1 + tw + 8, banner_y2), color, -1)
                cv2.putText(
                    annotated_frame,
                    label,
                    (x1 + 4, max(15, banner_y2 - 6)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.42,
                    (0, 0, 0),
                    1,
                    cv2.LINE_AA
                )

        return annotated_frame, detections

    def process_image(
        self,
        image_path: str,
        output_path: Optional[str] = None,
        confidence: float = 0.35
    ) -> Dict[str, Any]:
        """
        Runs YOLO11n detection on ANY image file format (JPG, JPEG, PNG, WEBP, BMP, TIFF, GIF, HEIC, etc.).
        Robustly handles all color spaces, alpha channels, and EXIF orientation rotations.
        """
        import time as _time

        frame = None
        # Primary: Pillow for comprehensive image decoding & EXIF auto-rotation
        try:
            from PIL import Image, ImageOps
            pil_img = Image.open(image_path)
            pil_img = ImageOps.exif_transpose(pil_img)
            if pil_img.mode != 'RGB':
                pil_img = pil_img.convert('RGB')
            frame = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        except Exception:
            # Secondary fallback: OpenCV imread
            frame = cv2.imread(image_path)

        if frame is None:
            raise ValueError(f"Unable to read or decode image file: {image_path}")

        h, w = frame.shape[:2]
        start = _time.time()

        # Run single-frame inference
        annotated_frame, detections = self.analyze_frame(frame, confidence=confidence, persist=False)
        elapsed = round(_time.time() - start, 3)

        # Save annotated image safely using imencode (works on any OS and file path)
        if output_path:
            try:
                is_success, buffer = cv2.imencode(".jpg", annotated_frame)
                if is_success:
                    with open(output_path, "wb") as f:
                        f.write(buffer)
                else:
                    cv2.imwrite(output_path, annotated_frame)
            except Exception as e:
                cv2.imwrite(output_path, annotated_frame)

        # Count detected vehicles per category
        category_counts = {"cars": 0, "motorcycles": 0, "buses": 0, "trucks": 0}
        for det in detections:
            c = det["class_name"]
            if c == "car":         category_counts["cars"] += 1
            elif c == "motorcycle": category_counts["motorcycles"] += 1
            elif c == "bus":        category_counts["buses"] += 1
            elif c == "truck":      category_counts["trucks"] += 1

        total = len(detections)

        return {
            "processed_frames": 1,
            "total_frames_in_video": 1,
            "frame_width": w,
            "frame_height": h,
            "processing_time_sec": elapsed,
            "inference_fps": round(1.0 / max(elapsed, 0.001), 2),
            "total_unique_vehicles": total,
            "peak_active_vehicles": total,
            "category_counts": category_counts,
            "last_frame_detections": detections,
            "output_video_path": output_path
        }

    def process_video(
        self,
        video_path: str,
        output_path: Optional[str] = None,
        confidence: float = 0.35,
        max_frames: int = 150
    ) -> Dict[str, Any]:
        """
        Processes an entire video clip frame-by-frame with ByteTrack tracking.
        Aggregates unique vehicle IDs, counts by category, and peak active counts.
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Unable to open video source: {video_path}")

        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        total_video_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        writer = None
        if output_path:
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            writer = cv2.VideoWriter(output_path, fourcc, min(fps, 30.0), (width, height))

        unique_tracks: Dict[int, str] = {}
        category_counts = {"cars": 0, "motorcycles": 0, "buses": 0, "trucks": 0}
        all_detections_history = []
        frame_idx = 0
        peak_active_vehicles = 0
        last_frame_detections = []

        start_time = time.time()

        while cap.isOpened() and frame_idx < max_frames:
            ret, frame = cap.read()
            if not ret:
                break

            annotated_frame, frame_detections = self.analyze_frame(
                frame,
                confidence=confidence,
                persist=True
            )
            last_frame_detections = frame_detections

            if len(frame_detections) > peak_active_vehicles:
                peak_active_vehicles = len(frame_detections)

            # Record unique tracked IDs
            for det in frame_detections:
                t_id = det["track_id"]
                c_name = det["class_name"]
                if t_id is not None and t_id not in unique_tracks:
                    unique_tracks[t_id] = c_name
                    if c_name == "car":
                        category_counts["cars"] += 1
                    elif c_name == "motorcycle":
                        category_counts["motorcycles"] += 1
                    elif c_name == "bus":
                        category_counts["buses"] += 1
                    elif c_name == "truck":
                        category_counts["trucks"] += 1

            if writer:
                writer.write(annotated_frame)

            frame_idx += 1

        cap.release()
        if writer:
            writer.release()

        elapsed = time.time() - start_time
        fps_achieved = round(frame_idx / max(0.001, elapsed), 2)

        # Fallback if video was short or tracker didn't assign IDs:
        total_unique = len(unique_tracks)
        if total_unique == 0 and len(last_frame_detections) > 0:
            total_unique = len(last_frame_detections)
            for d in last_frame_detections:
                c = d["class_name"]
                if c == "car": category_counts["cars"] += 1
                elif c == "motorcycle": category_counts["motorcycles"] += 1
                elif c == "bus": category_counts["buses"] += 1
                elif c == "truck": category_counts["trucks"] += 1

        return {
            "processed_frames": frame_idx,
            "total_frames_in_video": total_video_frames,
            "processing_time_sec": round(elapsed, 2),
            "inference_fps": fps_achieved,
            "total_unique_vehicles": total_unique,
            "peak_active_vehicles": peak_active_vehicles,
            "category_counts": category_counts,
            "last_frame_detections": last_frame_detections,
            "output_video_path": output_path
        }
