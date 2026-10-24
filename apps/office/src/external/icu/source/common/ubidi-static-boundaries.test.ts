/** @fileoverview Original internal bracket guards on explicitly initialized helper states. Future opening/closing positions are impossible in the normal left-to-right scanner and are not presented as real text captures. */
import { expect, it } from "vitest";
import {
  bracketProcessClosing,
  fixN0c,
  resolveExplicitLevels,
  resolveImplicitRuns,
  type BracketData,
} from "./ubidi";
/** Constructs source-shaped values for direct static-helper boundary tests;this is not a bidi service or ordinary scanner fixture. @returns Explicit bracket state. */
function fixture(): BracketData {
  return {
    bidi: {
      text: "[abc]defg",
      paraLevel: 0,
      dirProps: Array<number>(9).fill(10),
      levels: Array<number>(9).fill(0),
      paras: [{ limit: 9, level: 0 }],
      flags: 0,
      isolateCount: 0,
      isolates: [],
    },
    isoRunLast: 0,
    isoRuns: [
      { start: 0, limit: 3, level: 0, lastStrong: 0, lastBase: 0, contextDir: 0, contextPos: 0 },
    ],
    openings: [
      { position: 0, match: 0, contextDir: 0, contextPos: 0, flags: 0 },
      { position: 1, match: 93, contextDir: 1, contextPos: 0, flags: 2 },
      { position: 6, match: 41, contextDir: 0, contextPos: 0, flags: 0 },
    ],
  };
}
it("retains the future-opening guard which ordinary ordered scanning cannot reach", /** All openings are normally appended before the current closing position,so this deliberately inconsistent state is limited to the original static boundary. @returns Nothing. */ () => {
  const bd = fixture();
  expect(bracketProcessClosing(bd, 1, 3)).toBe(1);
  expect(bd.bidi.dirProps[1]).toBe(1);
  expect(bd.bidi.dirProps[3]).toBe(1);
  expect(bd.openings[2]?.match).toBe(41);
});
it("retains the recursive correction's already-passed-opening guard on initialized boundary values", /** A future recorded closing index deliberately violates ordinary scan order;no real document path is claimed. @returns Nothing. */ () => {
  const bd = fixture();
  bd.openings[1] = { position: 2, match: -8, contextDir: 1, contextPos: 0, flags: 0 };
  const before = [...bd.bidi.dirProps];
  fixN0c(bd, 0, 3, 0);
  expect(bd.bidi.dirProps).toEqual(before);
  expect(bd.openings[1]?.match).toBe(-8);
});

it("retains the explicit resolver's final flag guard on an inconsistent declared property cache", /** Ordinary getDirProps cannot declare an explicit-control flag while omitting all controls from its property array. This source static boundary is deliberately initialized outside that invariant. @returns Nothing. */ () => {
  const state = fixture().bidi;
  const bidi = {
    ...state,
    text: "aא",
    dirProps: [0, 1],
    levels: [0, 0],
    paras: [{ limit: 2, level: 0 }],
    flags: (1 << 11) | (1 << 1),
  };
  expect(resolveExplicitLevels(bidi)).toBe(2);
  expect(bidi.flags).toBe(3);
});
it("retains initial higher-level and post-paragraph-start dispatch for externally prepared source levels", /** Native ubidi_setPara can receive external levels,but the consumed public wrapper fixes them to null. These valid lower-level value states preserve the source branches without claiming external-level API support. @returns Nothing. */ () => {
  const first = {
    ...fixture().bidi,
    text: "aא",
    dirProps: [0, 1],
    levels: [2, 2],
    paras: [{ limit: 2, level: 0 }],
    flags: (1 << 31) | 3,
    isolateCount: -1,
  };
  resolveImplicitRuns(first);
  expect(first.levels).toEqual([2, 3]);
  const second = {
    ...fixture().bidi,
    text: "a\nb",
    dirProps: [0, 7, 0],
    levels: [0, 0, 2],
    paras: [
      { limit: 2, level: 0 },
      { limit: 3, level: 0 },
    ],
    flags: (1 << 31) | 1 | (1 << 7),
    isolateCount: -1,
  };
  resolveImplicitRuns(second);
  expect(second.levels).toEqual([0, 0, 2]);
});
