export type HandSide = "Left" | "Right" | "Unknown";

export type LandmarkPoint = {
  x: number;
  y: number;
  z: number;
};

export type TrackedHand = {
  handedness: HandSide;
  score: number;

  // Original MediaPipe coordinates.
  rawLandmarks: LandmarkPoint[];

  // Coordinates centred around the wrist and scaled
  // relative to the size of the hand.
  normalizedLandmarks: LandmarkPoint[];
};

export type HandFrame = {
  hands: TrackedHand[];
  timestamp: number;
};

export type GesturePrediction = {
  label: string | null;
  confidence: number;
};