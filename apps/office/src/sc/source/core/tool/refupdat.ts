/** @fileoverview Original Calc reference transpose and area-growth geometry, reusing existing coordinate owners. */
import { ScAddress, ScRange } from "../../../inc/address";
import { ScBigRange } from "../../../inc/bigrange";
import { UpdateRefMode } from "../../../inc/global";
import type { SCCOL, SCROW, SCTAB } from "../../../inc/types";
import type { ScAddressDocument } from "./address";
import type { ScComplexRefData, ScReferenceDocument } from "./refdata";
import { ScRefUpdateRes } from "../inc/refupdat";

/** Existing numerical document getter view plus the original expansion policy getter. */
export interface ScRefUpdateDocument extends ScAddressDocument {
  /** Reads current document reference expansion policy. @returns Whether insertion expands adjacent references. */
  IsExpandRefs(): boolean;
}

/** Original ordinary-coordinate scalar argument list for TS overload dispatch. */
type OrdinaryUpdateArgs = [
  ScRefUpdateDocument,
  UpdateRefMode,
  SCCOL,
  SCROW,
  SCTAB,
  SCCOL,
  SCROW,
  SCTAB,
  SCCOL,
  SCROW,
  SCTAB,
  SCCOL,
  SCROW,
  SCTAB,
  SCCOL,
  SCROW,
  SCTAB,
];
/** Original big-range argument list, with native signed32 displacement inputs. */
type BigUpdateArgs = [UpdateRefMode, ScBigRange, number, number, number, ScBigRange];

/** Detects the original signed64 addition boundary before arithmetic. @param ref - Raw signed64 coordinate. @param delta - Signed32 displacement. @returns Whether addition crosses a signed64 boundary. */
function lcl_IsWrapBig(ref: bigint, delta: number): boolean {
  if (delta > 0) return ref > ScBigRange.nRangeMax - BigInt(delta);
  return ref < ScBigRange.nRangeMin - BigInt(delta);
}

/** Moves a big coordinate at/after a boundary, saturating only native guarded positive overflow. @param ref - Raw coordinate. @param start - Boundary. @param delta - Signed32 displacement. @returns Coordinate and saturation flag. */
function lcl_MoveBig(ref: bigint, start: bigint, delta: number): [bigint, boolean] {
  let cut = false;
  if (ref >= start) {
    if (delta > 0) cut = lcl_IsWrapBig(ref, delta);
    if (cut) ref = ScBigRange.nRangeMax;
    else ref += BigInt(delta);
  }
  return [ref, cut];
}

/** Preserves native defined big movement and its pre-addition boundary flag. @param ref - Raw coordinate. @param delta - Signed32 displacement whose addition must be defined. @returns Coordinate and boundary flag. */
function lcl_MoveItCutBig(ref: bigint, delta: number): [bigint, boolean] {
  const cut = lcl_IsWrapBig(ref, delta);
  return [ref + BigInt(delta), cut];
}

/** Represents template destination widths for native static casts and compound assignment. @param value - Defined arithmetic result. @param width - Native destination width. @returns Narrowed signed coordinate. */
function narrowCoordinate(value: number, width: 16 | 32): number {
  return width === 16 ? (value << 16) >> 16 : value | 0;
}

/** Moves a starting coordinate with the original deletion shrink and clipping order. @param ref - Raw coordinate. @param start - Insertion/deletion boundary. @param delta - Displacement. @param mask - Inclusive maximum. @param width - Native template destination width. @param shrink - Whether deletion shrinks this axis. @returns Updated coordinate and clipping flag. */
function lcl_MoveStart(
  ref: number,
  start: number,
  delta: number,
  mask: number,
  width: 16 | 32,
  shrink = true,
): [number, boolean] {
  if (ref >= start) ref = narrowCoordinate(ref + delta, width);
  else if (delta < 0 && shrink && ref >= start + delta)
    ref = narrowCoordinate(start + delta, width);
  if (ref < 0) return [0, true];
  if (ref > mask) return [mask, true];
  return [ref, false];
}

/** Moves an ending coordinate with the original one-before-boundary deletion shrink. @param ref - Raw coordinate. @param start - Insertion/deletion boundary. @param delta - Displacement. @param mask - Inclusive maximum. @param width - Native template destination width. @param shrink - Whether deletion shrinks this axis. @returns Updated coordinate and clipping flag. */
function lcl_MoveEnd(
  ref: number,
  start: number,
  delta: number,
  mask: number,
  width: 16 | 32,
  shrink = true,
): [number, boolean] {
  if (ref >= start) ref = narrowCoordinate(ref + delta, width);
  else if (delta < 0 && shrink && ref >= start + delta)
    ref = narrowCoordinate(start + delta - 1, width);
  if (ref < 0) return [0, true];
  if (ref > mask) return [mask, true];
  return [ref, false];
}

/** Reorders a sheet coordinate and intervening sheets in original movement direction. @param ref - Raw sheet. @param start - Moved start sheet. @param end - Moved end sheet. @param delta - Sheet displacement. @returns Updated coordinate and changed flag. */
function lcl_MoveReorder(ref: SCTAB, start: SCTAB, end: SCTAB, delta: SCTAB): [SCTAB, boolean] {
  if (ref >= start && ref <= end) return [narrowCoordinate(ref + delta, 16), true];
  if (delta > 0) {
    if (ref >= start && ref <= end + delta) {
      // Initial return excludes ref <= end here; native inner moved-range branch cannot execute.
      return [narrowCoordinate(ref - (end - start + 1), 16), true];
    }
  } else if (ref >= start + delta && ref <= end) {
    // Initial return excludes ref >= start here; only the native intervening-sheet branch remains.
    return [narrowCoordinate(ref + end - start + 1, 16), true];
  }
  return [ref, false];
}

/** Moves and clips a raw coordinate. @param ref - Raw coordinate. @param delta - Displacement. @param mask - Inclusive maximum. @param width - Native destination width. @returns Updated coordinate and clipping flag. */
function lcl_MoveItCut(
  ref: number,
  delta: number,
  mask: number,
  width: 16 | 32,
): [number, boolean] {
  ref = narrowCoordinate(ref + delta, width);
  if (ref < 0) return [0, true];
  if (ref > mask) return [mask, true];
  return [ref, false];
}

/** Checks the original insertion expansion predicate before movement. @param first - Starting coordinate. @param last - Ending coordinate. @param start - Insertion boundary. @param delta - Displacement. @returns Whether insertion expands this range. */
function IsExpand(first: number, last: number, start: number, delta: number): boolean {
  return (
    delta > 0 && first < last && ((start <= first && first < start + delta) || last + 1 === start)
  );
}

/** Expands the original selected endpoint after movement. @param first - Moved start coordinate. @param last - Moved end coordinate. @param start - Insertion boundary. @param delta - Displacement. @param width - Native destination width. @returns Expanded endpoint pair. */
function Expand(
  first: number,
  last: number,
  start: number,
  delta: number,
  width: 16 | 32,
): [number, number] {
  if (last + 1 === start) return [first, narrowCoordinate(last + delta, width)];
  return [narrowCoordinate(first - delta, width), last];
}

/** Wraps once at the original mask; callers retain native coordinate widths through address assignment. @param ref - Already narrowed native coordinate. @param mask - Inclusive wrap maximum. @returns Coordinate after a single boundary crossing. */
function lcl_MoveItWrap(ref: number, mask: number): number {
  if (ref < 0) return ref + mask + 1;
  if (ref > mask) return ref - mask - 1;
  return ref;
}

/** Original static reference-update owner; numerical methods retain their native source responsibilities. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Original ScRefUpdate owns static operations at this public boundary.
export class ScRefUpdate {
  /** Updates the original big-range overload in place without document clipping. @param mode - Update mode. @param where - Area. @param dx - Signed32 column displacement. @param dy - Signed32 row displacement. @param dz - Signed32 sheet displacement. @param what - Receiving range. @returns Original update result. */
  public static Update(
    mode: UpdateRefMode,
    where: ScBigRange,
    dx: number,
    dy: number,
    dz: number,
    what: ScBigRange,
  ): ScRefUpdateRes;
  /** Updates original raw reference coordinates in axis order with native status precedence. @param doc - Document getter view. @param mode - Original update mode. @param col1 - Area start column. @param row1 - Area start row. @param tab1 - Area start sheet. @param col2 - Area end column. @param row2 - Area end row. @param tab2 - Area end sheet. @param dx - Column displacement. @param dy - Row displacement. @param dz - Sheet displacement. @param refCol1 - Reference start column. @param refRow1 - Reference start row. @param refTab1 - Reference start sheet. @param refCol2 - Reference end column. @param refRow2 - Reference end row. @param refTab2 - Reference end sheet. @returns Original result followed by native output-reference coordinates. */
  public static Update(
    doc: ScRefUpdateDocument,
    mode: UpdateRefMode,
    col1: SCCOL,
    row1: SCROW,
    tab1: SCTAB,
    col2: SCCOL,
    row2: SCROW,
    tab2: SCTAB,
    dx: SCCOL,
    dy: SCROW,
    dz: SCTAB,
    refCol1: SCCOL,
    refRow1: SCROW,
    refTab1: SCTAB,
    refCol2: SCCOL,
    refRow2: SCROW,
    refTab2: SCTAB,
  ): [ScRefUpdateRes, SCCOL, SCROW, SCTAB, SCCOL, SCROW, SCTAB];
  /** Dispatches the original native overloads by their distinct first argument. @param args - Native ordinary or big-range scalar parameters. @returns Native result or result/output-coordinate tuple. */
  public static Update(
    ...args: OrdinaryUpdateArgs | BigUpdateArgs
  ): ScRefUpdateRes | [ScRefUpdateRes, SCCOL, SCROW, SCTAB, SCCOL, SCROW, SCTAB] {
    if (typeof args[0] === "number") {
      const [mode, where, rawDx, rawDy, rawDz, what] = args as BigUpdateArgs;
      const dx = rawDx | 0,
        dy = rawDy | 0,
        dz = rawDz | 0;
      let result = ScRefUpdateRes.UR_NOTHING;
      const oldRange = new ScBigRange(what);
      const [col1, row1, tab1, col2, row2, tab2] = where.GetVars();
      let [refCol1, refRow1, refTab1, refCol2, refRow2, refTab2] = what.GetVars();
      let cut1: boolean, cut2: boolean;
      if (mode === UpdateRefMode.URM_INSDEL) {
        if (
          dx &&
          refRow1 >= row1 &&
          refRow2 <= row2 &&
          refTab1 >= tab1 &&
          refTab2 <= tab2 &&
          (refCol1 !== ScBigRange.nRangeMin || refCol2 !== ScBigRange.nRangeMax)
        ) {
          [refCol1, cut1] = lcl_MoveBig(refCol1, col1, dx);
          [refCol2, cut2] = lcl_MoveBig(refCol2, col1, dx);
          if (cut1 || cut2) result = ScRefUpdateRes.UR_UPDATED;
          what.aStart.SetCol(refCol1);
          what.aEnd.SetCol(refCol2);
        }
        if (
          dy &&
          refCol1 >= col1 &&
          refCol2 <= col2 &&
          refTab1 >= tab1 &&
          refTab2 <= tab2 &&
          (refRow1 !== ScBigRange.nRangeMin || refRow2 !== ScBigRange.nRangeMax)
        ) {
          [refRow1, cut1] = lcl_MoveBig(refRow1, row1, dy);
          [refRow2, cut2] = lcl_MoveBig(refRow2, row1, dy);
          if (cut1 || cut2) result = ScRefUpdateRes.UR_UPDATED;
          what.aStart.SetRow(refRow1);
          what.aEnd.SetRow(refRow2);
        }
        if (
          dz &&
          refCol1 >= col1 &&
          refCol2 <= col2 &&
          refRow1 >= row1 &&
          refRow2 <= row2 &&
          (refTab1 !== ScBigRange.nRangeMin || refTab2 !== ScBigRange.nRangeMax)
        ) {
          [refTab1, cut1] = lcl_MoveBig(refTab1, tab1, dz);
          [refTab2, cut2] = lcl_MoveBig(refTab2, tab1, dz);
          if (cut1 || cut2) result = ScRefUpdateRes.UR_UPDATED;
          what.aStart.SetTab(refTab1);
          what.aEnd.SetTab(refTab2);
        }
      } else if (mode === UpdateRefMode.URM_MOVE) {
        if (where.Contains(what)) {
          // Native cut=true implies signed64 overflow in the following +=, which is undefined.
          // On every defined Move input both cuts are false; final range comparison supplies UPDATED.
          if (dx && (refCol1 !== ScBigRange.nRangeMin || refCol2 !== ScBigRange.nRangeMax)) {
            [refCol1] = lcl_MoveItCutBig(refCol1, dx);
            [refCol2] = lcl_MoveItCutBig(refCol2, dx);
            what.aStart.SetCol(refCol1);
            what.aEnd.SetCol(refCol2);
          }
          if (dy && (refRow1 !== ScBigRange.nRangeMin || refRow2 !== ScBigRange.nRangeMax)) {
            [refRow1] = lcl_MoveItCutBig(refRow1, dy);
            [refRow2] = lcl_MoveItCutBig(refRow2, dy);
            what.aStart.SetRow(refRow1);
            what.aEnd.SetRow(refRow2);
          }
          if (dz && (refTab1 !== ScBigRange.nRangeMin || refTab2 !== ScBigRange.nRangeMax)) {
            [refTab1] = lcl_MoveItCutBig(refTab1, dz);
            [refTab2] = lcl_MoveItCutBig(refTab2, dz);
            what.aStart.SetTab(refTab1);
            what.aEnd.SetTab(refTab2);
          }
        }
      }
      if (result === ScRefUpdateRes.UR_NOTHING && !what.equals(oldRange))
        result = ScRefUpdateRes.UR_UPDATED;
      return result;
    }
    const [doc, mode, col1, row1, tab1, col2, row2, tab2, dx, dy, dz] = args as OrdinaryUpdateArgs;
    let [, , , , , , , , , , , refCol1, refRow1, refTab1, refCol2, refRow2, refTab2] =
      args as OrdinaryUpdateArgs;
    let result = ScRefUpdateRes.UR_NOTHING;
    const oldCol1 = refCol1,
      oldRow1 = refRow1,
      oldTab1 = refTab1,
      oldCol2 = refCol2,
      oldRow2 = refRow2,
      oldTab2 = refTab2;
    let cut1: boolean, cut2: boolean;
    if (mode === UpdateRefMode.URM_INSDEL) {
      const expand = doc.IsExpandRefs();
      if (dx && refRow1 >= row1 && refRow2 <= row2 && refTab1 >= tab1 && refTab2 <= tab2) {
        const exp = expand && IsExpand(refCol1, refCol2, col1, dx);
        [refCol1, cut1] = lcl_MoveStart(refCol1, col1, dx, doc.MaxCol(), 16);
        [refCol2, cut2] = lcl_MoveEnd(refCol2, col1, dx, doc.MaxCol(), 16);
        if (refCol2 < refCol1) {
          result = ScRefUpdateRes.UR_INVALID;
          refCol2 = refCol1;
        } else if (cut2 && refCol2 === 0) result = ScRefUpdateRes.UR_INVALID;
        else if (cut1 || cut2) result = ScRefUpdateRes.UR_UPDATED;
        if (exp) {
          [refCol1, refCol2] = Expand(refCol1, refCol2, col1, dx, 16);
          result = ScRefUpdateRes.UR_UPDATED;
        }
        if (result !== ScRefUpdateRes.UR_NOTHING && oldCol1 === 0 && oldCol2 === doc.MaxCol()) {
          result = ScRefUpdateRes.UR_STICKY;
          refCol1 = oldCol1;
          refCol2 = oldCol2;
        } else if (oldCol2 === doc.MaxCol() && oldCol1 < doc.MaxCol()) {
          refCol2 = oldCol2;
          if (result === ScRefUpdateRes.UR_NOTHING) result = ScRefUpdateRes.UR_STICKY;
        }
      }
      if (dy && refCol1 >= col1 && refCol2 <= col2 && refTab1 >= tab1 && refTab2 <= tab2) {
        const exp = expand && IsExpand(refRow1, refRow2, row1, dy);
        [refRow1, cut1] = lcl_MoveStart(refRow1, row1, dy, doc.MaxRow(), 32);
        [refRow2, cut2] = lcl_MoveEnd(refRow2, row1, dy, doc.MaxRow(), 32);
        if (refRow2 < refRow1) {
          result = ScRefUpdateRes.UR_INVALID;
          refRow2 = refRow1;
        } else if (cut2 && refRow2 === 0) result = ScRefUpdateRes.UR_INVALID;
        else if (cut1 || cut2) result = ScRefUpdateRes.UR_UPDATED;
        if (exp) {
          [refRow1, refRow2] = Expand(refRow1, refRow2, row1, dy, 32);
          result = ScRefUpdateRes.UR_UPDATED;
        }
        if (result !== ScRefUpdateRes.UR_NOTHING && oldRow1 === 0 && oldRow2 === doc.MaxRow()) {
          result = ScRefUpdateRes.UR_STICKY;
          refRow1 = oldRow1;
          refRow2 = oldRow2;
        } else if (oldRow2 === doc.MaxRow() && oldRow1 < doc.MaxRow()) {
          refRow2 = oldRow2;
          if (result === ScRefUpdateRes.UR_NOTHING) result = ScRefUpdateRes.UR_STICKY;
        }
      }
      if (dz && refCol1 >= col1 && refCol2 <= col2 && refRow1 >= row1 && refRow2 <= row2) {
        let maxTab = narrowCoordinate(doc.GetTableCount() - 1, 16);
        maxTab = narrowCoordinate(maxTab + dz, 16);
        const exp = expand && IsExpand(refTab1, refTab2, tab1, dz);
        [refTab1, cut1] = lcl_MoveStart(refTab1, tab1, dz, maxTab, 16, false);
        [refTab2, cut2] = lcl_MoveEnd(refTab2, tab1, dz, maxTab, 16, false);
        if (refTab2 < refTab1) {
          result = ScRefUpdateRes.UR_INVALID;
          refTab2 = refTab1;
        } else if (cut1 || cut2) result = ScRefUpdateRes.UR_UPDATED;
        if (exp) {
          [refTab1, refTab2] = Expand(refTab1, refTab2, tab1, dz, 16);
          result = ScRefUpdateRes.UR_UPDATED;
        }
      }
    } else if (mode === UpdateRefMode.URM_MOVE) {
      if (
        refCol1 >= col1 - dx &&
        refRow1 >= row1 - dy &&
        refTab1 >= tab1 - dz &&
        refCol2 <= col2 - dx &&
        refRow2 <= row2 - dy &&
        refTab2 <= tab2 - dz
      ) {
        if (dx) {
          [refCol1, cut1] = lcl_MoveItCut(refCol1, dx, doc.MaxCol(), 16);
          [refCol2, cut2] = lcl_MoveItCut(refCol2, dx, doc.MaxCol(), 16);
          if (cut1 || cut2) result = ScRefUpdateRes.UR_UPDATED;
          if (result !== ScRefUpdateRes.UR_NOTHING && oldCol1 === 0 && oldCol2 === doc.MaxCol()) {
            result = ScRefUpdateRes.UR_STICKY;
            refCol1 = oldCol1;
            refCol2 = oldCol2;
          }
        }
        if (dy) {
          [refRow1, cut1] = lcl_MoveItCut(refRow1, dy, doc.MaxRow(), 32);
          [refRow2, cut2] = lcl_MoveItCut(refRow2, dy, doc.MaxRow(), 32);
          if (cut1 || cut2) result = ScRefUpdateRes.UR_UPDATED;
          if (result !== ScRefUpdateRes.UR_NOTHING && oldRow1 === 0 && oldRow2 === doc.MaxRow()) {
            result = ScRefUpdateRes.UR_STICKY;
            refRow1 = oldRow1;
            refRow2 = oldRow2;
          }
        }
        if (dz) {
          const maxTab = narrowCoordinate(doc.GetTableCount() - 1, 16);
          [refTab1, cut1] = lcl_MoveItCut(refTab1, dz, maxTab, 16);
          [refTab2, cut2] = lcl_MoveItCut(refTab2, dz, maxTab, 16);
          if (cut1 || cut2) result = ScRefUpdateRes.UR_UPDATED;
        }
      }
    } else if (mode === UpdateRefMode.URM_REORDER) {
      if (dz && refCol1 >= col1 && refCol2 <= col2 && refRow1 >= row1 && refRow2 <= row2) {
        [refTab1, cut1] = lcl_MoveReorder(refTab1, tab1, tab2, dz);
        [refTab2, cut2] = lcl_MoveReorder(refTab2, tab1, tab2, dz);
        if (cut1 || cut2) result = ScRefUpdateRes.UR_UPDATED;
      }
    }
    if (
      result === ScRefUpdateRes.UR_NOTHING &&
      (oldCol1 !== refCol1 ||
        oldRow1 !== refRow1 ||
        oldTab1 !== refTab1 ||
        oldCol2 !== refCol2 ||
        oldRow2 !== refRow2 ||
        oldTab2 !== refTab2)
    )
      result = ScRefUpdateRes.UR_UPDATED;
    return [result, refCol1, refRow1, refTab1, refCol2, refRow2, refTab2];
  }

  /** Wraps only relative axes after absolute resolution, then orders and writes back both endpoints. @param doc - Existing document getter view. @param position - Formula position. @param maxCol - Inclusive wrap column maximum. @param maxRow - Inclusive wrap row maximum. @param ref - Initialized receiving complex reference. @returns Nothing. */
  public static MoveRelWrap(
    doc: ScReferenceDocument,
    position: ScAddress,
    maxCol: SCCOL,
    maxRow: SCROW,
    ref: ScComplexRefData,
  ): void {
    const absolute = ref.toAbs(doc, position);
    if (ref.Ref1.IsColRel()) absolute.aStart.SetCol(lcl_MoveItWrap(absolute.aStart.Col(), maxCol));
    if (ref.Ref2.IsColRel()) absolute.aEnd.SetCol(lcl_MoveItWrap(absolute.aEnd.Col(), maxCol));
    if (ref.Ref1.IsRowRel()) absolute.aStart.SetRow(lcl_MoveItWrap(absolute.aStart.Row(), maxRow));
    if (ref.Ref2.IsRowRel()) absolute.aEnd.SetRow(lcl_MoveItWrap(absolute.aEnd.Row(), maxRow));
    const maxTab = ((doc.GetTableCount() - 1) << 16) >> 16;
    if (ref.Ref1.IsTabRel()) absolute.aStart.SetTab(lcl_MoveItWrap(absolute.aStart.Tab(), maxTab));
    if (ref.Ref2.IsTabRel()) absolute.aEnd.SetTab(lcl_MoveItWrap(absolute.aEnd.Tab(), maxTab));
    absolute.PutInOrder();
    ref.SetRange(doc.GetSheetLimits(), absolute, position);
  }

  /** Transposes one coordinate with native temporary widths and repeated sheet wrapping. @param col - Raw column. @param row - Raw row. @param tab - Raw sheet. @param doc - Existing document getter view, with positive table count. @param source - Original source. @param dest - Destination. @returns Native output-reference coordinates. */
  public static DoTranspose(
    col: SCCOL,
    row: SCROW,
    tab: SCTAB,
    doc: ScAddressDocument,
    source: ScRange,
    dest: ScAddress,
  ): [SCCOL, SCROW, SCTAB] {
    const dz = ((dest.Tab() - source.aStart.Tab()) << 16) >> 16;
    if (dz) {
      let newTab = ((tab + dz) << 16) >> 16;
      const count = doc.GetTableCount();
      while (newTab < 0) newTab = ((newTab + count) << 16) >> 16;
      while (newTab >= count) newTab = ((newTab - count) << 16) >> 16;
      tab = newTab;
    }
    const relX = ((col - source.aStart.Col()) << 16) >> 16;
    const relY = (row - source.aStart.Row()) | 0;
    return [((dest.Col() + relY) << 16) >> 16, (dest.Row() + relX) | 0, tab];
  }

  /** Updates only references entirely contained by the original source. @param doc - Document getter view. @param source - Source range. @param dest - Destination. @param ref - Receiving range. @returns Original update result. */
  public static UpdateTranspose(
    doc: ScAddressDocument,
    source: ScRange,
    dest: ScAddress,
    ref: ScRange,
  ): ScRefUpdateRes {
    let result = ScRefUpdateRes.UR_NOTHING;
    if (source.Contains(ref)) {
      const [col1, row1, tab1] = ref.aStart.GetVars();
      const [col2, row2, tab2] = ref.aEnd.GetVars();
      const first = ScRefUpdate.DoTranspose(col1, row1, tab1, doc, source, dest);
      const second = ScRefUpdate.DoTranspose(col2, row2, tab2, doc, source, dest);
      ref.aStart.Set(...first);
      ref.aEnd.Set(...second);
      result = ScRefUpdateRes.UR_UPDATED;
    }
    return result;
  }

  /** Grows matching references with both predicates calculated before mutation and native header-row allowance. @param area - Original area. @param growX - Signed column growth. @param growY - Signed row growth. @param ref - Receiving range. @returns Original update result. */
  public static UpdateGrow(
    area: ScRange,
    growX: SCCOL,
    growY: SCROW,
    ref: ScRange,
  ): ScRefUpdateRes {
    let result = ScRefUpdateRes.UR_NOTHING;
    const updateX =
      growX !== 0 &&
      ref.aStart.Col() === area.aStart.Col() &&
      ref.aEnd.Col() === area.aEnd.Col() &&
      ref.aStart.Row() >= area.aStart.Row() &&
      ref.aEnd.Row() <= area.aEnd.Row() &&
      ref.aStart.Tab() >= area.aStart.Tab() &&
      ref.aEnd.Tab() <= area.aEnd.Tab();
    const updateY =
      growY !== 0 &&
      ref.aStart.Col() >= area.aStart.Col() &&
      ref.aEnd.Col() <= area.aEnd.Col() &&
      (ref.aStart.Row() === area.aStart.Row() || ref.aStart.Row() === area.aStart.Row() + 1) &&
      ref.aEnd.Row() === area.aEnd.Row() &&
      ref.aStart.Tab() >= area.aStart.Tab() &&
      ref.aEnd.Tab() <= area.aEnd.Tab();
    if (updateX) {
      ref.aEnd.SetCol(((ref.aEnd.Col() + growX) << 16) >> 16);
      result = ScRefUpdateRes.UR_UPDATED;
    }
    if (updateY) {
      ref.aEnd.SetRow((ref.aEnd.Row() + growY) | 0);
      result = ScRefUpdateRes.UR_UPDATED;
    }
    return result;
  }
}
