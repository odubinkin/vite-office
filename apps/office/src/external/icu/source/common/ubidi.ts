/** @fileoverview Extracted ICU78.3 ubidi_setPara default-mode fixed-LTR/RTL,null-external-level path. Original explicit/implicit/bracket/whitespace decisions are retained;JS owns storage and lifetime. Other ICU bidi modes are not exposed by this slice. */
// Copyright Unicode, Inc. and others. Unicode License V3: https://www.unicode.org/license.txt
import * as D from "./ubidiimp.h";
import {
  L,
  R,
  EN,
  AN,
  AL,
  ON,
  NSM,
  S,
  WS,
  ENL,
  ENR,
  MASK_ISO,
  UBIDI_LEVEL_OVERRIDE,
  DIRPROP_FLAG,
  B,
  PDI,
  LRI,
  RLI,
  MASK_BN_EXPLICIT,
  type BidiState,
} from "./ubidiimp.h";
import { ubidi_getClass, ubidi_getPairedBracket, ubidi_getPairedBracketType } from "./ubidi_props";
/** Original pending opening value. */
interface Opening {
  position: number;
  match: number;
  contextDir: number;
  contextPos: number;
  flags: number;
}
/** Original isolate-run bracket state. */
interface IsoRun {
  start: number;
  limit: number;
  level: number;
  lastStrong: number;
  lastBase: number;
  contextDir: number;
  contextPos: number;
}
/** Actual default-mode bracket state; no alternate bidi algorithm is used. */
export interface BracketData {
  readonly bidi: BidiState;
  readonly isoRuns: IsoRun[];
  readonly openings: Opening[];
  isoRunLast: number;
}
/** Initializes the native bracket state for the first fixed-level paragraph. @param bidi - Actual resolver state. @returns Bracket state. */
function bracketInit(bidi: BidiState): BracketData {
  const level = bidi.paraLevel;
  return {
    bidi,
    isoRunLast: 0,
    openings: [],
    isoRuns: [
      {
        start: 0,
        limit: 0,
        level,
        lastStrong: level & 1,
        lastBase: level & 1,
        contextDir: level & 1,
        contextPos: 0,
      },
    ],
  };
}
/** Returns the actual current isolate value. @param bd - Bracket state. @returns Mutable current run. */
function lastRun(bd: BracketData): IsoRun {
  return bd.isoRuns[bd.isoRunLast] as IsoRun;
}
/** Original paragraph-boundary reset retains the base run's initial start. @param bd - Bracket state. @param level - Paragraph level. @returns Nothing. */
function bracketProcessB(bd: BracketData, level: number): void {
  bd.isoRunLast = 0;
  const run = lastRun(bd);
  run.limit = 0;
  run.level = level;
  run.lastStrong = run.lastBase = level & 1;
  run.contextDir = level & 1;
  run.contextPos = 0;
}
/** Original explicit boundary reset,including the preceding-isolate exception. @param bd - Bracket state. @param lastCcPos - Actual last control index. @param contextLevel - Previous context. @param embeddingLevel - Current embedding. @returns Nothing. */
function bracketProcessBoundary(
  bd: BracketData,
  lastCcPos: number,
  contextLevel: number,
  embeddingLevel: number,
): void {
  const run = lastRun(bd);
  if (DIRPROP_FLAG(bd.bidi.dirProps[lastCcPos] as number) & MASK_ISO) return;
  if ((embeddingLevel & ~UBIDI_LEVEL_OVERRIDE) > (contextLevel & ~UBIDI_LEVEL_OVERRIDE))
    contextLevel = embeddingLevel;
  run.limit = run.start;
  run.level = embeddingLevel;
  run.lastStrong = run.lastBase = contextLevel & 1;
  run.contextDir = contextLevel & 1;
  run.contextPos = lastCcPos;
}
/** Original isolate push. @param bd - Bracket state. @param level - New embedding level. @returns Nothing. */
function bracketProcessLRI_RLI(bd: BracketData, level: number): void {
  const run = lastRun(bd);
  run.lastBase = ON;
  const limit = run.limit;
  ++bd.isoRunLast;
  bd.isoRuns[bd.isoRunLast] = {
    start: limit,
    limit,
    level,
    lastStrong: level & 1,
    lastBase: level & 1,
    contextDir: level & 1,
    contextPos: 0,
  };
}
/** Original valid isolate pop. @param bd - Bracket state. @returns Nothing. */
function bracketProcessPDI(bd: BracketData): void {
  --bd.isoRunLast;
  lastRun(bd).lastBase = ON;
}
/** Original opening insertion; the native uint16 limit wrap is preserved. @param bd - Bracket state. @param match - Expected closing UTF16 value. @param position - Actual opening index. @returns Nothing. */
function bracketAddOpening(bd: BracketData, match: number, position: number): void {
  const run = lastRun(bd);
  bd.openings[run.limit] = {
    position,
    match,
    contextDir: run.contextDir,
    contextPos: run.contextPos,
    flags: 0,
  };
  run.limit = (run.limit + 1) & 0xffff;
}
/** Original recursive correction of context-dependent N0c pairs. @param bd - Bracket state. @param openingIndex - Newly resolved opening. @param newPropPosition - Context index. @param newProp - New L/R property. @returns Nothing. */
export function fixN0c(
  bd: BracketData,
  openingIndex: number,
  newPropPosition: number,
  newProp: number,
): void {
  const run = lastRun(bd),
    props = bd.bidi.dirProps;
  for (let k = openingIndex + 1; k < run.limit; ++k) {
    const opening = bd.openings[k] as Opening;
    if (opening.match >= 0) continue;
    if (newPropPosition < opening.contextPos) break;
    if (newPropPosition >= opening.position) continue;
    if (newProp === opening.contextDir) break;
    const openingPosition = opening.position,
      closingPosition = -opening.match;
    props[openingPosition] = newProp;
    props[closingPosition] = newProp;
    opening.match = 0;
    fixN0c(bd, k, openingPosition, newProp);
    fixN0c(bd, k, closingPosition, newProp);
  }
}
/** Original N0b/N0c/N0d resolution and synonym cleanup. @param bd - Bracket state. @param openIdx - Matched opening. @param position - Closing index. @returns L/R or ON for N0d. */
export function bracketProcessClosing(bd: BracketData, openIdx: number, position: number): number {
  const run = lastRun(bd),
    opening = bd.openings[openIdx] as Opening,
    direction = run.level & 1;
  let stable = true,
    newProp: number;
  if (
    (direction === 0 && opening.flags & (1 << L)) ||
    (direction === 1 && opening.flags & (1 << R))
  )
    newProp = direction;
  else if (opening.flags & ((1 << L) | (1 << R))) {
    stable = openIdx === run.start;
    newProp = direction !== opening.contextDir ? opening.contextDir : direction;
  } else {
    run.limit = openIdx & 0xffff;
    return ON;
  }
  bd.bidi.dirProps[opening.position] = newProp;
  bd.bidi.dirProps[position] = newProp;
  fixN0c(bd, openIdx, opening.position, newProp);
  if (stable) {
    run.limit = openIdx & 0xffff;
    while (
      run.limit > run.start &&
      (bd.openings[run.limit - 1] as Opening).position === opening.position
    )
      --run.limit;
  } else {
    opening.match = -position;
    let k = openIdx - 1;
    while (k >= run.start && (bd.openings[k] as Opening).position === opening.position)
      (bd.openings[k--] as Opening).match = 0;
    for (k = openIdx + 1; k < run.limit; ++k) {
      const q = bd.openings[k] as Opening;
      if (q.position >= position) break;
      if (q.match > 0) q.match = 0;
    }
  }
  return newProp;
}
/** Original strong/number/NSM/bracket processing,including bracket synonyms and overrides. JS arrays remove only allocation-failure branches. @param bd - Bracket state. @param position - Actual UTF16 index. @returns Nothing. */
function bracketProcessChar(bd: BracketData, position: number): void {
  const run = lastRun(bd),
    bidi = bd.bidi,
    props = bidi.dirProps,
    prop = props[position] as number;
  let newProp: number;
  if (prop === ON) {
    let c = bidi.text.charCodeAt(position);
    for (let idx = run.limit - 1; idx >= run.start; --idx) {
      const opening = bd.openings[idx] as Opening;
      if (opening.match !== c) continue;
      newProp = bracketProcessClosing(bd, idx, position);
      if (newProp === ON) {
        c = 0;
        break;
      }
      run.lastBase = ON;
      run.contextDir = newProp;
      run.contextPos = position;
      const level = bidi.levels[position] as number;
      if (level & UBIDI_LEVEL_OVERRIDE) {
        newProp = level & 1;
        run.lastStrong = newProp;
        const flag = DIRPROP_FLAG(newProp);
        for (let i = run.start; i < idx; ++i) (bd.openings[i] as Opening).flags |= flag;
        bidi.levels[position] = level & ~UBIDI_LEVEL_OVERRIDE;
      }
      bidi.levels[opening.position] =
        (bidi.levels[opening.position] as number) & ~UBIDI_LEVEL_OVERRIDE;
      return;
    }
    const match = c ? ubidi_getPairedBracket(c) & 0xffff : 0;
    if (match !== c && ubidi_getPairedBracketType(c) === 1) {
      if (match === 0x232a) bracketAddOpening(bd, 0x3009, position);
      else if (match === 0x3009) bracketAddOpening(bd, 0x232a, position);
      bracketAddOpening(bd, match, position);
    }
  }
  const level = bidi.levels[position] as number;
  if (level & UBIDI_LEVEL_OVERRIDE) {
    newProp = level & 1;
    if (prop !== S && prop !== WS && prop !== ON) props[position] = newProp;
    run.lastBase = run.lastStrong = newProp;
    run.contextDir = newProp;
    run.contextPos = position;
  } else if (prop <= R || prop === AL) {
    newProp = prop === L ? L : R;
    run.lastBase = run.lastStrong = prop;
    run.contextDir = newProp;
    run.contextPos = position;
  } else if (prop === EN) {
    run.lastBase = EN;
    if (run.lastStrong === L) {
      newProp = L;
      props[position] = ENL;
      run.contextDir = L;
      run.contextPos = position;
    } else {
      newProp = R;
      props[position] = run.lastStrong === AL ? AN : ENR;
      run.contextDir = R;
      run.contextPos = position;
    }
  } else if (prop === AN) {
    newProp = R;
    run.lastBase = AN;
    run.contextDir = R;
    run.contextPos = position;
  } else if (prop === NSM) {
    newProp = run.lastBase;
    if (newProp === ON) props[position] = newProp;
  } else {
    newProp = prop;
    run.lastBase = prop;
  }
  if (newProp <= R || newProp === AL) {
    const flag = DIRPROP_FLAG(newProp === L ? L : R);
    for (let i = run.start; i < run.limit; ++i)
      if (position > (bd.openings[i] as Opening).position)
        (bd.openings[i] as Opening).flags |= flag;
  }
}

const groupProp = [
  0, 1, 2, 7, 8, 3, 9, 6, 5, 4, 4, 10, 10, 12, 10, 10, 10, 11, 10, 4, 4, 4, 4, 13, 14,
];
const impTabProps = [
  [1, 2, 4, 5, 7, 15, 17, 7, 9, 7, 0, 7, 3, 18, 21, 4],
  [1, 34, 36, 37, 39, 47, 49, 39, 41, 39, 1, 1, 35, 50, 53, 0],
  [33, 2, 36, 37, 39, 47, 49, 39, 41, 39, 2, 2, 35, 50, 53, 1],
  [33, 34, 38, 38, 40, 48, 49, 40, 40, 40, 3, 3, 3, 50, 53, 1],
  [33, 34, 4, 37, 39, 47, 49, 74, 11, 74, 4, 4, 35, 18, 21, 2],
  [33, 34, 36, 5, 39, 47, 49, 39, 41, 76, 5, 5, 35, 50, 53, 3],
  [33, 34, 6, 6, 40, 48, 49, 40, 40, 77, 6, 6, 35, 18, 21, 3],
  [33, 34, 36, 37, 7, 47, 49, 7, 78, 7, 7, 7, 35, 50, 53, 4],
  [33, 34, 38, 38, 8, 48, 49, 8, 8, 8, 8, 8, 35, 50, 53, 4],
  [33, 34, 4, 37, 7, 47, 49, 7, 9, 7, 9, 9, 35, 18, 21, 4],
  [97, 98, 4, 101, 135, 111, 113, 135, 142, 135, 10, 135, 99, 18, 21, 2],
  [33, 34, 4, 37, 39, 47, 49, 39, 11, 39, 11, 11, 35, 18, 21, 2],
  [97, 98, 100, 5, 135, 111, 113, 135, 142, 135, 12, 135, 99, 114, 117, 3],
  [97, 98, 6, 6, 136, 112, 113, 136, 136, 136, 13, 136, 99, 18, 21, 3],
  [33, 34, 132, 37, 7, 47, 49, 7, 14, 7, 14, 14, 35, 146, 149, 4],
  [33, 34, 36, 37, 39, 15, 49, 39, 41, 39, 15, 39, 35, 50, 53, 5],
  [33, 34, 38, 38, 40, 16, 49, 40, 40, 40, 16, 40, 35, 50, 53, 5],
  [33, 34, 36, 37, 39, 47, 17, 39, 41, 39, 17, 39, 35, 50, 53, 6],
  [33, 34, 18, 37, 39, 47, 49, 83, 20, 83, 18, 18, 35, 18, 21, 0],
  [97, 98, 18, 101, 135, 111, 113, 135, 142, 135, 19, 135, 99, 18, 21, 0],
  [33, 34, 18, 37, 39, 47, 49, 39, 20, 39, 20, 20, 35, 18, 21, 0],
  [33, 34, 21, 37, 39, 47, 49, 86, 23, 86, 21, 21, 35, 18, 21, 3],
  [97, 98, 21, 101, 135, 111, 113, 135, 142, 135, 22, 135, 99, 18, 21, 3],
  [33, 34, 21, 37, 39, 47, 49, 39, 23, 39, 23, 23, 35, 18, 21, 3],
];
const impTabL_DEFAULT = [
  [0, 1, 0, 2, 0, 0, 0, 0],
  [0, 1, 3, 3, 20, 20, 0, 1],
  [0, 1, 0, 2, 21, 21, 0, 2],
  [0, 1, 3, 3, 20, 20, 0, 2],
  [0, 33, 51, 51, 4, 4, 0, 0],
  [0, 33, 0, 50, 5, 5, 0, 0],
];
const impTabR_DEFAULT = [
  [1, 0, 2, 2, 0, 0, 0, 0],
  [1, 0, 1, 3, 20, 20, 0, 1],
  [1, 0, 2, 2, 0, 0, 0, 1],
  [1, 0, 1, 3, 5, 5, 0, 1],
  [33, 0, 33, 3, 4, 4, 0, 0],
  [1, 0, 1, 3, 5, 5, 0, 0],
];
/** Original per-run level-state value. */
interface LevState {
  state: number;
  startON: number;
  runStart: number;
  runLevel: number;
  table: number[][];
}
/** Original source range assignment skips nested isolate contents. @param bidi - Actual resolver. @param start - Start index. @param limit - End index. @param level - Resolved level. @returns Nothing. */
function setLevelsOutsideIsolates(
  bidi: BidiState,
  start: number,
  limit: number,
  level: number,
): void {
  let isolateCount = 0;
  for (let k = start; k < limit; ++k) {
    const prop = bidi.dirProps[k];
    if (prop === PDI) --isolateCount;
    if (isolateCount === 0) bidi.levels[k] = level;
    if (prop === LRI || prop === RLI) ++isolateCount;
  }
}
/** Original default-table property sequence operation; only source impAct0 actions are reachable for default mode. @param bidi - Actual resolver. @param state - Current run state. @param prop - Reduced property. @param start - Sequence start. @param limit - Sequence end. @returns Nothing. */
function processPropertySeq(
  bidi: BidiState,
  state: LevState,
  prop: number,
  start: number,
  limit: number,
): void {
  const start0 = start,
    cell = (state.table[state.state] as number[])[prop] as number;
  state.state = cell & 0xf;
  const action = cell >> 4,
    addLevel = (state.table[state.state] as number[])[7] as number;
  switch (action) {
    case 1:
      state.startON = start0;
      break;
    case 2:
      start = state.startON;
      break;
    case 3:
      setLevelsOutsideIsolates(bidi, state.startON, start0, state.runLevel + 1);
      break;
  }
  if (addLevel || start < start0) {
    const level = state.runLevel + addLevel;
    if (start >= state.runStart) {
      for (let k = start; k < limit; ++k) bidi.levels[k] = level;
    } else setLevelsOutsideIsolates(bidi, start, limit, level);
  }
}
/** Original default-mode property/level state machines,including isolate suspend/resume and terminal forcing. No external context or inverse mode is fabricated. @param bidi - Actual resolver. @param start - Same-level-run start. @param limit - Same-level-run end. @param sor - Starting direction. @param eor - Ending direction. @returns Nothing. */
function resolveImplicitLevels(
  bidi: BidiState,
  start: number,
  limit: number,
  sor: number,
  eor: number,
): void {
  const props = bidi.dirProps,
    runLevel = bidi.levels[start] as number;
  const state: LevState = {
    runStart: start,
    runLevel,
    table: runLevel & 1 ? impTabR_DEFAULT : impTabL_DEFAULT,
    state: 0,
    startON: -1,
  };
  let start1: number, stateImp: number;
  if (props[start] === PDI && bidi.isolateCount >= 0) {
    const saved = bidi.isolates[bidi.isolateCount] as BidiState["isolates"][number];
    state.startON = saved.startON;
    start1 = saved.start1;
    stateImp = saved.stateImp;
    state.state = saved.state;
    --bidi.isolateCount;
  } else {
    start1 = start;
    stateImp = props[start] === NSM ? 1 + sor : 0;
    processPropertySeq(bidi, state, sor, start, start);
  }
  let start2 = start;
  for (let i = start; i <= limit; ++i) {
    let gprop: number;
    if (i >= limit) {
      let k = limit - 1;
      for (; k > start && DIRPROP_FLAG(props[k] as number) & MASK_BN_EXPLICIT; --k) {
        /* Original cursor-only scan. */
      }
      const prop = props[k];
      if (prop === LRI || prop === RLI) break;
      gprop = eor;
    } else {
      const prop = props[i] as number;
      if (prop === B) bidi.isolateCount = -1;
      gprop = groupProp[prop] as number;
    }
    const oldState = stateImp,
      cell = (impTabProps[oldState] as number[])[gprop] as number;
    stateImp = cell & 0x1f;
    let action = cell >> 5;
    if (i === limit && action === 0) action = 1;
    if (action) {
      const resProp = (impTabProps[oldState] as number[])[15] as number;
      switch (action) {
        case 1:
          processPropertySeq(bidi, state, resProp, start1, i);
          start1 = i;
          break;
        case 2:
          start2 = i;
          break;
        case 3:
          processPropertySeq(bidi, state, resProp, start1, start2);
          processPropertySeq(bidi, state, 4, start2, i);
          start1 = i;
          break;
        case 4:
          processPropertySeq(bidi, state, resProp, start1, start2);
          start1 = start2;
          start2 = i;
          break;
      }
    }
  }
  let i = limit - 1;
  for (; i > start && DIRPROP_FLAG(props[i] as number) & MASK_BN_EXPLICIT; --i) {
    /* Original cursor-only scan. */
  }
  const prop = props[i];
  if ((prop === LRI || prop === RLI) && limit < bidi.text.length) {
    ++bidi.isolateCount;
    bidi.isolates[bidi.isolateCount] = {
      stateImp,
      state: state.state,
      start1,
      startON: state.startON,
    };
  } else processPropertySeq(bidi, state, eor, limit, limit);
}

/** Original getDirProps fixed paragraph-level path with FSI lookahead and UTF16 lead-surrogate BN assignment. @param bidi - Actual resolver state. @returns Nothing. */
function getDirProps(bidi: D.BidiState): void {
  let flags = 0,
    state = 0,
    stackLast = -1;
  const starts: number[] = [],
    states: number[] = [],
    text = bidi.text,
    props = bidi.dirProps;
  for (let i = 0; i < text.length;) {
    const c = text.codePointAt(i) as number;
    i += c > 0xffff ? 2 : 1;
    const prop = ubidi_getClass(c);
    flags |= D.DIRPROP_FLAG(prop);
    props[i - 1] = prop;
    if (c > 0xffff) {
      flags |= 1 << D.BN;
      props[i - 2] = D.BN;
    }
    if (prop === D.L) {
      if (state === 2) {
        if (stackLast <= D.UBIDI_MAX_EXPLICIT_LEVEL) flags |= 1 << D.LRI;
        state = 3;
      }
      continue;
    }
    if (prop === D.R || prop === D.AL) {
      if (state === 2) {
        if (stackLast <= D.UBIDI_MAX_EXPLICIT_LEVEL) {
          props[starts[stackLast] as number] = D.RLI;
          flags |= 1 << D.RLI;
        }
        state = 3;
      }
      continue;
    }
    if (prop >= D.FSI && prop <= D.RLI) {
      ++stackLast;
      if (stackLast <= D.UBIDI_MAX_EXPLICIT_LEVEL) {
        starts[stackLast] = i - 1;
        states[stackLast] = state;
      }
      if (prop === D.FSI) {
        props[i - 1] = D.LRI;
        state = 2;
      } else state = 3;
      continue;
    }
    if (prop === D.PDI) {
      if (state === 2 && stackLast <= D.UBIDI_MAX_EXPLICIT_LEVEL) flags |= 1 << D.LRI;
      if (stackLast >= 0) {
        if (stackLast <= D.UBIDI_MAX_EXPLICIT_LEVEL) state = states[stackLast] as number;
        --stackLast;
      }
      continue;
    }
    if (prop === D.B) {
      if (i < text.length && c === 13 && text.charCodeAt(i) === 10) continue;
      (bidi.paras[bidi.paras.length - 1] as D.BidiState["paras"][number]).limit = i;
      if (i < text.length) {
        bidi.paras.push({ limit: 0, level: bidi.paraLevel });
        state = 0;
        stackLast = -1;
      }
    }
  }
  if (stackLast > D.UBIDI_MAX_EXPLICIT_LEVEL) {
    stackLast = D.UBIDI_MAX_EXPLICIT_LEVEL;
    state = 2;
  }
  while (stackLast >= 0) {
    if (state === 2) {
      flags |= 1 << D.LRI;
      break;
    }
    state = states[stackLast] as number;
    --stackLast;
  }
  (bidi.paras[bidi.paras.length - 1] as D.BidiState["paras"][number]).limit = text.length;
  for (const para of bidi.paras) flags |= D.DIRPROP_FLAG(para.level & 1);
  bidi.flags = flags;
}
/** Original directionFromFlags decision. @param flags - Collected properties. @returns LTR,RTL or MIXED. */
function directionFromFlags(flags: number): number {
  if (!(flags & D.MASK_RTL || (flags & (1 << D.AN) && flags & D.MASK_POSSIBLE_N))) return 0;
  if (!(flags & D.MASK_LTR)) return 1;
  return 2;
}
/** Original default-mode X1..X9 and bracket processing with valid/overflow isolate and embedding stacks. @param bidi - Actual resolver. @returns Resolved direction. */
export function resolveExplicitLevels(bidi: D.BidiState): number {
  let direction = directionFromFlags(bidi.flags);
  bidi.isolateCount = 0;
  if (direction !== 2) return direction;
  const props = bidi.dirProps,
    levels = bidi.levels,
    text = bidi.text,
    length = text.length;
  const bd = bracketInit(bidi);
  let flags = bidi.flags;
  if (!(flags & (D.MASK_EXPLICIT | D.MASK_ISO))) {
    for (let i = 0; i < length; ++i) {
      levels[i] = bidi.paraLevel;
      const prop = props[i];
      if (prop === D.BN) continue;
      if (prop === D.B) {
        if (i + 1 < length) {
          if (text.charCodeAt(i) === 13 && text.charCodeAt(i + 1) === 10) continue;
          bracketProcessB(bd, bidi.paraLevel);
        }
        continue;
      }
      bracketProcessChar(bd, i);
    }
    return direction;
  }
  let embeddingLevel: number = bidi.paraLevel,
    previousLevel: number = bidi.paraLevel,
    lastCcPos = 0,
    stackLast = 0;
  let overflowIsolateCount = 0,
    overflowEmbeddingCount = 0,
    validIsolateCount = 0;
  const stack: number[] = [bidi.paraLevel];
  flags = 0;
  for (let i = 0; i < length; ++i) {
    const prop = props[i];
    let newLevel: number;
    switch (prop) {
      case D.LRE:
      case D.RLE:
      case D.LRO:
      case D.RLO:
        flags |= 1 << D.BN;
        levels[i] = previousLevel;
        newLevel =
          prop === D.LRE || prop === D.LRO
            ? (embeddingLevel + 2) & ~(D.UBIDI_LEVEL_OVERRIDE | 1)
            : ((embeddingLevel & ~D.UBIDI_LEVEL_OVERRIDE) + 1) | 1;
        if (
          newLevel <= D.UBIDI_MAX_EXPLICIT_LEVEL &&
          overflowIsolateCount === 0 &&
          overflowEmbeddingCount === 0
        ) {
          lastCcPos = i;
          embeddingLevel = newLevel;
          if (prop === D.LRO || prop === D.RLO) embeddingLevel |= D.UBIDI_LEVEL_OVERRIDE;
          stack[++stackLast] = embeddingLevel;
        } else if (overflowIsolateCount === 0) ++overflowEmbeddingCount;
        break;
      case D.PDF:
        flags |= 1 << D.BN;
        levels[i] = previousLevel;
        if (overflowIsolateCount) break;
        if (overflowEmbeddingCount) {
          --overflowEmbeddingCount;
          break;
        }
        if (stackLast > 0 && (stack[stackLast] as number) < D.ISOLATE) {
          lastCcPos = i;
          embeddingLevel = (stack[--stackLast] as number) & 0xff;
        }
        break;
      case D.LRI:
      case D.RLI:
        flags |= (1 << D.ON) | D.DIRPROP_FLAG(embeddingLevel & 1);
        levels[i] = embeddingLevel & ~D.UBIDI_LEVEL_OVERRIDE;
        if (
          (embeddingLevel & ~D.UBIDI_LEVEL_OVERRIDE) !==
          (previousLevel & ~D.UBIDI_LEVEL_OVERRIDE)
        ) {
          bracketProcessBoundary(bd, lastCcPos, previousLevel, embeddingLevel);
          flags |= D.DIRPROP_FLAG_MULTI_RUNS;
        }
        previousLevel = embeddingLevel;
        newLevel =
          prop === D.LRI
            ? (embeddingLevel + 2) & ~(D.UBIDI_LEVEL_OVERRIDE | 1)
            : ((embeddingLevel & ~D.UBIDI_LEVEL_OVERRIDE) + 1) | 1;
        if (
          newLevel <= D.UBIDI_MAX_EXPLICIT_LEVEL &&
          overflowIsolateCount === 0 &&
          overflowEmbeddingCount === 0
        ) {
          flags |= D.DIRPROP_FLAG(prop);
          lastCcPos = i;
          ++validIsolateCount;
          if (validIsolateCount > bidi.isolateCount) bidi.isolateCount = validIsolateCount;
          embeddingLevel = newLevel;
          stack[++stackLast] = embeddingLevel + D.ISOLATE;
          bracketProcessLRI_RLI(bd, embeddingLevel);
        } else {
          props[i] = D.WS;
          ++overflowIsolateCount;
        }
        break;
      case D.PDI:
        if (
          (embeddingLevel & ~D.UBIDI_LEVEL_OVERRIDE) !==
          (previousLevel & ~D.UBIDI_LEVEL_OVERRIDE)
        ) {
          bracketProcessBoundary(bd, lastCcPos, previousLevel, embeddingLevel);
          flags |= D.DIRPROP_FLAG_MULTI_RUNS;
        }
        if (overflowIsolateCount) {
          --overflowIsolateCount;
          props[i] = D.WS;
        } else if (validIsolateCount) {
          flags |= 1 << D.PDI;
          lastCcPos = i;
          overflowEmbeddingCount = 0;
          while ((stack[stackLast] as number) < D.ISOLATE) --stackLast;
          --stackLast;
          --validIsolateCount;
          bracketProcessPDI(bd);
        } else props[i] = D.WS;
        embeddingLevel = (stack[stackLast] as number) & ~D.ISOLATE;
        flags |= (1 << D.ON) | D.DIRPROP_FLAG(embeddingLevel & 1);
        previousLevel = embeddingLevel;
        levels[i] = embeddingLevel & ~D.UBIDI_LEVEL_OVERRIDE;
        break;
      case D.B:
        flags |= 1 << D.B;
        levels[i] = bidi.paraLevel;
        if (i + 1 < length) {
          if (text.charCodeAt(i) === 13 && text.charCodeAt(i + 1) === 10) break;
          overflowEmbeddingCount = overflowIsolateCount = validIsolateCount = stackLast = 0;
          previousLevel = embeddingLevel = bidi.paraLevel;
          stack[0] = embeddingLevel;
          bracketProcessB(bd, embeddingLevel);
        }
        break;
      case D.BN:
        levels[i] = previousLevel;
        flags |= 1 << D.BN;
        break;
      default:
        if (
          (embeddingLevel & ~D.UBIDI_LEVEL_OVERRIDE) !==
          (previousLevel & ~D.UBIDI_LEVEL_OVERRIDE)
        ) {
          bracketProcessBoundary(bd, lastCcPos, previousLevel, embeddingLevel);
          flags |= D.DIRPROP_FLAG_MULTI_RUNS;
          flags |= D.DIRPROP_FLAG(
            embeddingLevel & D.UBIDI_LEVEL_OVERRIDE
              ? embeddingLevel & 1
                ? D.RLO
                : D.LRO
              : embeddingLevel & 1
                ? D.RLE
                : D.LRE,
          );
        }
        previousLevel = embeddingLevel;
        levels[i] = embeddingLevel;
        bracketProcessChar(bd, i);
        flags |= D.DIRPROP_FLAG(props[i] as number);
        break;
    }
  }
  if (flags & D.MASK_EMBEDDING) flags |= D.DIRPROP_FLAG(bidi.paraLevel & 1);
  bidi.flags = flags;
  direction = directionFromFlags(flags);
  return direction;
}
/** Original L1/X9 whitespace and removed-control level assignment for default paragraph ordering. @param bidi - Actual resolver. @returns Nothing. */
function adjustWSLevels(bidi: D.BidiState): void {
  if (!(bidi.flags & D.MASK_WS)) return;
  let i = bidi.text.length;
  while (i > 0) {
    while (i > 0 && D.DIRPROP_FLAG(bidi.dirProps[--i] as number) & D.MASK_WS)
      bidi.levels[i] = bidi.paraLevel;
    while (i > 0) {
      const flag = D.DIRPROP_FLAG(bidi.dirProps[--i] as number);
      if (flag & D.MASK_BN_EXPLICIT) bidi.levels[i] = bidi.levels[i + 1] as number;
      else if (flag & D.MASK_B_S) {
        bidi.levels[i] = bidi.paraLevel;
        break;
      }
    }
  }
}
/** Consumed ubidi_setPara path:default reordering,fixed initial0/1,no external levels,context or callbacks. Returns the actual per-UTF16 levels used by LO's direction scanner;allocation/service APIs and visual reordering are not exposed. @param text - Actual UTF16 text,including embedded NUL. @param paraLevel - Explicit initial direction from the owning paragraph. @returns Resolved levels. */
export function resolveDefaultBidiLevels(text: string, paraLevel: 0 | 1): readonly number[] {
  if (text.length === 0) return [];
  const bidi: D.BidiState = {
    text,
    paraLevel,
    dirProps: [],
    levels: Array<number>(text.length).fill(0),
    paras: [{ limit: 0, level: paraLevel }],
    flags: 0,
    isolateCount: 0,
    isolates: [],
  };
  getDirProps(bidi);
  const direction = resolveExplicitLevels(bidi);
  bidi.isolateCount = -1;
  if (direction !== 2)
    return bidi.levels.fill(direction === 0 ? (paraLevel + 1) & ~1 : paraLevel | 1);
  resolveImplicitRuns(bidi);
  adjustWSLevels(bidi);
  return bidi.levels;
}

/** Original default-table same-level-run dispatch extracted from ubidi_setPara. A valid nonempty initialized native state is required. The public consumed wrapper fixes initial0/1 and null external levels;direct internal tests also retain branches for externally prepared native states that this wrapper cannot construct. @param bidi - Initialized source state. @returns Nothing. */
export function resolveImplicitRuns(bidi: BidiState): void {
  const { text, paraLevel } = bidi;
  const props = bidi.dirProps,
    levels = bidi.levels,
    length = text.length;
  if (bidi.paras.length <= 1 && !(bidi.flags & D.DIRPROP_FLAG_MULTI_RUNS))
    resolveImplicitLevels(bidi, 0, length, paraLevel & 1, paraLevel & 1);
  else {
    let limit = 0,
      nextLevel = levels[0] as number;
    let eor = (paraLevel < nextLevel ? nextLevel : paraLevel) & 1;
    do {
      let start = limit;
      const level = nextLevel,
        sor = start > 0 && props[start - 1] === D.B ? paraLevel & 1 : eor;
      while (
        ++limit < length &&
        (levels[limit] === level || D.DIRPROP_FLAG(props[limit] as number) & D.MASK_BN_EXPLICIT)
      ) {
        /* Original same-level run scan. */
      }
      nextLevel = limit < length ? (levels[limit] as number) : paraLevel;
      eor =
        ((level & ~D.UBIDI_LEVEL_OVERRIDE) < (nextLevel & ~D.UBIDI_LEVEL_OVERRIDE)
          ? nextLevel
          : level) & 1;
      if (!(level & D.UBIDI_LEVEL_OVERRIDE)) resolveImplicitLevels(bidi, start, limit, sor, eor);
      else {
        do {
          levels[start] = (levels[start] as number) & ~D.UBIDI_LEVEL_OVERRIDE;
          ++start;
        } while (start < limit);
      }
    } while (limit < length);
  }
}
