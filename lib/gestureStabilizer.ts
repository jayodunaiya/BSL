import type { GesturePrediction } from "@/types/gesture";

export class GestureStabilizer {
  private history:
    GesturePrediction[] = [];

  constructor(
    private readonly windowSize = 7,
    private readonly requiredMatches = 5,
    private readonly minimumConfidence = 0.65
  ) {}

  update(
    prediction: GesturePrediction
  ): GesturePrediction {
    this.history.push(
      prediction
    );

    if (
      this.history.length >
      this.windowSize
    ) {
      this.history.shift();
    }

    const validPredictions =
      this.history.filter(
        (item) =>
          item.label !== null &&
          item.confidence >=
            this.minimumConfidence
      );

    if (
      validPredictions.length ===
      0
    ) {
      return {
        label: null,
        confidence: 0,
      };
    }

    const counts =
      new Map<
        string,
        {
          count: number;
          confidence: number;
        }
      >();

    for (
      const item of
      validPredictions
    ) {
      if (!item.label) {
        continue;
      }

      const existing =
        counts.get(
          item.label
        ) ?? {
          count: 0,
          confidence: 0,
        };

      counts.set(
        item.label,
        {
          count:
            existing.count +
            1,

          confidence:
            existing.confidence +
            item.confidence,
        }
      );
    }

    let bestLabel:
      | string
      | null = null;

    let bestCount = 0;

    let confidenceSum = 0;

    for (const [
      label,
      data,
    ] of counts) {
      if (
        data.count >
        bestCount
      ) {
        bestLabel = label;
        bestCount =
          data.count;

        confidenceSum =
          data.confidence;
      }
    }

    if (
      !bestLabel ||
      bestCount <
        this.requiredMatches
    ) {
      return {
        label: null,
        confidence: 0,
      };
    }

    return {
      label: bestLabel,

      confidence:
        confidenceSum /
        bestCount,
    };
  }

  reset() {
    this.history = [];
  }
}