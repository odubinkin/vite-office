/** @fileoverview Original compiled ICU78.3 captures and source status/capacity contracts for the consumed paragraph owner and logical-run API. */
import { expect, it } from "vitest";
import inputs from "./native-bidi-vectors.json";
import native from "./native-bidi-logical-runs.json";
import {
  ubidi_openSized,
  ubidi_setPara,
  ubidi_close,
  ubidi_countRuns,
  ubidi_getLogicalRun,
  ubidi_getLevels,
  type UBiDi,
} from "./unicode/ubidi";
import { UErrorCode as E } from "./unicode/utypes";

it("matches original run counts, limits and levels at every retained UTF16 position before and after level materialization", /** Replays independently captured native calls, including controls, isolates, malformed UTF16 and explicit overflow. @returns Nothing. */ () => {
  expect(native.icuVersion).toBe("78.3");
  expect(native.vectors).toHaveLength(inputs.vectors.length);
  for (const [index, source] of inputs.vectors.entries()) {
    const expected = native.vectors[index] as (typeof native.vectors)[number],
      error: [number] = [0],
      bidi = ubidi_openSized(source.units.length, 0, error) as UBiDi;
    try {
      ubidi_setPara(
        bidi,
        new Uint16Array(source.units),
        source.units.length,
        source.initial as 0 | 1,
        null,
        error,
      );
      expect(error[0]).toBe(expected.status);
      expect(ubidi_countRuns(bidi, error)).toBe(expected.count);
      for (let pass = 0; pass < 2; pass++) {
        if (pass && source.units.length) {
          expect(ubidi_getLevels(bidi, error)?.slice(0, source.units.length)).toEqual(
            source.levels,
          );
        }
        for (const [start, limit, level] of expected.runs) {
          const actual: number[][] = [];
          for (let position = start as number; position < (limit as number); position++) {
            const end: [number] = [-1],
              type: [number] = [255];
            ubidi_getLogicalRun(bidi, position, end, type);
            actual.push([end[0], type[0]]);
          }
          expect(actual, `native case ${index}, position ${start}, pass ${pass}`).toEqual(
            Array.from(
              { length: (limit as number) - (start as number) },
              /** Expands the lossless native run capture. @returns Captured native outputs. */ () => [
                limit,
                level,
              ],
            ),
          );
        }
      }
    } finally {
      ubidi_close(bidi);
    }
  }
});

it("retains original incoming-error, warning, null and invalid-state behavior", /** Error outputs and owner mutation follow the source entry-check order. @returns Nothing. */ () => {
  const error: [number] = [E.U_ILLEGAL_ARGUMENT_ERROR];
  expect(ubidi_openSized(-1, 0, error)).toBeNull();
  expect(ubidi_openSized(0, 0, null)).toBeNull();
  expect(ubidi_countRuns(null, error)).toBe(-1);
  expect(error[0]).toBe(E.U_ILLEGAL_ARGUMENT_ERROR);
  error[0] = E.U_USING_FALLBACK_WARNING;
  const bidi = ubidi_openSized(0, 0, error) as UBiDi;
  try {
    expect(bidi.pParaBiDi).toBeNull();
    expect(ubidi_countRuns(bidi, error)).toBe(-1);
    expect(error[0]).toBe(E.U_INVALID_STATE_ERROR);
    error[0] = E.U_USING_DEFAULT_WARNING;
    ubidi_setPara(bidi, new Uint16Array([97]), 1, 0, null, error);
    expect(ubidi_countRuns(bidi, error)).toBe(1);
    expect(error[0]).toBe(E.U_USING_DEFAULT_WARNING);
    ubidi_setPara(bidi, null, 0, 0, null, error);
    expect(error[0]).toBe(E.U_ILLEGAL_ARGUMENT_ERROR);
    expect(bidi.pParaBiDi).toBe(bidi);
    error[0] = 0;
    ubidi_setPara(bidi, new Uint16Array(), -2, 0, null, error);
    expect(error[0]).toBe(E.U_ILLEGAL_ARGUMENT_ERROR);
    expect(bidi.length).toBe(1);
    ubidi_setPara(bidi, new Uint16Array([98, 99]), 2, 0, null, error);
    expect(bidi.length).toBe(1);
    ubidi_setPara(bidi, new Uint16Array(), 0, 0, null, null);
    expect(bidi.length).toBe(1);
  } finally {
    ubidi_close(bidi);
  }
  error[0] = 0;
  expect(ubidi_openSized(-1, 0, error)).toBeNull();
  expect(error[0]).toBe(E.U_ILLEGAL_ARGUMENT_ERROR);
  error[0] = 0;
  expect(ubidi_openSized(0, -1, error)).toBeNull();
  ubidi_close(null);
});

it("preserves fixed text capacity failure, invalidation and subsequent recovery", /** Native maxLength fixes allocation capacity when positive. @returns Nothing. */ () => {
  const error: [number] = [0],
    bidi = ubidi_openSized(1, 0, error) as UBiDi;
  try {
    ubidi_setPara(bidi, new Uint16Array([97, 98]), 2, 0, null, error);
    expect(error[0]).toBe(E.U_MEMORY_ALLOCATION_ERROR);
    expect(bidi.pParaBiDi).toBeNull();
    error[0] = 0;
    expect(ubidi_countRuns(bidi, error)).toBe(-1);
    expect(error[0]).toBe(E.U_INVALID_STATE_ERROR);
    error[0] = 0;
    ubidi_setPara(bidi, new Uint16Array([97]), 1, 0, null, error);
    expect(ubidi_countRuns(bidi, error)).toBe(1);
    expect(error[0]).toBe(0);
  } finally {
    ubidi_close(bidi);
  }
});

it("retains the source run-capacity failure without assigning a failure status", /** getRuns returns false while countRuns returns the unchanged negative count and successful status. @returns Nothing. */ () => {
  for (const capacity of [1, 2, 3]) {
    const error: [number] = [0],
      bidi = ubidi_openSized(0, capacity, error) as UBiDi;
    try {
      ubidi_setPara(bidi, new Uint16Array([97, 0x5d0, 98]), 3, 0, null, error);
      expect(ubidi_countRuns(bidi, error)).toBe(capacity < 3 ? -1 : 3);
      expect(error[0]).toBe(0);
    } finally {
      ubidi_close(bidi);
    }
  }
});

it("keeps counted NUL, source NUL termination, empty-level errors and untouched optional outputs", /** Positions use UTF16 units and retain source pointer-output behavior. @returns Nothing. */ () => {
  const error: [number] = [0],
    bidi = ubidi_openSized(0, 0, error) as UBiDi,
    units = new Uint16Array([97, 0, 0x5d0]);
  try {
    ubidi_setPara(bidi, units, -1, 1, null, error);
    expect(bidi.length).toBe(1);
    ubidi_setPara(bidi, units, 3, 1, null, error);
    expect(bidi.length).toBe(3);
    const end: [number] = [99],
      level: [number] = [88];
    ubidi_getLogicalRun(bidi, -1, end, level);
    ubidi_getLogicalRun(bidi, 3, end, level);
    expect([end[0], level[0]]).toEqual([99, 88]);
    ubidi_getLogicalRun(bidi, 0, null, null);
    expect(error[0]).toBe(0);
    ubidi_setPara(bidi, units, 0, 1, null, error);
    expect(ubidi_countRuns(bidi, error)).toBe(0);
    expect(ubidi_getLevels(bidi, error)).toBeNull();
    expect(error[0]).toBe(E.U_ILLEGAL_ARGUMENT_ERROR);
    error[0] = 0;
    expect(ubidi_getLevels(null, error)).toBeNull();
    expect(error[0]).toBe(E.U_INVALID_STATE_ERROR);
    expect(ubidi_getLevels(bidi, null)).toBeNull();
  } finally {
    ubidi_close(bidi);
  }
});
