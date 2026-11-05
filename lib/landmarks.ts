import type { LandmarkPoint } from "@/types/gesture";

export function distance3D(
  a: LandmarkPoint,
  b: LandmarkPoint
) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;

  return Math.sqrt(
    dx * dx +
      dy * dy +
      dz * dz
  );
}

export function distance2D(
  a: LandmarkPoint,
  b: LandmarkPoint
) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;

  return Math.sqrt(
    dx * dx +
      dy * dy
  );
}

export function averagePoint(
  points: LandmarkPoint[]
): LandmarkPoint {
  if (points.length === 0) {
    return {
      x: 0,
      y: 0,
      z: 0,
    };
  }

  const total = points.reduce(
    (acc, point) => {
      acc.x += point.x;
      acc.y += point.y;
      acc.z += point.z;

      return acc;
    },
    {
      x: 0,
      y: 0,
      z: 0,
    }
  );

  return {
    x: total.x / points.length,
    y: total.y / points.length,
    z: total.z / points.length,
  };
}

export function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.min(
    Math.max(value, min),
    max
  );
}