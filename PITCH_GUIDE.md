# Crossroads AI – Hackathon Presentation & Judge Pitch Guide

> **Project:** Crossroads AI – Intelligent Adaptive Traffic Management System  
> **Team:** 3–4 Members  
> **Demo Duration:** 2–3 Minutes  

---

## 1. The Problem Statement (30 Seconds)

Conventional urban intersections rely on **rigid, pre-timed (fixed-time) signal cycles**. 
- Inefficient traffic light timing wastes **billions of hours annually** in avoidable delay.
- Empty roads often sit on green while congested cross-avenues queue up.
- Ambulances and emergency vehicles lose critical seconds trapped in intersection gridlocks.

**Crossroads AI solves this by turning traffic lights into adaptive, vision-informed smart agents.**

---

## 2. System Architecture (The "Dual-Source" Advantage)

Crossroads AI supports **two live input streams**:
1. **Real-World CCTV Video Footage:** Analyzed via **Ultralytics YOLO11n** + **ByteTrack** for real-time detection, cross-frame multi-object tracking, and spatial density calculation.
2. **SUMO Microscopic Traffic Simulation:** Controlled via Python's **TraCI API** on a 4-way, dual-lane intersection model to validate traffic flow dynamics.

---

## 3. Step-by-Step 2-Minute Live Demo Script

Follow this exact flow when demonstrating to judges:

| Step | Action on Dashboard | What to Say to Judges |
| :--- | :--- | :--- |
| **1. Overview** | Point to top metric cards | *"Welcome to Crossroads AI. Our dashboard is receiving real-time WebSocket telemetry from our backend AI and traffic control engine."* |
| **2. CCTV AI Analysis** | Click **"Execute AI Vehicle Analysis"** | *"Here we process CCTV footage using a pretrained YOLO11n model combined with ByteTrack. Notice we don't just count vehicles — we classify Cars, Motorcycles, Buses, and Trucks and map them into directional approach zones."* |
| **3. Density & Queues** | Highlight Congestion badge & Approach cards | *"Notice our density calculation is multi-factor: it combines spatial bounding box occupancy and Passenger Car Units (PCU) to accurately classify congestion as LOW, MEDIUM, or HIGH."* |
| **4. Adaptive Control** | Point to **4-Way Intersection Visualizer** | *"Our Python adaptive signal controller uses density-weighted allocation. Congested approaches dynamically receive up to 60 seconds of green time, while clear approaches receive the minimum 15 seconds. Notice the conflict lock: conflicting greens are mathematically impossible, and transitions always enforce 3s Yellow and 2s All-Red."* |
| **5. Emergency Mode** | Click **"Prioritize Emergency"** → select **North Ambulance** → click **"Lock Green Corridor"** | *"Watch what happens during an emergency: conflicting signals immediately clear to red, and an exclusive green corridor locks for the ambulance, slashing response times."* |
| **6. Foggy Benchmark** | Click **"Run Foggy Test"** | *"We tested YOLO11n under adverse weather using Koschmieder's atmospheric scattering model. We report honest empirical results: contrast attenuation causes a 25% drop in confidence for small vehicles, highlighting the need for multi-sensor redundancy in real cities."* |
| **7. Benchmark Proof** | Point to bottom **Controller Benchmarking** charts | *"Comparing our adaptive controller against the fixed-time baseline reveals a **49.1% reduction in average delay** and a **36.3% increase in hourly throughput**."* |

---

## 4. Team Member Role Distribution (For 3–4 Members)

- **Member 1 (Presenter / System Lead):** Introduces the problem, guides the judges through the live UI, and controls the demo clicks.
- **Member 2 (Computer Vision Lead):** Explains YOLO11n, ByteTrack ID tracking, and the Foggy Weather atmospheric scattering evaluation.
- **Member 3 (Traffic Control & Simulation Lead):** Explains the SUMO TraCI integration, the 4-way intersection geometry, and the rule-based adaptive controller.
- **Member 4 (Full-Stack & Metrics Lead):** Explains the FastAPI WebSocket telemetry architecture and walks through the Recharts comparative delay and throughput metrics.

---

## 5. Judge Q&A Cheat Sheet (Crisp, Confident Answers)

#### Q: "Why rule-based adaptive control instead of deep Reinforcement Learning?"
> *"Great question. In 24 hours, our priority was safety and demonstrable reliability. Reinforcement learning traffic controllers frequently suffer from policy instability and can produce unsafe conflicting states without massive reward-shaping. Our rule-based controller strictly guarantees hardware fail-safe invariants (zero conflicting greens, guaranteed yellow clearance) while providing dynamic density-proportional optimization."*

#### Q: "How do you count vehicles across frames without double-counting?"
> *"We use **ByteTrack**, which pairs high- and low-confidence bounding boxes with a Kalman filter across successive frames. Each vehicle is assigned a persistent unique track ID, allowing us to measure exact unique vehicle counts and calculate velocity."*

#### Q: "Does your system work if SUMO is not installed on the client machine?"
> *"Yes. We engineered a Dual-Engine controller: it seamlessly connects to native SUMO via TraCI when present, and automatically switches to our high-fidelity Python discrete-event simulation engine with 100% API parity when running on a lightweight machine."*
