/** @fileoverview Real ICU astronomer value mutation and integer CalendarCache lifecycle, including sticky error callers. */
import { expect, it, vi } from "vitest";
import { CalendarAstronomer, Equatorial, MoonAge, CalendarCache } from "./astro";
it("retains actual coordinate/angle values and invalidates Julian cache on time changes", /** Independent Julian epoch constants check milliseconds-to-days without using inverse port code. @returns Nothing. */ () => {
  const lunar = new CalendarAstronomer(Date.UTC(2024, 0, 1)),
    angle = new MoonAge(0);
  const newMoon = lunar.getMoonTime(angle, true);
  lunar.setTime(newMoon + 1);
  angle.set(Math.PI / 2);
  const quarter = lunar.getMoonTime(angle, true);
  expect(quarter).toBeGreaterThan(newMoon + 4 * 86400000);
  expect(quarter).toBeLessThan(newMoon + 10 * 86400000);
  lunar.setTime(newMoon + 1);
  expect(lunar.getMoonTime(new MoonAge(Math.PI / 2), true)).toBe(quarter);
  const coordinate = new Equatorial();
  expect([coordinate.ascension, coordinate.declination]).toEqual([0, 0]);
  coordinate.set(1, -1);
  expect(lunar.eclipticToEquatorial(coordinate, 0, 0)).toBe(coordinate);
  expect([coordinate.ascension, coordinate.declination]).toEqual([0, 0]);
  vi.useFakeTimers({ toFake: ["Date"] });
  try {
    vi.setSystemTime(new Date(0));
    const clock = new CalendarAstronomer();
    expect(clock.getTime()).toBe(0);
    expect(clock.getJulianDay()).toBe(2440587.5);
    expect(clock.getJulianDay()).toBe(2440587.5);
    clock.setTime(946728000000);
    expect(clock.getTime()).toBe(946728000000);
    expect(clock.getJulianDay()).toBe(2451545);
    clock.setTime(0);
    expect(clock.getJulianDay()).toBe(2440587.5);
  } finally {
    vi.useRealTimers();
  }
});
it("shares the genuine integer hash owner through lazy put/get and explicit destruction", /** A failed caller never allocates or mutates a cache; ordinary keys retain signed32 identity and replacement semantics. @returns Nothing. */ () => {
  const cache: [CalendarCache | null] = [null],
    status: [number] = [1];
  expect(CalendarCache.get(cache, 1, status)).toBe(0);
  CalendarCache.put(cache, 1, 2, status);
  expect(cache[0]).toBeNull();
  expect(status[0]).toBe(1);
  status[0] = 0;
  CalendarCache.put(cache, -1, 23, status);
  expect(CalendarCache.get(cache, -1, status)).toBe(23);
  expect(CalendarCache.get(cache, 1, status)).toBe(0);
  CalendarCache.put(cache, -1, 99, status);
  expect(CalendarCache.get(cache, -1, status)).toBe(99);
  expect(status[0]).toBe(0);
  const held = cache[0];
  expect(held).not.toBeNull();
  held?.dispose();
  const readFirst: [CalendarCache | null] = [null];
  expect(CalendarCache.get(readFirst, 0, status)).toBe(0);
  CalendarCache.put(readFirst, 0, -2147483648, status);
  expect(CalendarCache.get(readFirst, 0, status)).toBe(-2147483648);
  readFirst[0]?.dispose();
});
