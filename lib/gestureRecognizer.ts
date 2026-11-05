import { distance2D } from "@/lib/landmarks";

import type {
  GesturePrediction,
  HandFrame,
  LandmarkPoint,
  TrackedHand,
} from "@/types/gesture";

const WRIST = 0;

const THUMB_TIP = 4;

const INDEX_MCP = 5;
const INDEX_PIP = 6;
const INDEX_TIP = 8;
const INDEX_DIP = 7;

const MIDDLE_MCP = 9;
const MIDDLE_PIP = 10;
const MIDDLE_TIP = 12;

const RING_PIP = 14;
const RING_TIP = 16;

const PINKY_PIP = 18;
const PINKY_TIP = 20;

function handScale(
  landmarks: LandmarkPoint[]
) {
  return Math.max(
    distance2D(
      landmarks[WRIST],
      landmarks[MIDDLE_MCP]
    ),
    0.001
  );
}

function relativeDistance(
  hand: TrackedHand,
  pointA: number,
  pointB: number
) {
  const landmarks =
    hand.rawLandmarks;

  return (
    distance2D(
      landmarks[pointA],
      landmarks[pointB]
    ) / handScale(landmarks)
  );
}

export function crossHandDistance(
  handA: TrackedHand,
  pointA: number,
  handB: TrackedHand,
  pointB: number
) {
  const scaleA = handScale(
    handA.rawLandmarks
  );

  const scaleB = handScale(
    handB.rawLandmarks
  );

  const averageScale =
    (scaleA + scaleB) / 2;

  return (
    distance2D(
      handA.rawLandmarks[
        pointA
      ],
      handB.rawLandmarks[
        pointB
      ]
    ) / averageScale
  );
}

function fingerExtended(
  landmarks: LandmarkPoint[],
  tip: number,
  pip: number
) {
  const wrist =
    landmarks[WRIST];

  const tipDistance =
    distance2D(
      landmarks[tip],
      wrist
    );

  const pipDistance =
    distance2D(
      landmarks[pip],
      wrist
    );

  return (
    tipDistance >
    pipDistance * 1.08
  );
}

function isCircleHand(
  hand: TrackedHand
) {
  const landmarks = hand.rawLandmarks;

  const thumbIndexDistance =
    relativeDistance(
      hand,
      THUMB_TIP,
      INDEX_TIP
    );

  return (
    thumbIndexDistance < 0.6 &&
    fingerFolded(
      landmarks,
      MIDDLE_TIP,
      MIDDLE_PIP
    ) &&
    fingerFolded(
      landmarks,
      RING_TIP,
      RING_PIP
    ) &&
    fingerFolded(
      landmarks,
      PINKY_TIP,
      PINKY_PIP
    )
  );
}

function isPinkyHand(
  hand: TrackedHand
) {
  const landmarks = hand.rawLandmarks;

  return (
    fingerFolded(
      landmarks,
      INDEX_TIP,
      INDEX_PIP
    ) &&
    fingerFolded(
      landmarks,
      MIDDLE_TIP,
      MIDDLE_PIP
    ) &&
    fingerFolded(
      landmarks,
      RING_TIP,
      RING_PIP
    ) &&
    fingerExtended(
      landmarks,
      PINKY_TIP,
      PINKY_PIP
    )
  );
}

function fingerFolded(
  landmarks: LandmarkPoint[],
  tip: number,
  pip: number
) {
  return !fingerExtended(
    landmarks,
    tip,
    pip
  );
}

export function isPointerHand(
  hand: TrackedHand
) {
  const landmarks =
    hand.rawLandmarks;

  const indexExtended =
    fingerExtended(
      landmarks,
      INDEX_TIP,
      INDEX_PIP
    );

  const middleFolded =
    fingerFolded(
      landmarks,
      MIDDLE_TIP,
      MIDDLE_PIP
    );

  const ringFolded =
    fingerFolded(
      landmarks,
      RING_TIP,
      RING_PIP
    );

  const pinkyFolded =
    fingerFolded(
      landmarks,
      PINKY_TIP,
      PINKY_PIP
    );

  return (
    indexExtended &&
    middleFolded &&
    ringFolded &&
    pinkyFolded
  );
}

export function isOpenSupportHand(
  hand: TrackedHand
) {
  const landmarks =
    hand.rawLandmarks;

  return (
    fingerExtended(
      landmarks,
      INDEX_TIP,
      INDEX_PIP
    ) &&
    fingerExtended(
      landmarks,
      MIDDLE_TIP,
      MIDDLE_PIP
    ) &&
    fingerExtended(
      landmarks,
      RING_TIP,
      RING_PIP
    ) &&
    fingerExtended(
      landmarks,
      PINKY_TIP,
      PINKY_PIP
    )
  );
}

function isTwoFingerHand(
  hand: TrackedHand
) {
  const landmarks = hand.rawLandmarks;

  return (
    fingerExtended(
      landmarks,
      INDEX_TIP,
      INDEX_PIP
    ) &&
    fingerExtended(
      landmarks,
      MIDDLE_TIP,
      MIDDLE_PIP
    ) &&
    fingerFolded(
      landmarks,
      RING_TIP,
      RING_PIP
    ) &&
    fingerFolded(
      landmarks,
      PINKY_TIP,
      PINKY_PIP
    )
  );
}

function isFist(
  hand: TrackedHand
) {
  const landmarks = hand.rawLandmarks;

  return (
    fingerFolded(
      landmarks,
      INDEX_TIP,
      INDEX_PIP
    ) &&
    fingerFolded(
      landmarks,
      MIDDLE_TIP,
      MIDDLE_PIP
    ) &&
    fingerFolded(
      landmarks,
      RING_TIP,
      RING_PIP
    ) &&
    fingerFolded(
      landmarks,
      PINKY_TIP,
      PINKY_PIP
    )
  );
}

function isVHand(
  hand: TrackedHand
) {
  const landmarks = hand.rawLandmarks;

  return (
    fingerExtended(
      landmarks,
      INDEX_TIP,
      INDEX_PIP
    ) &&
    fingerExtended(
      landmarks,
      MIDDLE_TIP,
      MIDDLE_PIP
    ) &&
    fingerFolded(
      landmarks,
      RING_TIP,
      RING_PIP
    ) &&
    fingerFolded(
      landmarks,
      PINKY_TIP,
      PINKY_PIP
    )
  );
}

function isThumbIndexOpenHand(
  hand: TrackedHand
) {
  const landmarks = hand.rawLandmarks;

  const indexOpen =
    fingerExtended(
      landmarks,
      INDEX_TIP,
      INDEX_PIP
    );

  const middleFolded =
    fingerFolded(
      landmarks,
      MIDDLE_TIP,
      MIDDLE_PIP
    );

  const ringFolded =
    fingerFolded(
      landmarks,
      RING_TIP,
      RING_PIP
    );

  const pinkyFolded =
    fingerFolded(
      landmarks,
      PINKY_TIP,
      PINKY_PIP
    );

  const thumbIndexGap =
    relativeDistance(
      hand,
      THUMB_TIP,
      INDEX_TIP
    );

  return (
    indexOpen &&
    middleFolded &&
    ringFolded &&
    pinkyFolded &&
    thumbIndexGap > 0.9
  );
}

function isFlatHand(
  hand: TrackedHand
) {
  return isOpenSupportHand(hand);
}

function confidenceFromDistance(
  distance: number,
  maximum: number
) {
  const value =
    1 - distance / maximum;

  return Math.max(
    0,
    Math.min(
      0.99,
      0.7 + value * 0.29
    )
  );
}

function recognizeVowel(
  hands: TrackedHand[]
): GesturePrediction | null {
  if (hands.length !== 2) {
    return null;
  }

  const combinations = [
    {
      pointer: hands[0],
      support: hands[1],
    },
    {
      pointer: hands[1],
      support: hands[0],
    },
  ];

  for (const {
    pointer,
    support,
  } of combinations) {
    if (
      !isPointerHand(pointer) ||
      !isOpenSupportHand(support)
    ) {
      continue;
    }

    const targets = [
      {
        label: "A",
        landmark: THUMB_TIP,
        maxDistance: 0.7,
      },
      {
        label: "E",
        landmark: INDEX_TIP,
        maxDistance: 0.7,
      },
      {
        label: "I",
        landmark: MIDDLE_TIP,
        maxDistance: 0.72,
      },
      {
        label: "O",
        landmark: RING_TIP,
        maxDistance: 0.82,
      },
      {
        label: "U",
        landmark: PINKY_TIP,
        maxDistance: 0.88,
      },
    ];

    const distances = targets.map(
      (target) => ({
        ...target,

        distance:
          crossHandDistance(
            pointer,
            INDEX_TIP,
            support,
            target.landmark
          ),
      })
    );

    distances.sort(
      (a, b) =>
        a.distance - b.distance
    );

    const closest =
      distances[0];

    const secondClosest =
      distances[1];

    if (
      closest.distance >
      closest.maxDistance
    ) {
      continue;
    }

    const separation =
      secondClosest.distance -
      closest.distance;

    /*
     * Ring and little fingers naturally
     * sit closer together, so O and U
     * need less separation.
     */
    const requiredSeparation =
      closest.label === "O" ||
      closest.label === "U"
        ? 0.04
        : 0.1;

    if (
      separation <
      requiredSeparation
    ) {
      continue;
    }

    return {
      label: closest.label,

      confidence:
        confidenceFromDistance(
          closest.distance,
          closest.maxDistance
        ),
    };
  }

  return null;
}

/* ---------------- V ---------------- */

function recognizeV(
  hands: TrackedHand[]
): GesturePrediction | null {
  if (hands.length !== 2) {
    return null;
  }

  const combinations = [
    {
      active: hands[0],
      support: hands[1],
    },
    {
      active: hands[1],
      support: hands[0],
    },
  ];

  for (const {
    active,
    support,
  } of combinations) {
    if (
      !isVHand(active) ||
      !isOpenSupportHand(support)
    ) {
      continue;
    }

    const indexDistance =
      distanceToPalm(
        active,
        INDEX_TIP,
        support
      );

    const middleDistance =
      distanceToPalm(
        active,
        MIDDLE_TIP,
        support
      );

    const average =
      (
        indexDistance +
        middleDistance
      ) / 2;

    if (average < 0.95) {
      return {
        label: "V",
        confidence:
          confidenceFromDistance(
            average,
            0.95
          ),
      };
    }
  }

  return null;
}

/* ---------------- W ---------------- */

function recognizeW(
  hands: TrackedHand[]
): GesturePrediction | null {
  if (hands.length !== 2) {
    return null;
  }

  if (
    !isOpenSupportHand(hands[0]) ||
    !isOpenSupportHand(hands[1])
  ) {
    return null;
  }

  const indexDistance =
    crossHandDistance(
      hands[0],
      INDEX_TIP,
      hands[1],
      INDEX_TIP
    );

  const middleDistance =
    crossHandDistance(
      hands[0],
      MIDDLE_TIP,
      hands[1],
      MIDDLE_TIP
    );

  const ringDistance =
    crossHandDistance(
      hands[0],
      RING_TIP,
      hands[1],
      RING_TIP
    );

  const pinkyDistance =
    crossHandDistance(
      hands[0],
      PINKY_TIP,
      hands[1],
      PINKY_TIP
    );

  const average =
    (
      indexDistance +
      middleDistance +
      ringDistance +
      pinkyDistance
    ) / 4;

  const wristDistance =
    crossHandDistance(
      hands[0],
      WRIST,
      hands[1],
      WRIST
    );

  if (
    average < 1.25 &&
    wristDistance < 2.3
  ) {
    return {
      label: "W",
      confidence:
        confidenceFromDistance(
          average,
          1.25
        ),
    };
  }

  return null;
}

/* ---------------- X ---------------- */

function recognizeX(
  hands: TrackedHand[]
): GesturePrediction | null {
  if (hands.length !== 2) {
    return null;
  }

  if (
    !isPointerHand(hands[0]) ||
    !isPointerHand(hands[1])
  ) {
    return null;
  }

  const tipToTip =
    crossHandDistance(
      hands[0],
      INDEX_TIP,
      hands[1],
      INDEX_TIP
    );

  const firstTipToSecondPip =
    crossHandDistance(
      hands[0],
      INDEX_TIP,
      hands[1],
      INDEX_PIP
    );

  const secondTipToFirstPip =
    crossHandDistance(
      hands[1],
      INDEX_TIP,
      hands[0],
      INDEX_PIP
    );

  const crossingDistance =
    Math.min(
      tipToTip,
      firstTipToSecondPip,
      secondTipToFirstPip
    );

  if (crossingDistance < 0.7) {
    return {
      label: "X",
      confidence:
        confidenceFromDistance(
          crossingDistance,
          0.7
        ),
    };
  }

  return null;
}

/* ---------------- Y ---------------- */

function recognizeY(
  hands: TrackedHand[]
): GesturePrediction | null {
  if (hands.length !== 2) {
    return null;
  }

  const combinations = [
    {
      pointer: hands[0],
      support: hands[1],
    },
    {
      pointer: hands[1],
      support: hands[0],
    },
  ];

  for (const {
    pointer,
    support,
  } of combinations) {
    if (
      !isPointerHand(pointer) ||
      !isThumbIndexOpenHand(
        support
      )
    ) {
      continue;
    }

    const pointerTip =
      pointer.rawLandmarks[
        INDEX_TIP
      ];

    const thumb =
      support.rawLandmarks[
        THUMB_TIP
      ];

    const index =
      support.rawLandmarks[
        INDEX_TIP
      ];

    const thumbDistance =
      crossHandDistance(
        pointer,
        INDEX_TIP,
        support,
        THUMB_TIP
      );

    const indexDistance =
      crossHandDistance(
        pointer,
        INDEX_TIP,
        support,
        INDEX_TIP
      );

    /*
     * Pointer should sit reasonably
     * close to both sides of the
     * thumb/index opening.
     */
    if (
      thumbDistance < 1.15 &&
      indexDistance < 1.15
    ) {
      const average =
        (
          thumbDistance +
          indexDistance
        ) / 2;

      return {
        label: "Y",
        confidence:
          confidenceFromDistance(
            average,
            1.15
          ),
      };
    }
  }

  return null;
}

/* ---------------- Z ---------------- */

function recognizeZ(
  hands: TrackedHand[]
): GesturePrediction | null {
  if (hands.length !== 2) {
    return null;
  }

  const combinations = [
    {
      active: hands[0],
      support: hands[1],
    },
    {
      active: hands[1],
      support: hands[0],
    },
  ];

  for (const {
    active,
    support,
  } of combinations) {
    if (
      !isFlatHand(active) ||
      !isOpenSupportHand(
        support
      )
    ) {
      continue;
    }

    const activeCenter =
      palmCenter(active);

    const supportCenter =
      palmCenter(support);

    const averageScale =
      (
        handScale(
          active.rawLandmarks
        ) +
        handScale(
          support.rawLandmarks
        )
      ) / 2;

    const centerDistance =
      distance2D(
        activeCenter,
        supportCenter
      ) / averageScale;

    /*
     * The two palms should overlap
     * around the centre region.
     */
    if (centerDistance < 0.85) {
      return {
        label: "Z",
        confidence:
          confidenceFromDistance(
            centerDistance,
            0.85
          ),
      };
    }
  }

  return null;
}

/* ---------------- P ---------------- */

function recognizeP(
  hands: TrackedHand[]
): GesturePrediction | null {
  if (hands.length !== 2) {
    return null;
  }

  const combinations = [
    {
      circle: hands[0],
      support: hands[1],
    },
    {
      circle: hands[1],
      support: hands[0],
    },
  ];

  for (const {
    circle,
    support,
  } of combinations) {
    if (
      !isCircleHand(circle) ||
      !isPointerHand(support)
    ) {
      continue;
    }

    const indexDistance =
      crossHandDistance(
        circle,
        INDEX_TIP,
        support,
        INDEX_TIP
      );

    const thumbDistance =
      crossHandDistance(
        circle,
        THUMB_TIP,
        support,
        INDEX_TIP
      );

    const distance = Math.min(
      indexDistance,
      thumbDistance
    );

    if (distance < 0.75) {
      return {
        label: "P",
        confidence:
          confidenceFromDistance(
            distance,
            0.75
          ),
      };
    }
  }

  return null;
}

/* ---------------- Q ---------------- */

function recognizeQ(
  hands: TrackedHand[]
): GesturePrediction | null {
  if (hands.length !== 2) {
    return null;
  }

  const combinations = [
    {
      hook: hands[0],
      circle: hands[1],
    },
    {
      hook: hands[1],
      circle: hands[0],
    },
  ];

  for (const {
    hook,
    circle,
  } of combinations) {
    if (
      !isBentIndexHand(hook) ||
      !isCircleHand(circle)
    ) {
      continue;
    }

    const distance =
      crossHandDistance(
        hook,
        INDEX_TIP,
        circle,
        THUMB_TIP
      );

    if (distance < 0.8) {
      return {
        label: "Q",
        confidence:
          confidenceFromDistance(
            distance,
            0.8
          ),
      };
    }
  }

  return null;
}


/* ---------------- R ---------------- */

function recognizeR(
  hands: TrackedHand[]
): GesturePrediction | null {
  if (hands.length !== 2) {
    return null;
  }

  const combinations = [
    {
      active: hands[0],
      support: hands[1],
    },
    {
      active: hands[1],
      support: hands[0],
    },
  ];

  for (const {
    active,
    support,
  } of combinations) {
    if (
      !isBentIndexHand(active) ||
      !isOpenSupportHand(support)
    ) {
      continue;
    }

    const distance =
      distanceToPalm(
        active,
        INDEX_TIP,
        support
      );

    if (distance < 0.85) {
      return {
        label: "R",
        confidence:
          confidenceFromDistance(
            distance,
            0.85
          ),
      };
    }
  }

  return null;
}

/* ---------------- S ---------------- */

function recognizeS(
  hands: TrackedHand[]
): GesturePrediction | null {
  if (hands.length !== 2) {
    return null;
  }

  const combinations = [
    {
      active: hands[0],
      support: hands[1],
    },
    {
      active: hands[1],
      support: hands[0],
    },
  ];

  for (const {
    active,
    support,
  } of combinations) {
    if (
      !isPinkyHand(active)
    ) {
      continue;
    }

    const tipDistance =
      crossHandDistance(
        active,
        PINKY_TIP,
        support,
        PINKY_TIP
      );

    const jointDistance =
      crossHandDistance(
        active,
        PINKY_PIP,
        support,
        PINKY_PIP
      );

    if (
      tipDistance < 0.9 ||
      jointDistance < 0.75
    ) {
      return {
        label: "S",
        confidence:
          confidenceFromDistance(
            Math.min(
              tipDistance,
              jointDistance
            ),
            0.9
          ),
      };
    }
  }

  return null;
}

/* ---------------- T ---------------- */

function recognizeT(
  hands: TrackedHand[]
): GesturePrediction | null {
  if (hands.length !== 2) {
    return null;
  }

  const combinations = [
    {
      pointer: hands[0],
      support: hands[1],
    },
    {
      pointer: hands[1],
      support: hands[0],
    },
  ];

  for (const {
    pointer,
    support,
  } of combinations) {
    if (
      !isPointerHand(pointer) ||
      !isOpenSupportHand(support)
    ) {
      continue;
    }

    const tipDistance =
      distanceToPalm(
        pointer,
        INDEX_TIP,
        support
      );

    const dipDistance =
      distanceToPalm(
        pointer,
        INDEX_DIP,
        support
      );

    const pipDistance =
      distanceToPalm(
        pointer,
        INDEX_PIP,
        support
      );

    /*
     * T:
     * fingertip presses palm,
     * while the rest of the index
     * stays farther away.
     */
    if (
      tipDistance < 0.62 &&
      dipDistance >
        tipDistance + 0.12 &&
      pipDistance >
        tipDistance + 0.2
    ) {
      return {
        label: "T",
        confidence:
          confidenceFromDistance(
            tipDistance,
            0.62
          ),
      };
    }
  }

  return null;
}

/* ---------------- F ---------------- */

function recognizeF(
  hands: TrackedHand[]
): GesturePrediction | null {
  if (hands.length !== 2) {
    return null;
  }

  if (
    !isTwoFingerHand(hands[0]) ||
    !isTwoFingerHand(hands[1])
  ) {
    return null;
  }

  const indexDistance =
    crossHandDistance(
      hands[0],
      INDEX_TIP,
      hands[1],
      INDEX_TIP
    );

  const middleDistance =
    crossHandDistance(
      hands[0],
      MIDDLE_TIP,
      hands[1],
      MIDDLE_TIP
    );

  if (
    indexDistance < 0.75 &&
    middleDistance < 0.75
  ) {
    const average =
      (
        indexDistance +
        middleDistance
      ) / 2;

    return {
      label: "F",
      confidence:
        confidenceFromDistance(
          average,
          0.75
        ),
    };
  }

  return null;
}

/* ---------------- G ---------------- */

function recognizeG(
  hands: TrackedHand[]
): GesturePrediction | null {
  if (hands.length !== 2) {
    return null;
  }

  if (
    !isFist(hands[0]) ||
    !isFist(hands[1])
  ) {
    return null;
  }

  const wristDistance =
    crossHandDistance(
      hands[0],
      WRIST,
      hands[1],
      WRIST
    );

  const knuckleDistance =
    crossHandDistance(
      hands[0],
      MIDDLE_MCP,
      hands[1],
      MIDDLE_MCP
    );

  if (
    wristDistance < 2.2 &&
    knuckleDistance < 1.8
  ) {
    return {
      label: "G",
      confidence: 0.84,
    };
  }

  return null;
}

/* ---------------- B ---------------- */

function recognizeB(
  hands: TrackedHand[]
): GesturePrediction | null {
  if (hands.length !== 2) {
    return null;
  }

  const first =
    relativeDistance(
      hands[0],
      THUMB_TIP,
      INDEX_TIP
    );

  const second =
    relativeDistance(
      hands[1],
      THUMB_TIP,
      INDEX_TIP
    );

  /*
   * Both hands form rounded
   * thumb/index configurations.
   */

  if (
    first < 0.75 &&
    second < 0.75
  ) {
    const average =
      (first + second) / 2;

    return {
      label: "B",
      confidence:
        confidenceFromDistance(
          average,
          0.75
        ),
    };
  }

  return null;
}

/* ---------------- C ---------------- */

function recognizeC(
  hands: TrackedHand[]
): GesturePrediction | null {
  for (const hand of hands) {
    const landmarks =
      hand.rawLandmarks;

    const thumbIndexGap =
      relativeDistance(
        hand,
        THUMB_TIP,
        INDEX_TIP
      );

    const middleFolded =
      fingerFolded(
        landmarks,
        MIDDLE_TIP,
        MIDDLE_PIP
      );

    const ringFolded =
      fingerFolded(
        landmarks,
        RING_TIP,
        RING_PIP
      );

    const pinkyFolded =
      fingerFolded(
        landmarks,
        PINKY_TIP,
        PINKY_PIP
      );

    const cShape =
      thumbIndexGap > 0.65 &&
      thumbIndexGap < 1.8;

    if (
      cShape &&
      middleFolded &&
      ringFolded &&
      pinkyFolded
    ) {
      return {
        label: "C",
        confidence: 0.82,
      };
    }
  }

  return null;
}

/* ---------------- D ---------------- */

function recognizeD(
  hands: TrackedHand[]
): GesturePrediction | null {
  if (hands.length !== 2) {
    return null;
  }

  const combinations = [
    {
      active: hands[0],
      support: hands[1],
    },
    {
      active: hands[1],
      support: hands[0],
    },
  ];

  for (const {
    active,
    support,
  } of combinations) {
    // D should not look like our pointer-hand vowel pattern.
    if (
      isPointerHand(active) &&
      isOpenSupportHand(support)
    ) {
      continue;
    }

    const indexToMiddle =
      crossHandDistance(
        active,
        INDEX_TIP,
        support,
        MIDDLE_TIP
      );

    const thumbToIndexKnuckle =
      crossHandDistance(
        active,
        THUMB_TIP,
        support,
        INDEX_MCP
      );

    const indexToSupportIndex =
      crossHandDistance(
        active,
        INDEX_TIP,
        support,
        INDEX_TIP
      );

    /*
     * Prevent D from stealing E.
     *
     * For E, the pointer index is close
     * to the support index fingertip.
     */
    if (
      indexToSupportIndex < 0.55
    ) {
      continue;
    }

    if (
      indexToMiddle < 0.55 &&
      thumbToIndexKnuckle < 0.65
    ) {
      const average =
        (
          indexToMiddle +
          thumbToIndexKnuckle
        ) / 2;

      return {
        label: "D",
        confidence:
          confidenceFromDistance(
            average,
            0.65
          ),
      };
    }
  }

  return null;
}

function isThreeFingerHand(
  hand: TrackedHand
) {
  const landmarks =
    hand.rawLandmarks;

  return (
    fingerExtended(
      landmarks,
      INDEX_TIP,
      INDEX_PIP
    ) &&
    fingerExtended(
      landmarks,
      MIDDLE_TIP,
      MIDDLE_PIP
    ) &&
    fingerExtended(
      landmarks,
      RING_TIP,
      RING_PIP
    ) &&
    fingerFolded(
      landmarks,
      PINKY_TIP,
      PINKY_PIP
    )
  );
}

function angleAt(
  a: LandmarkPoint,
  b: LandmarkPoint,
  c: LandmarkPoint
) {
  const ba = {
    x: a.x - b.x,
    y: a.y - b.y,
  };

  const bc = {
    x: c.x - b.x,
    y: c.y - b.y,
  };

  const dot =
    ba.x * bc.x +
    ba.y * bc.y;

  const lengthBA =
    Math.hypot(
      ba.x,
      ba.y
    );

  const lengthBC =
    Math.hypot(
      bc.x,
      bc.y
    );

  if (
    lengthBA === 0 ||
    lengthBC === 0
  ) {
    return 180;
  }

  const cosine =
    Math.max(
      -1,
      Math.min(
        1,
        dot /
          (lengthBA *
            lengthBC)
      )
    );

  return (
    Math.acos(cosine) *
    (180 / Math.PI)
  );
}

function isBentIndexHand(
  hand: TrackedHand
) {
  const landmarks =
    hand.rawLandmarks;

  const indexAngle =
    angleAt(
      landmarks[INDEX_MCP],
      landmarks[INDEX_PIP],
      landmarks[INDEX_TIP]
    );

  return (
    indexAngle > 45 &&
    indexAngle < 150 &&
    fingerFolded(
      landmarks,
      MIDDLE_TIP,
      MIDDLE_PIP
    ) &&
    fingerFolded(
      landmarks,
      RING_TIP,
      RING_PIP
    ) &&
    fingerFolded(
      landmarks,
      PINKY_TIP,
      PINKY_PIP
    )
  );
}

function palmCenter(
  hand: TrackedHand
): LandmarkPoint {
  const landmarks =
    hand.rawLandmarks;

  const ids = [
    WRIST,
    INDEX_MCP,
    MIDDLE_MCP,
    13,
    17,
  ];

  const total =
    ids.reduce(
      (result, id) => ({
        x:
          result.x +
          landmarks[id].x,

        y:
          result.y +
          landmarks[id].y,

        z:
          result.z +
          landmarks[id].z,
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

function distanceToPalm(
  active: TrackedHand,
  landmark: number,
  support: TrackedHand
) {
  const center =
    palmCenter(support);

  const scale =
    (
      handScale(
        active.rawLandmarks
      ) +
      handScale(
        support.rawLandmarks
      )
    ) / 2;

  return (
    distance2D(
      active.rawLandmarks[
        landmark
      ],
      center
    ) / scale
  );
}

/* ---------------- K ---------------- */

function recognizeK(
  hands: TrackedHand[]
): GesturePrediction | null {
  if (hands.length !== 2) {
    return null;
  }

  const combinations = [
    {
      bent: hands[0],
      support: hands[1],
    },
    {
      bent: hands[1],
      support: hands[0],
    },
  ];

  for (const {
    bent,
    support,
  } of combinations) {
    if (
      !isBentIndexHand(bent) ||
      !isPointerHand(support)
    ) {
      continue;
    }

    const tipDistance =
      crossHandDistance(
        bent,
        INDEX_TIP,
        support,
        INDEX_PIP
      );

    const jointDistance =
      crossHandDistance(
        bent,
        INDEX_PIP,
        support,
        INDEX_PIP
      );

    const bestDistance =
      Math.min(
        tipDistance,
        jointDistance
      );

    if (
      bestDistance < 0.8
    ) {
      return {
        label: "K",
        confidence:
          confidenceFromDistance(
            bestDistance,
            0.8
          ),
      };
    }
  }

  return null;
}

/* ---------------- L ---------------- */

function recognizeL(
  hands: TrackedHand[]
): GesturePrediction | null {
  if (hands.length !== 2) {
    return null;
  }

  const combinations = [
    {
      pointer: hands[0],
      support: hands[1],
    },
    {
      pointer: hands[1],
      support: hands[0],
    },
  ];

  for (const {
    pointer,
    support,
  } of combinations) {
    if (
      !isPointerHand(pointer) ||
      !isOpenSupportHand(
        support
      )
    ) {
      continue;
    }

    const distance =
      distanceToPalm(
        pointer,
        INDEX_TIP,
        support
      );

    if (
      distance < 0.8
    ) {
      return {
        label: "L",
        confidence:
          confidenceFromDistance(
            distance,
            0.8
          ),
      };
    }
  }

  return null;
}

/* ---------------- M ---------------- */

function recognizeM(
  hands: TrackedHand[]
): GesturePrediction | null {
  if (hands.length !== 2) {
    return null;
  }

  const combinations = [
    {
      active: hands[0],
      support: hands[1],
    },
    {
      active: hands[1],
      support: hands[0],
    },
  ];

  for (const {
    active,
    support,
  } of combinations) {
    if (
      !isThreeFingerHand(
        active
      ) ||
      !isOpenSupportHand(
        support
      )
    ) {
      continue;
    }

    const indexDistance =
      distanceToPalm(
        active,
        INDEX_TIP,
        support
      );

    const middleDistance =
      distanceToPalm(
        active,
        MIDDLE_TIP,
        support
      );

    const ringDistance =
      distanceToPalm(
        active,
        RING_TIP,
        support
      );

    const average =
      (
        indexDistance +
        middleDistance +
        ringDistance
      ) / 3;

    if (
      average < 1.0
    ) {
      return {
        label: "M",
        confidence:
          confidenceFromDistance(
            average,
            1
          ),
      };
    }
  }

  return null;
}

/* ---------------- N ---------------- */

function recognizeN(
  hands: TrackedHand[]
): GesturePrediction | null {
  if (hands.length !== 2) {
    return null;
  }

  const combinations = [
    {
      active: hands[0],
      support: hands[1],
    },
    {
      active: hands[1],
      support: hands[0],
    },
  ];

  for (const {
    active,
    support,
  } of combinations) {
    if (
      !isTwoFingerHand(
        active
      ) ||
      !isOpenSupportHand(
        support
      )
    ) {
      continue;
    }

    const indexDistance =
      distanceToPalm(
        active,
        INDEX_TIP,
        support
      );

    const middleDistance =
      distanceToPalm(
        active,
        MIDDLE_TIP,
        support
      );

    const average =
      (
        indexDistance +
        middleDistance
      ) / 2;

    if (
      average < 0.95
    ) {
      return {
        label: "N",
        confidence:
          confidenceFromDistance(
            average,
            0.95
          ),
      };
    }
  }

  return null;
}

/* ===================================
   MAIN RECOGNITION FUNCTION
   =================================== */

export function recognizeGesture(
  frame: HandFrame
): GesturePrediction {
  if (
    frame.hands.length === 0
  ) {
    return {
      label: null,
      confidence: 0,
    };
  }

  /*
   * Order matters.
   *
   * More specific two-handed
   * gestures are tested before
   * broad shapes such as C.
   */

  const recognizers = [
    // Very distinctive shapes
    recognizeVowel,

    recognizeX,
    recognizeY,
    recognizeV,
    recognizeW,
    recognizeZ,

    recognizeP,
    recognizeQ,
    recognizeS,
    recognizeT,
    recognizeR,

    recognizeK,
    recognizeL,
    recognizeM,
    recognizeN,

    recognizeF,
    recognizeG,

    recognizeD,
    recognizeB,
    recognizeC,
    ];

  for (const recognizer of recognizers) {
    const prediction =
      recognizer(
        frame.hands
      );

    if (prediction) {
      return prediction;
    }
  }

  return {
    label: null,
    confidence: 0,
  };
}