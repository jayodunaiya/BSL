"use client";

import {
  useCallback,
  useRef,
  useState,
} from "react";

import CameraView from "./CameraView";
import TranslationPanel from "./TranslationPanel";

import { MotionGestureRecognizer } from "@/lib/motionGestureRecognizer";
import { recognizeGesture } from "@/lib/gestureRecognizer";
import { GestureStabilizer } from "@/lib/gestureStabilizer";

import { useWordBuilder } from "@/hooks/useWordBuilder";

import type {
  GesturePrediction,
  HandFrame,
} from "@/types/gesture";

export default function BSLTranslator() {
  const [
    latestFrame,
    setLatestFrame,
  ] = useState<HandFrame | null>(
    null
  );

  const [
    prediction,
    setPrediction,
  ] = useState<GesturePrediction>({
    label: null,
    confidence: 0,
  });

  /*
   * Word-building state and actions
   */
  const {
    currentWord,
    completedText,
    observe,
    confirmWord,
    backspace,
    clear,
  } = useWordBuilder();

  /*
   * Static recognition stabilizer
   */
  const stabilizerRef =
    useRef(
      new GestureStabilizer()
    );

  /*
   * Dynamic H/J recognizer
   */
  const motionRecognizerRef =
    useRef(
      new MotionGestureRecognizer()
    );

  /*
   * Prevent the ending pose of a
   * motion gesture from immediately
   * becoming another static letter.
   */
  const suppressStaticUntilRef =
    useRef(0);

  const handleFrame =
    useCallback(
      (frame: HandFrame) => {
        setLatestFrame(frame);

        /*
         * ==========================
         * NO HANDS
         * ==========================
         */

        if (
          frame.hands.length === 0
        ) {
          setPrediction({
            label: null,
            confidence: 0,
          });

          stabilizerRef.current.reset();

          motionRecognizerRef.current.reset();

          observe({
            label: null,
            handsCount: 0,
            timestamp:
              frame.timestamp,
          });

          return;
        }

        /*
         * ==========================
         * MOTION GESTURES
         * H / J
         * ==========================
         */

        const motionResult =
          motionRecognizerRef.current.update(
            frame
          );

        if (
          motionResult.prediction
        ) {
          const result =
            motionResult.prediction;

          setPrediction(
            result
          );

          stabilizerRef.current.reset();

          /*
           * Brief cooldown after H/J
           */
          suppressStaticUntilRef.current =
            frame.timestamp +
            500;

          observe({
            label:
              result.label,
            handsCount:
              frame.hands.length,
            timestamp:
              frame.timestamp,
          });

          return;
        }

        /*
         * Motion currently happening.
         * Avoid static recognition
         * interfering.
         */
        if (
          motionResult.motionInProgress
        ) {
          stabilizerRef.current.reset();

          setPrediction({
            label: null,
            confidence: 0,
          });

          observe({
            label: null,
            handsCount:
              frame.hands.length,
            timestamp:
              frame.timestamp,
          });

          return;
        }

        /*
         * Cooldown after motion gesture
         */
        if (
          frame.timestamp <
          suppressStaticUntilRef.current
        ) {
          setPrediction({
            label: null,
            confidence: 0,
          });

          observe({
            label: null,
            handsCount:
              frame.hands.length,
            timestamp:
              frame.timestamp,
          });

          return;
        }

        /*
         * ==========================
         * STATIC RECOGNITION
         * ==========================
         */

        const rawPrediction =
          recognizeGesture(
            frame
          );

        const stablePrediction =
          stabilizerRef.current.update(
            rawPrediction
          );

        setPrediction(
          stablePrediction
        );

        observe({
          label:
            stablePrediction.label,

          handsCount:
            frame.hands.length,

          timestamp:
            frame.timestamp,
        });
      },
      [observe]
    );

  /*
   * Reset everything
   */
  function clearTranslation() {
    clear();

    setPrediction({
      label: null,
      confidence: 0,
    });

    stabilizerRef.current.reset();

    motionRecognizerRef.current.reset();

    suppressStaticUntilRef.current =
      0;
  }

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Accessibility Technology
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            British Sign Language
            Translator
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Perform a supported
            British Sign Language
            gesture in front of your
            webcam and the system will
            translate the recognized
            gesture into readable
            English text.
          </p>
        </header>

        <section className="grid flex-1 gap-6 lg:grid-cols-[1.45fr_0.8fr]">
          <CameraView
            onFrame={
              handleFrame
            }
          />

          <TranslationPanel
            prediction={
              prediction
            }
            currentWord={
              currentWord
            }
            completedText={
              completedText
            }
            onConfirmWord={
              confirmWord
            }
            onBackspace={
              backspace
            }
            onClear={
              clearTranslation
            }
          />
        </section>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
          <strong>
            Recognition engine:
          </strong>{" "}
          {latestFrame
            ? `${latestFrame.hands.length} hand(s) detected`
            : "Waiting for camera data"}

          {prediction.label && (
            <>
              {" "}
              — Stable prediction:{" "}
              <strong>
                {
                  prediction.label
                }
              </strong>
            </>
          )}

          {currentWord && (
            <>
              {" "}
              — Current word:{" "}
              <strong>
                {
                  currentWord
                }
              </strong>
            </>
          )}
        </div>
      </div>
    </main>
  );
}