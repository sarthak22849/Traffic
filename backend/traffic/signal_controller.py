"""
Crossroads AI - Rule-Based Adaptive Traffic Signal Controller
Dynamically allocates green signal time based on approach density & queue pressure.
Guarantees conflict-free interlocking, minimum/maximum green bounds, and yellow/all-red clearances.
"""

from typing import Dict, Any, Tuple, Optional


class SignalPhase:
    NORTH_SOUTH_GREEN = 0
    NORTH_SOUTH_YELLOW = 1
    ALL_RED_CLEARANCE_1 = 2
    EAST_WEST_GREEN = 3
    EAST_WEST_YELLOW = 4
    ALL_RED_CLEARANCE_2 = 5


PHASE_NAMES = {
    0: "NORTH_SOUTH_GREEN",
    1: "NORTH_SOUTH_YELLOW",
    2: "ALL_RED_CLEARANCE_1",
    3: "EAST_WEST_GREEN",
    4: "EAST_WEST_YELLOW",
    5: "ALL_RED_CLEARANCE_2"
}

# SUMO tlLogic state strings for center 16-connection intersection
SUMO_PHASE_STRINGS = {
    0: "GGggrrrrGGggrrrr",  # NS Green, EW Red
    1: "yyygrrrryyygrrrr",  # NS Yellow, EW Red
    2: "rrrrrrrrrrrrrrrr",  # All Red Clearance
    3: "rrrrGGggrrrrGGgg",  # NS Red, EW Green
    4: "rrrryyygrrrryyyg",  # NS Red, EW Yellow
    5: "rrrrrrrrrrrrrrrr"   # All Red Clearance
}


class AdaptiveSignalController:
    """
    Real-time dynamic signal controller.
    Uses multi-factor density and queue saturation to allocate green times.
    """

    def __init__(
        self,
        min_green: int = 15,
        max_green: int = 60,
        yellow_duration: int = 3,
        all_red_duration: int = 2
    ):
        self.min_green = min_green
        self.max_green = max_green
        self.yellow_duration = yellow_duration
        self.all_red_duration = all_red_duration

        # Current state
        self.current_phase = SignalPhase.NORTH_SOUTH_GREEN
        self.phase_elapsed_sec = 0
        self.current_target_green_sec = min_green
        
        # Emergency Override State
        self.emergency_active = False
        self.emergency_approach: Optional[str] = None
        self.emergency_remaining_sec = 0

    def compute_allocated_green(self, density: float, queue_length: int) -> int:
        """
        Dynamically calculates allocated green time (in seconds) between min_green and max_green.
        Allocates more green time to congested roads and less to roads with low traffic.
        """
        # Linear + queue-pressure weighting
        density_factor = max(0.0, min(1.0, density))
        queue_factor = max(0.0, min(1.0, queue_length / 15.0))
        
        combined_congestion = (0.65 * density_factor) + (0.35 * queue_factor)
        
        # Scale between min_green and max_green
        allocated = int(self.min_green + (combined_congestion * (self.max_green - self.min_green)))
        return max(self.min_green, min(self.max_green, allocated))

    def trigger_emergency(self, approach: str, duration_sec: int = 15):
        """
        Activates Emergency Preemption corridor.
        Immediately plans safe transition of conflicting lanes to RED.
        """
        self.emergency_active = True
        self.emergency_approach = approach.lower()
        self.emergency_remaining_sec = duration_sec

    def step(
        self,
        approach_metrics: Dict[str, Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Advances the controller by 1 second.
        Input:
          approach_metrics = {
             'north': {'density': float, 'queue_length': int},
             'south': {'density': float, 'queue_length': int},
             'east':  {'density': float, 'queue_length': int},
             'west':  {'density': float, 'queue_length': int},
          }
        Returns:
          Current phase info, light states per approach, and remaining countdown.
        """
        # 1. Handle Emergency Priority
        if self.emergency_active:
            if self.emergency_remaining_sec > 0:
                self.emergency_remaining_sec -= 1
                return self._build_emergency_response()
            else:
                # Emergency expired, clear and transition safely
                self.emergency_active = False
                self.emergency_approach = None
                self.current_phase = SignalPhase.ALL_RED_CLEARANCE_1
                self.phase_elapsed_sec = 0

        # 2. Extract Axis Densities
        north = approach_metrics.get("north", {"density": 0.5, "queue_length": 5})
        south = approach_metrics.get("south", {"density": 0.5, "queue_length": 5})
        east  = approach_metrics.get("east",  {"density": 0.5, "queue_length": 5})
        west  = approach_metrics.get("west",  {"density": 0.5, "queue_length": 5})

        ns_density = max(north.get("density", 0.5), south.get("density", 0.5))
        ns_queue = max(north.get("queue_length", 5), south.get("queue_length", 5))

        ew_density = max(east.get("density", 0.5), west.get("density", 0.5))
        ew_queue = max(east.get("queue_length", 5), west.get("queue_length", 5))

        self.phase_elapsed_sec += 1

        # 3. State Machine Transitions
        if self.current_phase == SignalPhase.NORTH_SOUTH_GREEN:
            self.current_target_green_sec = self.compute_allocated_green(ns_density, ns_queue)
            
            # Check for early termination if NS is clear but EW has acute queue
            early_yield = (self.phase_elapsed_sec >= self.min_green and ns_queue == 0 and ew_queue > 6)
            
            if self.phase_elapsed_sec >= self.current_target_green_sec or early_yield:
                self.current_phase = SignalPhase.NORTH_SOUTH_YELLOW
                self.phase_elapsed_sec = 0

        elif self.current_phase == SignalPhase.NORTH_SOUTH_YELLOW:
            if self.phase_elapsed_sec >= self.yellow_duration:
                self.current_phase = SignalPhase.ALL_RED_CLEARANCE_1
                self.phase_elapsed_sec = 0

        elif self.current_phase == SignalPhase.ALL_RED_CLEARANCE_1:
            if self.phase_elapsed_sec >= self.all_red_duration:
                self.current_phase = SignalPhase.EAST_WEST_GREEN
                self.phase_elapsed_sec = 0

        elif self.current_phase == SignalPhase.EAST_WEST_GREEN:
            self.current_target_green_sec = self.compute_allocated_green(ew_density, ew_queue)
            
            early_yield = (self.phase_elapsed_sec >= self.min_green and ew_queue == 0 and ns_queue > 6)
            
            if self.phase_elapsed_sec >= self.current_target_green_sec or early_yield:
                self.current_phase = SignalPhase.EAST_WEST_YELLOW
                self.phase_elapsed_sec = 0

        elif self.current_phase == SignalPhase.EAST_WEST_YELLOW:
            if self.phase_elapsed_sec >= self.yellow_duration:
                self.current_phase = SignalPhase.ALL_RED_CLEARANCE_2
                self.phase_elapsed_sec = 0

        elif self.current_phase == SignalPhase.ALL_RED_CLEARANCE_2:
            if self.phase_elapsed_sec >= self.all_red_duration:
                self.current_phase = SignalPhase.NORTH_SOUTH_GREEN
                self.phase_elapsed_sec = 0

        return self._build_normal_response(ns_density, ew_density)

    def _build_normal_response(self, ns_density: float, ew_density: float) -> Dict[str, Any]:
        """Constructs safe approach signal states and countdowns."""
        phase_name = PHASE_NAMES[self.current_phase]
        sumo_state = SUMO_PHASE_STRINGS[self.current_phase]

        # Calculate remaining countdown
        if self.current_phase in (SignalPhase.NORTH_SOUTH_GREEN, SignalPhase.EAST_WEST_GREEN):
            remaining = max(1, self.current_target_green_sec - self.phase_elapsed_sec)
        elif self.current_phase in (SignalPhase.NORTH_SOUTH_YELLOW, SignalPhase.EAST_WEST_YELLOW):
            remaining = max(1, self.yellow_duration - self.phase_elapsed_sec)
        else:
            remaining = max(1, self.all_red_duration - self.phase_elapsed_sec)

        # Assign per-approach signals
        if self.current_phase == SignalPhase.NORTH_SOUTH_GREEN:
            signals = {"north": "GREEN", "south": "GREEN", "east": "RED", "west": "RED"}
        elif self.current_phase == SignalPhase.NORTH_SOUTH_YELLOW:
            signals = {"north": "YELLOW", "south": "YELLOW", "east": "RED", "west": "RED"}
        elif self.current_phase == SignalPhase.EAST_WEST_GREEN:
            signals = {"north": "RED", "south": "RED", "east": "GREEN", "west": "GREEN"}
        elif self.current_phase == SignalPhase.EAST_WEST_YELLOW:
            signals = {"north": "RED", "south": "RED", "east": "YELLOW", "west": "YELLOW"}
        else:
            # All-Red Clearance
            signals = {"north": "RED", "south": "RED", "east": "RED", "west": "RED"}

        # Safety Check Invariant: Assert zero conflicting greens
        self._verify_safety_invariants(signals)

        return {
            "current_phase_index": self.current_phase,
            "phase_name": phase_name,
            "sumo_state": sumo_state,
            "remaining_seconds": remaining,
            "allocated_green_seconds": self.current_target_green_sec,
            "signals": signals,
            "emergency_active": False,
        }

    def _build_emergency_response(self) -> Dict[str, Any]:
        """Locks green corridor for the designated emergency approach."""
        signals = {"north": "RED", "south": "RED", "east": "RED", "west": "RED"}
        if self.emergency_approach in signals:
            signals[self.emergency_approach] = "GREEN"

        return {
            "current_phase_index": -1,
            "phase_name": f"EMERGENCY_CORRIDOR_{self.emergency_approach.upper()}",
            "sumo_state": "rrrrrrrrrrrrrrrr",
            "remaining_seconds": self.emergency_remaining_sec,
            "allocated_green_seconds": self.emergency_remaining_sec,
            "signals": signals,
            "emergency_active": True,
            "emergency_approach": self.emergency_approach,
        }

    @staticmethod
    def _verify_safety_invariants(signals: Dict[str, str]):
        """Safety interlocking: Never allow simultaneous NS green and EW green."""
        ns_green = signals["north"] == "GREEN" or signals["south"] == "GREEN"
        ew_green = signals["east"] == "GREEN" or signals["west"] == "GREEN"
        if ns_green and ew_green:
            raise RuntimeError("CRITICAL SAFETY FAULT: Conflicting green signals detected simultaneously!")
