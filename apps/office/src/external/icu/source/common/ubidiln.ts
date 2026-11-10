/** @fileoverview Original ICU78.3 default-mode paragraph levels and logical/visual run owners from ubidiln.cpp. Line objects and nondefault reordering options are not exposed. */
// Copyright Unicode, Inc. and others. Unicode License V3: https://www.unicode.org/license.txt
import { UBIDI_MAX_EXPLICIT_LEVEL, type Run, type UBiDi } from "./ubidiimp.h";
import { UErrorCode, U_FAILURE } from "./unicode/utypes";
/** Original paragraph/line validity predicate for the admitted paragraph owners. @param bidi - Source pointer. @returns Original marker validity. */
function valid(bidi: UBiDi | null): bidi is UBiDi {
  return (
    !!bidi &&
    (bidi.pParaBiDi === bidi || (!!bidi.pParaBiDi && bidi.pParaBiDi.pParaBiDi === bidi.pParaBiDi))
  );
}
/** Original getLevels, retaining implicit trailing levels, pointer reuse and status behavior. @param bidi - Source owner. @param error - Source in/out status. @returns Actual level storage or original null. */
export function ubidi_getLevels(
  bidi: UBiDi | null,
  error: [number] | null,
): readonly number[] | null {
  if (!error || U_FAILURE(error[0])) return null;
  if (!valid(bidi)) {
    error[0] = UErrorCode.U_INVALID_STATE_ERROR;
    return null;
  }
  const length = bidi.length,
    start = bidi.trailingWSStart;
  if (length <= 0) {
    error[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
    return null;
  }
  if (start === length) return bidi.levels;
  if (!bidi.levelsMemory || length > bidi.levelsMemory.length) {
    if (!bidi.mayAllocateText) {
      error[0] = UErrorCode.U_MEMORY_ALLOCATION_ERROR;
      return null;
    }
    bidi.levelsMemory = Array<number>(length).fill(0);
  }
  const levels = bidi.levelsMemory;
  if (start > 0 && levels !== bidi.levels)
    for (let index = 0; index < start; index++) levels[index] = bidi.levels[index] as number;
  levels.fill(bidi.paraLevel, start, length);
  bidi.trailingWSStart = length;
  return (bidi.levels = levels);
}
/** Original single-run representation with the direction in the high index bit. @param bidi - Actual owner. @param level - Original level. @returns Nothing. */
function getSingleRun(bidi: UBiDi, level: number): void {
  bidi.runs = bidi.simpleRuns;
  bidi.runCount = 1;
  bidi.runs[0] = { logicalStart: (level & 1) << 31, visualLimit: bidi.length, insertRemove: 0 };
}
/** Original L2 run reordering, including the separate trailing-whitespace run. @param bidi - Actual owner. @param minLevel - Source minimum. @param maxLevel - Source maximum. @returns Nothing. */
function reorderLine(bidi: UBiDi, minLevel: number, maxLevel: number): void {
  if (maxLevel <= (minLevel | 1)) return;
  ++minLevel;
  const runs = bidi.runs,
    levels = bidi.levels;
  let runCount = bidi.runCount;
  if (bidi.trailingWSStart < bidi.length) --runCount;
  while (--maxLevel >= minLevel) {
    let firstRun = 0;
    for (;;) {
      while (
        firstRun < runCount &&
        (levels[(runs[firstRun] as Run).logicalStart] as number) < maxLevel
      )
        ++firstRun;
      if (firstRun >= runCount) break;
      let limitRun = firstRun;
      while (
        ++limitRun < runCount &&
        (levels[(runs[limitRun] as Run).logicalStart] as number) >= maxLevel
      ) {
        /* Original scan. */
      }
      let endRun = limitRun - 1;
      while (firstRun < endRun) {
        const tempRun = runs[firstRun] as Run;
        runs[firstRun++] = runs[endRun] as Run;
        runs[endRun--] = tempRun;
      }
      if (limitRun === runCount) break;
      firstRun = limitRun + 1;
    }
  }
  if (!(minLevel & 1)) {
    let firstRun = 0;
    if (bidi.trailingWSStart === bidi.length) --runCount;
    while (firstRun < runCount) {
      const tempRun = runs[firstRun] as Run;
      runs[firstRun++] = runs[runCount] as Run;
      runs[runCount--] = tempRun;
    }
  }
}
/** Original run materialization. Native getRuns returns false on capacity failure without assigning the status; countRuns preserves that behavior. @param bidi - Valid actual owner. @returns Original success flag. */
function getRuns(bidi: UBiDi): boolean {
  if (bidi.runCount >= 0) return true;
  if (bidi.direction !== 2) getSingleRun(bidi, bidi.paraLevel);
  else {
    const length = bidi.length,
      levels = bidi.levels;
    let limit = bidi.trailingWSStart,
      runCount = 0,
      level = 0xfe;
    for (let index = 0; index < limit; index++) {
      if (levels[index] !== level) {
        ++runCount;
        level = levels[index] as number;
      }
    }
    if (runCount === 1 && limit === length) getSingleRun(bidi, levels[0] as number);
    else {
      if (limit < length) ++runCount;
      if (!bidi.runsMemory || runCount > bidi.runsMemory.length) {
        if (!bidi.mayAllocateRuns) return false;
        bidi.runsMemory = Array<Run>(runCount);
      }
      const runs = bidi.runsMemory;
      let runIndex = 0,
        minLevel = UBIDI_MAX_EXPLICIT_LEVEL + 1,
        maxLevel = 0,
        index = 0;
      do {
        const start = index;
        level = levels[index] as number;
        if (level < minLevel) minLevel = level;
        if (level > maxLevel) maxLevel = level;
        while (++index < limit && levels[index] === level) {
          /* Original scan. */
        }
        runs[runIndex++] = { logicalStart: start, visualLimit: index - start, insertRemove: 0 };
      } while (index < limit);
      if (limit < length) {
        runs[runIndex] = { logicalStart: limit, visualLimit: length - limit, insertRemove: 0 };
        if (bidi.paraLevel < minLevel) minLevel = bidi.paraLevel;
      }
      bidi.runs = runs;
      bidi.runCount = runCount;
      reorderLine(bidi, minLevel, maxLevel);
      limit = 0;
      for (index = 0; index < runCount; index++) {
        const run = runs[index] as Run;
        run.logicalStart |= ((levels[run.logicalStart] as number) & 1) << 31;
        limit += run.visualLimit;
        run.visualLimit = limit;
      }
      if (runIndex < runCount) {
        const trailingRun = bidi.paraLevel & 1 ? 0 : runIndex;
        (runs[trailingRun] as Run).logicalStart |= (bidi.paraLevel & 1) << 31;
      }
    }
  }
  return true;
}
/** Original countRuns status checks and lazy run materialization. @param bidi - Source owner. @param error - Source optional in/out status. @returns Original count or -1. */
export function ubidi_countRuns(bidi: UBiDi | null, error: [number] | null): number {
  if (!error || U_FAILURE(error[0])) return -1;
  if (!valid(bidi)) {
    error[0] = UErrorCode.U_INVALID_STATE_ERROR;
    return -1;
  }
  getRuns(bidi);
  if (U_FAILURE(error[0])) return -1;
  return bidi.runCount;
}
/** Original logical-position lookup through the actual visual-run vector. The source pointer must be nonnull; outputs are untouched for invalid positions/state. @param bidi - Source owner. @param logicalPosition - Original UTF16 position. @param logicalLimit - Optional out pointer. @param level - Optional out pointer. @returns Nothing. */
export function ubidi_getLogicalRun(
  bidi: UBiDi,
  logicalPosition: number,
  logicalLimit: [number] | null,
  level: [number] | null,
): void {
  const error: [number] = [UErrorCode.U_ZERO_ERROR];
  if (logicalPosition < 0 || logicalPosition >= bidi.length) return;
  const runCount = ubidi_countRuns(bidi, error);
  if (U_FAILURE(error[0])) return;
  let visualStart = 0,
    limit = 0;
  for (let index = 0; index < runCount; index++) {
    const run = bidi.runs[index] as Run,
      first = run.logicalStart & 0x7fffffff;
    limit = first + run.visualLimit - visualStart;
    if (logicalPosition >= first && logicalPosition < limit) break;
    visualStart = run.visualLimit;
  }
  if (logicalLimit) logicalLimit[0] = limit;
  if (level)
    level[0] =
      bidi.direction !== 2 || logicalPosition >= bidi.trailingWSStart
        ? bidi.paraLevel
        : (bidi.levels[logicalPosition] as number);
}
