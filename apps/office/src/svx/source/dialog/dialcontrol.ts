/** @fileoverview Angle calculation from the original SVX DialControl pointer interaction. */
import type { Degree100 } from "../../../tools/inc/degree";

/** Computes the native dial angle, snapping the first press to fifteen degrees. @param x - Horizontal offset from center. @param y - Upward vertical offset from center. @param initial - Whether this is the initial press. @returns The rounded angle or no change at the center. */
export function getDialMouseAngle(x: number, y: number, initial: boolean): Degree100 | undefined {
  const distance = Math.hypot(x, y);
  if (distance === 0) return undefined;
  let angle = Math.trunc(Math.acos(x / distance) * (18000 / Math.PI));
  if (y < 0) angle = 36000 - angle;
  if (initial) angle = Math.floor((angle + 750) / 1500) * 1500;
  return (Math.floor((angle + 50) / 100) * 100) % 36000;
}
