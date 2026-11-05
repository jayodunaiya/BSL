"use client";

import { useCallback, useRef, useState } from "react";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraOn(true);
    } catch (error) {
      console.error("Camera error:", error);

      setCameraError(
        "Unable to access the camera. Please allow camera permission and try again."
      );

      setIsCameraOn(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    const video = videoRef.current;

    if (video?.srcObject) {
      const stream = video.srcObject as MediaStream;

      stream.getTracks().forEach((track) => {
        track.stop();
      });

      video.srcObject = null;
    }

    setIsCameraOn(false);
  }, []);

  return {
    videoRef,
    isCameraOn,
    cameraError,
    startCamera,
    stopCamera,
  };
}