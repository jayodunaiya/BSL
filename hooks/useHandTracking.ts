"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  DrawingUtils,
  HandLandmarker,
  type HandLandmarkerResult,
} from "@mediapipe/tasks-vision";

import { getHandLandmarker } from "@/lib/mediapipe";
import { createTrackedHand } from "@/lib/normalizeLandmarks";

import type {
  HandFrame,
  HandSide,
  LandmarkPoint,
} from "@/types/gesture";

type UseHandTrackingProps = {
  videoRef: React.RefObject<HTMLVideoElement | null>;

  canvasRef: React.RefObject<HTMLCanvasElement | null>;

  enabled: boolean;

  onFrame?: (
    frame: HandFrame
  ) => void;
};

export function useHandTracking({
  videoRef,
  canvasRef,
  enabled,
  onFrame,
}: UseHandTrackingProps) {
  const requestRef =
    useRef<number | null>(null);

  const lastVideoTimeRef =
    useRef(-1);

  const lastEmitRef =
    useRef(0);

  const [
    isModelLoading,
    setIsModelLoading,
  ] = useState(false);

  const [
    isModelReady,
    setIsModelReady,
  ] = useState(false);

  const [
    handsDetected,
    setHandsDetected,
  ] = useState(0);

  const [
    trackingError,
    setTrackingError,
  ] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setHandsDetected(0);

      if (
        requestRef.current !== null
      ) {
        cancelAnimationFrame(
          requestRef.current
        );
      }

      const canvas =
        canvasRef.current;

      if (canvas) {
        const context =
          canvas.getContext("2d");

        context?.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );
      }

      return;
    }

    let cancelled = false;

    async function startTracking() {
      try {
        setTrackingError(null);
        setIsModelLoading(true);

        const handLandmarker =
          await getHandLandmarker();

        if (cancelled) return;

        setIsModelLoading(false);
        setIsModelReady(true);

        predictWebcam(
          handLandmarker
        );
      } catch (error) {
        console.error(
          "MediaPipe initialization error:",
          error
        );

        if (!cancelled) {
          setIsModelLoading(false);
          setIsModelReady(false);

          setTrackingError(
            "The hand tracking model could not be loaded."
          );
        }
      }
    }

    function predictWebcam(
      handLandmarker: HandLandmarker
    ) {
      if (
        cancelled ||
        !enabled
      ) {
        return;
      }

      const video =
        videoRef.current;

      const canvas =
        canvasRef.current;

      if (!video || !canvas) {
        requestRef.current =
          requestAnimationFrame(
            () =>
              predictWebcam(
                handLandmarker
              )
          );

        return;
      }

      if (
        video.readyState <
          HTMLMediaElement.HAVE_CURRENT_DATA ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
      ) {
        requestRef.current =
          requestAnimationFrame(
            () =>
              predictWebcam(
                handLandmarker
              )
          );

        return;
      }

      if (
        video.currentTime !==
        lastVideoTimeRef.current
      ) {
        lastVideoTimeRef.current =
          video.currentTime;

        const results =
          handLandmarker.detectForVideo(
            video,
            performance.now()
          );

        drawResults(
          results,
          canvas
        );

        const numberOfHands =
          results.landmarks
            ?.length ?? 0;

        setHandsDetected(
          numberOfHands
        );

        processResults(results);
      }

      requestRef.current =
        requestAnimationFrame(
          () =>
            predictWebcam(
              handLandmarker
            )
        );
    }

    function processResults(
      results: HandLandmarkerResult
    ) {
      if (!onFrame) return;

      const now =
        performance.now();

      // We don't need to send React
      // state updates at 60fps.
      // About 12 updates/sec is enough
      // for the recognition layer.
      if (
        now -
          lastEmitRef.current <
        80
      ) {
        return;
      }

      lastEmitRef.current = now;

      const hands =
        results.landmarks.map(
          (
            landmarks,
            index
          ) => {
            const category =
              results.handedness?.[
                index
              ]?.[0];

            let handedness: HandSide =
              "Unknown";

            if (
              category?.categoryName ===
              "Left"
            ) {
              handedness = "Left";
            }

            if (
              category?.categoryName ===
              "Right"
            ) {
              handedness =
                "Right";
            }

            const score =
              category?.score ?? 0;

            const points: LandmarkPoint[] =
              landmarks.map(
                (point) => ({
                  x: point.x,
                  y: point.y,
                  z: point.z,
                })
              );

            return createTrackedHand(
              points,
              handedness,
              score
            );
          }
        );

      onFrame({
        hands,
        timestamp: now,
      });
    }

    function drawResults(
      results: HandLandmarkerResult,
      canvas: HTMLCanvasElement
    ) {
      const video =
        videoRef.current;

      if (!video) return;

      if (
        canvas.width !==
          video.videoWidth ||
        canvas.height !==
          video.videoHeight
      ) {
        canvas.width =
          video.videoWidth;

        canvas.height =
          video.videoHeight;
      }

      const context =
        canvas.getContext("2d");

      if (!context) return;

      context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      const drawingUtils =
        new DrawingUtils(
          context
        );

      for (const landmarks of
        results.landmarks) {
        drawingUtils.drawConnectors(
          landmarks,
          HandLandmarker.HAND_CONNECTIONS,
          {
            lineWidth: 3,
          }
        );

        drawingUtils.drawLandmarks(
          landmarks,
          {
            radius: 4,
            lineWidth: 2,
          }
        );
      }
    }

    startTracking();

    return () => {
      cancelled = true;

      if (
        requestRef.current !== null
      ) {
        cancelAnimationFrame(
          requestRef.current
        );
      }
    };
  }, [
    enabled,
    videoRef,
    canvasRef,
    onFrame,
  ]);

  return {
    isModelLoading,
    isModelReady,
    handsDetected,
    trackingError,
  };
}