"use client";

import { useRef } from "react";

import { useCamera } from "@/hooks/useCamera";
import { useHandTracking } from "@/hooks/useHandTracking";

import type { HandFrame } from "@/types/gesture";

type CameraViewProps = {
  onFrame: (frame: HandFrame) => void;
};

export default function CameraView({
  onFrame,
}: CameraViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    videoRef,
    isCameraOn,
    cameraError,
    startCamera,
    stopCamera,
  } = useCamera();

  const {
    isModelLoading,
    isModelReady,
    handsDetected,
    trackingError,
  } = useHandTracking({
    videoRef,
    canvasRef,
    enabled: isCameraOn,
    onFrame,
  });

  return (
    <section className="flex min-h-[500px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="font-semibold text-slate-900">
            Camera
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Position both hands clearly inside the frame.
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
            isCameraOn
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isCameraOn
                ? "bg-emerald-500"
                : "bg-slate-400"
            }`}
          />

          {isCameraOn ? "Camera active" : "Camera off"}
        </span>
      </div>

      {/* Camera Area */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-slate-950">
        {/* Webcam */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 h-full w-full scale-x-[-1] object-cover ${
            isCameraOn ? "block" : "hidden"
          }`}
        />

        {/* Hand landmark canvas */}
        <canvas
          ref={canvasRef}
          className={`pointer-events-none absolute inset-0 h-full w-full scale-x-[-1] object-cover ${
            isCameraOn ? "block" : "hidden"
          }`}
        />

        {/* Camera Off */}
        {!isCameraOn && (
          <div className="relative z-10 flex flex-col items-center px-5 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl">
              📷
            </div>

            <h3 className="font-medium text-white">
              Camera is currently off
            </h3>

            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
              Start the camera to begin British Sign Language gesture
              detection.
            </p>

            <button
              type="button"
              onClick={startCamera}
              className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Start camera
            </button>
          </div>
        )}

        {/* Model Loading */}
        {isCameraOn && isModelLoading && (
          <div className="absolute left-4 top-4 z-20 rounded-full bg-black/70 px-4 py-2 text-xs font-medium text-white backdrop-blur">
            Loading hand detection...
          </div>
        )}

        {/* Model Ready */}
        {isCameraOn && isModelReady && (
          <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-xs font-medium text-white backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Hand tracking active
          </div>
        )}

        {/* Hand Counter */}
        {isCameraOn && isModelReady && (
          <div className="absolute right-4 top-4 z-20 rounded-full bg-black/70 px-4 py-2 text-xs font-medium text-white backdrop-blur">
            {handsDetected === 0
              ? "No hands detected"
              : handsDetected === 1
              ? "1 hand detected"
              : `${handsDetected} hands detected`}
          </div>
        )}

        {/* Stop Camera */}
        {isCameraOn && (
          <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
            <button
              type="button"
              onClick={stopCamera}
              className="rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-red-600"
            >
              Stop camera
            </button>
          </div>
        )}
      </div>

      {/* Errors */}
      {cameraError && (
        <div className="border-t border-red-100 bg-red-50 px-5 py-3">
          <p className="text-sm text-red-700">
            {cameraError}
          </p>
        </div>
      )}

      {trackingError && (
        <div className="border-t border-red-100 bg-red-50 px-5 py-3">
          <p className="text-sm text-red-700">
            {trackingError}
          </p>
        </div>
      )}
    </section>
  );
}