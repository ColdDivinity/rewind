import { useCallback, useState } from "react";
import { useObservable } from "rxjs-hooks";
import { bufferTime, last, takeLast, throttleTime } from "rxjs/operators";
import { useAnalysisApp } from "../providers/TheaterProvider";
import { ALLOWED_SPEEDS } from "../utils/Constants";
import { timer } from "rxjs";
import { useInterval } from "../react/hooks/useInterval";

export function useGameClock() {
  const analyzer = useAnalysisApp();
  return analyzer.gameClock;
}

// TODO: FLOATING POINT EQUALITY ALERT
const speedIndex = (speed: number) => ALLOWED_SPEEDS.indexOf(speed);
const nextSpeed = (speed: number) => ALLOWED_SPEEDS[Math.min(ALLOWED_SPEEDS.length - 1, speedIndex(speed) + 1)];
const prevSpeed = (speed: number) => ALLOWED_SPEEDS[Math.max(0, speedIndex(speed) - 1)];

export function useGameClockControls() {
  const clock = useGameClock();

  const isPlaying = useObservable(() => clock.isPlaying$, false);
  const duration = useObservable(() => clock.durationInMs$, 0);
  const speed = useObservable(() => clock.speed$, 1.0);

  const toggleClock = useCallback(() => clock.toggle(), [clock]);
  const seekTo = useCallback((timeInMs: number) => clock.seekTo(timeInMs), [clock]);

  const setSpeed = useCallback((x: number) => clock.setSpeed(x), [clock]);
  const increaseSpeed = useCallback(() => clock.setSpeed(nextSpeed(clock.speed)), [clock]);
  const decreaseSpeed = useCallback(() => clock.setSpeed(prevSpeed(clock.speed)), [clock]);

  const seekForward = useCallback((timeInMs) => clock.seekTo(clock.timeElapsedInMs + timeInMs), [clock]);
  const seekBackward = useCallback((timeInMs) => clock.seekTo(clock.timeElapsedInMs - timeInMs), [clock]);

  return {
    isPlaying,
    duration,
    speed,
    // Actions
    setSpeed,
    increaseSpeed,
    decreaseSpeed,
    toggleClock,
    seekTo,
    seekForward,
    seekBackward,
  };
}

// 60FPS by default
export function useGameClockTime(fps = 60) {
  const gameClock = useGameClock();
  const [time, setTime] = useState(0);

  // return useObservable(() => gameClock.timeElapsedInMs$.pipe(throttleTime(1000 / fps)), 0);
  // return useObservable(() => timer(0, 1000 / fps).pipe(gameClock.timeElapsedInMs$.asObservable()), 0);
  // Use rxjs somehow
  useInterval(() => {
    setTime(gameClock.timeElapsedInMs);
  }, 1000 / fps);
  return time;
}
