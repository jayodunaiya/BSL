import { distance3D } from "./landmarks";

import type {
  LandmarkPoint,
  TrackedHand,
  HandSide,
} from "@/types/gesture";

export function normalizeHandLandmarks(
  landmarks: LandmarkPoint[]
): LandmarkPoint[] {
  if (landmarks.length !== 21) {
    return landmarks;
  }

  // MediaPipe landmark 0 = wrist
  const wrist = landmarks[0];

  // Landmark 9 = middle finger MCP joint.
  // This gives us a useful approximation of hand size.
  const middleMcp = landmarks[9];

  let scale = distance3D(
    wrist,
    middleMcp
  );

  // Prevent division by zero.
  if (scale < 0.0001) {
    scale = 1;
  }

  return landmarks.map(
    (landmark) => ({
      x:
        (landmark.x - wrist.x) /
        scale,

      y:
        (landmark.y - wrist.y) /
        scale,

      z:
        (landmark.z - wrist.z) /
        scale,
    })
  );
}

export function createTrackedHand(
  landmarks: LandmarkPoint[],
  handedness: HandSide,
  score: number
): TrackedHand {
  return {
    handedness,
    score,

    rawLandmarks: landmarks,

    normalizedLandmarks:
      normalizeHandLandmarks(
        landmarks
      ),
  };
}