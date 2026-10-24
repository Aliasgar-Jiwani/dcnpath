import { useRef, useCallback, useEffect } from 'react';

/**
 * A hook that runs a callback on every animation frame.
 * Returns start/stop controls. Respects prefers-reduced-motion.
 */
export function useAnimationLoop(
  callback: (deltaMs: number, elapsed: number) => void,
  autoStart = false
) {
  const rafId = useRef<number>(0);
  const startTime = useRef<number>(0);
  const prevTime = useRef<number>(0);
  const isRunning = useRef(false);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const loop = useCallback((timestamp: number) => {
    if (!isRunning.current) return;
    if (startTime.current === 0) {
      startTime.current = timestamp;
      prevTime.current = timestamp;
    }
    const delta = timestamp - prevTime.current;
    const elapsed = timestamp - startTime.current;
    prevTime.current = timestamp;
    callbackRef.current(delta, elapsed);
    rafId.current = requestAnimationFrame(loop);
  }, []);

  const start = useCallback(() => {
    if (isRunning.current || prefersReducedMotion) return;
    isRunning.current = true;
    startTime.current = 0;
    rafId.current = requestAnimationFrame(loop);
  }, [loop, prefersReducedMotion]);

  const stop = useCallback(() => {
    isRunning.current = false;
    cancelAnimationFrame(rafId.current);
  }, []);

  const reset = useCallback(() => {
    stop();
    startTime.current = 0;
    prevTime.current = 0;
  }, [stop]);

  useEffect(() => {
    if (autoStart) start();
    return stop;
  }, [autoStart, start, stop]);

  return { start, stop, reset, isRunning: isRunning.current };
}
