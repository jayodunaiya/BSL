"use client";

import {
  useCallback,
  useRef,
  useState,
} from "react";

type ObserveInput = {
  label: string | null;
  handsCount: number;
  timestamp: number;
};

export function useWordBuilder() {
  const [currentWord, setCurrentWord] =
    useState("");

  const [completedText, setCompletedText] =
    useState("");

  const currentWordRef =
    useRef("");

  const completedTextRef =
    useRef("");

  const lastAcceptedRef =
    useRef<string | null>(null);

  const repeatUnlockedRef =
    useRef(true);

  const neutralSinceRef =
    useRef<number | null>(null);

  const noHandsSinceRef =
    useRef<number | null>(null);

  const confirmWord =
    useCallback(() => {
      const word =
        currentWordRef.current.trim();

      if (!word) return;

      const previous =
        completedTextRef.current;

      const next = previous
        ? `${previous} ${word}`
        : word;

      completedTextRef.current =
        next;

      setCompletedText(next);

      currentWordRef.current =
        "";

      setCurrentWord("");

      lastAcceptedRef.current =
        null;

      repeatUnlockedRef.current =
        true;

      neutralSinceRef.current =
        null;

      noHandsSinceRef.current =
        null;
    }, []);

  const acceptLetter =
    useCallback(
      (letter: string) => {
        if (!letter) return;

        /*
         * Prevent:
         *
         * AAAAAAAAA
         *
         * when A is simply being held.
         */
        if (
          lastAcceptedRef.current ===
            letter &&
          !repeatUnlockedRef.current
        ) {
          return;
        }

        const next =
          currentWordRef.current +
          letter;

        currentWordRef.current =
          next;

        setCurrentWord(next);

        lastAcceptedRef.current =
          letter;

        repeatUnlockedRef.current =
          false;

        neutralSinceRef.current =
          null;

        noHandsSinceRef.current =
          null;
      },
      []
    );

  const observe =
    useCallback(
      ({
        label,
        handsCount,
        timestamp,
      }: ObserveInput) => {
        /*
         * Stable recognized letter
         */
        if (label) {
          /*
           * Moving from A → E means
           * the next letter is obviously
           * intentional.
           */
          if (
            lastAcceptedRef.current &&
            label !==
              lastAcceptedRef.current
          ) {
            repeatUnlockedRef.current =
              true;
          }

          acceptLetter(label);

          neutralSinceRef.current =
            null;

          noHandsSinceRef.current =
            null;

          return;
        }

        /*
         * No stable letter.
         *
         * A short neutral period unlocks
         * repeated letters.
         *
         * Example:
         *
         * L
         * brief release
         * L
         *
         * → LL
         */
        if (
          neutralSinceRef.current ===
          null
        ) {
          neutralSinceRef.current =
            timestamp;
        }

        const neutralDuration =
          timestamp -
          neutralSinceRef.current;

        if (
          neutralDuration >= 250
        ) {
          repeatUnlockedRef.current =
            true;
        }

        /*
         * Removing both hands for a
         * longer period automatically
         * confirms the current word.
         */
        if (handsCount === 0) {
          if (
            noHandsSinceRef.current ===
            null
          ) {
            noHandsSinceRef.current =
              timestamp;
          }

          const noHandsDuration =
            timestamp -
            noHandsSinceRef.current;

          if (
            noHandsDuration >= 1500 &&
            currentWordRef.current
          ) {
            confirmWord();
          }
        } else {
          noHandsSinceRef.current =
            null;
        }
      },
      [
        acceptLetter,
        confirmWord,
      ]
    );

  const backspace =
    useCallback(() => {
      const next =
        currentWordRef.current.slice(
          0,
          -1
        );

      currentWordRef.current =
        next;

      setCurrentWord(next);

      lastAcceptedRef.current =
        null;

      repeatUnlockedRef.current =
        true;
    }, []);

  const clear =
    useCallback(() => {
      currentWordRef.current =
        "";

      completedTextRef.current =
        "";

      setCurrentWord("");
      setCompletedText("");

      lastAcceptedRef.current =
        null;

      repeatUnlockedRef.current =
        true;

      neutralSinceRef.current =
        null;

      noHandsSinceRef.current =
        null;
    }, []);

  return {
    currentWord,
    completedText,

    observe,
    confirmWord,
    backspace,
    clear,
  };
}