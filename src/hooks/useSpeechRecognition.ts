"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Env } from "@/config/env";

export interface UseSpeechRecognitionProps {
  lang?: string;
  onTranscriptChange?: (transcript: string) => void;
  onError?: (error: SpeechRecognitionErrorEvent) => void;
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  finalTranscript: string;
  permissionError: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// Blocking errors that should surface an inline permission alert, as opposed
// to e.g. "no-speech" which just means the mic timed out with silence.
const PERMISSION_ERROR_CODES = new Set<SpeechRecognitionErrorCode>([
  "not-allowed",
  "service-not-allowed",
  "audio-capture",
]);

const getSpeechRecognitionCtor = (): typeof SpeechRecognition | null => {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
};

/**
 * Wraps the browser-native Web Speech API (SpeechRecognition /
 * webkitSpeechRecognition) for push-to-talk transcription.
 * See sdd/voice-transaction-input.md §3.2.
 */
export function useSpeechRecognition({
  lang,
  onTranscriptChange,
  onError,
}: UseSpeechRecognitionProps = {}): UseSpeechRecognitionReturn {
  const [isSupported] = useState(() => getSpeechRecognitionCtor() !== null);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef("");
  const onTranscriptChangeRef = useRef(onTranscriptChange);
  const onErrorRef = useRef(onError);

  onTranscriptChangeRef.current = onTranscriptChange;
  onErrorRef.current = onError;

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    if (!SpeechRecognitionCtor || recognitionRef.current) return;

    setPermissionError(null);
    finalTranscriptRef.current = "";
    setFinalTranscript("");
    setInterimTranscript("");

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang =
      lang ||
      Env.DEFAULT_SPEECH_LANGUAGE ||
      (typeof navigator !== "undefined" ? navigator.language : "es-ES");

    recognition.onresult = (event) => {
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";

        if (result.isFinal) {
          finalTranscriptRef.current =
            `${finalTranscriptRef.current} ${text}`.trim();
        } else {
          interim += text;
        }
      }

      setFinalTranscript(finalTranscriptRef.current);
      setInterimTranscript(interim);
      onTranscriptChangeRef.current?.(
        `${finalTranscriptRef.current} ${interim}`.trim(),
      );
    };

    recognition.onerror = (event) => {
      if (PERMISSION_ERROR_CODES.has(event.error)) {
        setPermissionError(event.error);
      }
      onErrorRef.current?.(event);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }, [lang]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = "";
    setFinalTranscript("");
    setInterimTranscript("");
  }, []);

  return {
    isSupported,
    isListening,
    transcript: `${finalTranscript} ${interimTranscript}`.trim(),
    interimTranscript,
    finalTranscript,
    permissionError,
    startListening,
    stopListening,
    resetTranscript,
  };
}
