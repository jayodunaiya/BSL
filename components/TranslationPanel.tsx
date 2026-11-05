"use client";

import type { GesturePrediction } from "@/types/gesture";

type TranslationPanelProps = {
  prediction: GesturePrediction;

  currentWord: string;

  completedText: string;

  onConfirmWord: () => void;

  onBackspace: () => void;

  onClear: () => void;
};

export default function TranslationPanel({
  prediction,
  currentWord,
  completedText,
  onConfirmWord,
  onBackspace,
  onClear,
}: TranslationPanelProps) {
  const confidence = Math.round(
    prediction.confidence * 100
  );

  const fullText = [
    completedText,
    currentWord,
  ]
    .filter(Boolean)
    .join(" ");

  async function copyText() {
    if (!fullText) return;

    try {
      await navigator.clipboard.writeText(
        fullText
      );
    } catch (error) {
      console.error(
        "Unable to copy text:",
        error
      );
    }
  }

  return (
    <aside className="flex min-h-[500px] flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Detected Gesture */}
      <div className="border-b border-slate-100 pb-5">
        <p className="text-sm font-medium text-slate-500">
          Detected gesture
        </p>

        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight text-slate-900">
              {prediction.label ?? "—"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {prediction.label
                ? "Gesture recognized"
                : "Waiting for gesture recognition"}
            </p>
          </div>

          <div className="rounded-xl bg-slate-100 px-3 py-2 text-right">
            <p className="text-xs text-slate-500">
              Confidence
            </p>

            <p className="mt-1 font-semibold text-slate-700">
              {confidence}%
            </p>
          </div>
        </div>
      </div>

      {/* Translation */}
      <div className="flex flex-1 flex-col py-5">
        <p className="text-sm font-medium text-slate-500">
          Translation
        </p>

        <div className="mt-3 flex-1 rounded-2xl bg-slate-50 p-4">
          {fullText ? (
            <p className="break-words text-2xl font-medium leading-10 text-slate-900">
              {fullText}
            </p>
          ) : (
            <p className="text-lg text-slate-400">
              Recognized text will appear here.
            </p>
          )}
        </div>

        {/* Current Word */}
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Current word
          </p>

          <div className="mt-2 min-h-14 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xl font-semibold tracking-widest text-slate-800">
              {currentWord || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={onConfirmWord}
          disabled={!currentWord}
          className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Confirm word
        </button>

        <button
          type="button"
          onClick={onBackspace}
          disabled={!currentWord}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Backspace
        </button>

        <button
          type="button"
          onClick={copyText}
          disabled={!fullText}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Copy
        </button>

        <button
          type="button"
          onClick={onClear}
          disabled={!fullText}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear
        </button>
      </div>
    </aside>
  );
}