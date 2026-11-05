import type {
  GesturePrediction,
  HandFrame,
  LandmarkPoint,
  TrackedHand,
} from "@/types/gesture";

import {
  crossHandDistance,
  isOpenSupportHand,
  isPointerHand,
} from "@/lib/gestureRecognizer";

const WRIST = 0;
const THUMB_TIP = 4;
const INDEX_TIP = 8;
const MIDDLE_MCP = 9;
const MIDDLE_TIP = 12;

type Point = {
  x: number;
  y: number;
};

type Sample = {
  point: Point;
  time: number;
};

export type MotionResult = {
  prediction: GesturePrediction | null;
  motionInProgress: boolean;
};

function palmCenter(
  hand: TrackedHand
): LandmarkPoint {
  const ids = [
    0,
    5,
    9,
    13,
    17,
  ];

  const total = ids.reduce(
    (sum, id) => ({
      x:
        sum.x +
        hand.rawLandmarks[id].x,

      y:
        sum.y +
        hand.rawLandmarks[id].y,

      z:
        sum.z +
        hand.rawLandmarks[id].z,
    }),
    {
      x: 0,
      y: 0,
      z: 0,
    }
  );

  return {
    x: total.x / ids.length,
    y: total.y / ids.length,
    z: total.z / ids.length,
  };
}

function toSupportSpace(
  point: LandmarkPoint,
  support: TrackedHand
): Point {
  const wrist =
    support.rawLandmarks[
      WRIST
    ];

  const middleMcp =
    support.rawLandmarks[
      MIDDLE_MCP
    ];

  const axisX =
    middleMcp.x - wrist.x;

  const axisY =
    middleMcp.y - wrist.y;

  const scale = Math.max(
    Math.hypot(
      axisX,
      axisY
    ),
    0.001
  );

  const forwardX =
    axisX / scale;

  const forwardY =
    axisY / scale;

  const sideX =
    -forwardY;

  const sideY =
    forwardX;

  const dx =
    point.x - wrist.x;

  const dy =
    point.y - wrist.y;

  return {
    x:
      (dx * sideX +
        dy * sideY) /
      scale,

    y:
      (dx * forwardX +
        dy * forwardY) /
      scale,
  };
}

function pathLength(
  samples: Sample[]
) {
  let distance = 0;

  for (
    let i = 1;
    i < samples.length;
    i++
  ) {
    distance += Math.hypot(
      samples[i].point.x -
        samples[i - 1].point.x,

      samples[i].point.y -
        samples[i - 1].point.y
    );
  }

  return distance;
}

export class MotionGestureRecognizer {
  private jSamples:
    Sample[] = [];

  private hSamples:
    [
      Sample[],
      Sample[],
    ] = [[], []];

  private cooldownUntil = 0;

  update(
    frame: HandFrame
  ): MotionResult {
    if (
      frame.timestamp <
      this.cooldownUntil
    ) {
      return {
        prediction: null,
        motionInProgress: false,
      };
    }

    const jPrediction =
      this.detectJ(frame);

    if (jPrediction) {
      this.finish(
        frame.timestamp
      );

      return {
        prediction:
          jPrediction,

        motionInProgress:
          false,
      };
    }

    const hPrediction =
      this.detectH(frame);

    if (hPrediction) {
      this.finish(
        frame.timestamp
      );

      return {
        prediction:
          hPrediction,

        motionInProgress:
          false,
      };
    }

    /*
     * Important:
     *
     * Simply touching the middle finger
     * is I.
     *
     * We only block I when the index
     * finger has actually begun moving,
     * indicating that J may be underway.
     */

    const jMoving =
      this.jSamples.length >
        1 &&
      pathLength(
        this.jSamples
      ) > 0.18;

    return {
      prediction: null,
      motionInProgress:
        jMoving,
    };
  }

  reset() {
    this.jSamples = [];

    this.hSamples = [
      [],
      [],
    ];

    this.cooldownUntil = 0;
  }

  private finish(
    now: number
  ) {
    this.jSamples = [];

    this.hSamples = [
      [],
      [],
    ];

    /*
     * Stop one movement from
     * registering several times.
     */
    this.cooldownUntil =
      now + 800;
  }

  /* ======================
     J
     ====================== */

  private detectJ(
    frame: HandFrame
  ): GesturePrediction | null {
    if (
      frame.hands.length !== 2
    ) {
      this.jSamples = [];

      return null;
    }

    const combinations = [
      {
        pointer:
          frame.hands[0],

        support:
          frame.hands[1],
      },
      {
        pointer:
          frame.hands[1],

        support:
          frame.hands[0],
      },
    ];

    const combination =
      combinations.find(
        ({
          pointer,
          support,
        }) =>
          isPointerHand(
            pointer
          ) &&
          isOpenSupportHand(
            support
          )
      );

    if (!combination) {
      this.jSamples = [];

      return null;
    }

    const {
      pointer,
      support,
    } = combination;

    /*
     * J starts around the
     * middle fingertip.
     */

    const middleDistance =
      crossHandDistance(
        pointer,
        INDEX_TIP,
        support,
        MIDDLE_TIP
      );

    /*
     * J finishes toward
     * the thumb side.
     */

    const thumbDistance =
      crossHandDistance(
        pointer,
        INDEX_TIP,
        support,
        THUMB_TIP
      );

    const point =
      toSupportSpace(
        pointer.rawLandmarks[
          INDEX_TIP
        ],
        support
      );

    if (
      this.jSamples
        .length === 0
    ) {
      if (
        middleDistance <
        0.72
      ) {
        this.jSamples.push({
          point,
          time:
            frame.timestamp,
        });
      }

      return null;
    }

    this.jSamples.push({
      point,
      time:
        frame.timestamp,
    });

    const duration =
      frame.timestamp -
      this.jSamples[0].time;

    if (
      duration > 1400
    ) {
      this.jSamples = [];

      return null;
    }

    const travelled =
      pathLength(
        this.jSamples
      );

    if (
      duration >= 180 &&
      travelled > 0.85 &&
      thumbDistance < 0.82
    ) {
      return {
        label: "J",

        confidence:
          Math.min(
            0.97,
            0.78 +
              travelled *
                0.08
          ),
      };
    }

    return null;
  }

  /* ======================
     H
     ====================== */

  private detectH(
    frame: HandFrame
  ): GesturePrediction | null {
    if (
      frame.hands.length !==
        2 ||
      !isOpenSupportHand(
        frame.hands[0]
      ) ||
      !isOpenSupportHand(
        frame.hands[1]
      )
    ) {
      this.hSamples = [
        [],
        [],
      ];

      return null;
    }

    const combinations = [
      {
        active:
          frame.hands[0],

        support:
          frame.hands[1],
      },
      {
        active:
          frame.hands[1],

        support:
          frame.hands[0],
      },
    ];

    for (
      let i = 0;
      i <
      combinations.length;
      i++
    ) {
      const {
        active,
        support,
      } =
        combinations[i];

      const point =
        toSupportSpace(
          palmCenter(active),
          support
        );

      const samples =
        this.hSamples[i];

      /*
       * H begins around the
       * lower / middle palm.
       */

      if (
        samples.length === 0
      ) {
        if (
          Math.abs(
            point.x
          ) < 1.15 &&
          point.y > -0.25 &&
          point.y < 1
        ) {
          samples.push({
            point,
            time:
              frame.timestamp,
          });
        }

        continue;
      }

      samples.push({
        point,
        time:
          frame.timestamp,
      });

      const first =
        samples[0];

      const duration =
        frame.timestamp -
        first.time;

      if (
        duration > 1400
      ) {
        this.hSamples[i] =
          [];

        continue;
      }

      /*
       * Movement along the palm
       * toward the fingertips.
       */

      const forwardTravel =
        point.y -
        first.point.y;

      const sidewaysTravel =
        Math.abs(
          point.x -
            first.point.x
        );

      if (
        duration >= 180 &&
        forwardTravel > 0.9 &&
        sidewaysTravel < 0.9 &&
        pathLength(samples) >
          0.95
      ) {
        return {
          label: "H",

          confidence:
            Math.min(
              0.96,
              0.8 +
                forwardTravel *
                  0.08
            ),
        };
      }
    }

    return null;
  }
}