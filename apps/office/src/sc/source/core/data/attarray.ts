/** @fileoverview ScAttrArray canonical pattern row runs, default-column inheritance and native split/merge algorithm. VCL width caches, stream-copy validity and rich edit-text stripping are outside this document slice. */
import { SvxLineItem } from "../../../../editeng/inc/lineitem";
import { ScLineFlags, SC_LINE_EMPTY, SC_LINE_SET, SC_LINE_DONTCARE } from "../../../inc/attarray";
import { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import { SvxBoxInfoItemLine as InnerEdge } from "../../../../editeng/source/items/frmitems";
import { ScItemPoolCache } from "../../../inc/poolcach";
import {
  SvxBoxItem,
  SvxBoxInfoItem,
  SvxBoxItemLine as Edge,
  SvxBoxInfoItemValidFlags as Valid,
} from "../../../../editeng/source/items/frmitems";
import { ScMF, ScMergeFlagAttr } from "../../../inc/attrib";
import { ScMergeAttr } from "../../../inc/attrib";
import { ATTR_BORDER } from "../../../inc/scitems";
import { ScIndentItem } from "../../../inc/attrib";
import { SvxHorJustifyItem } from "../../../../editeng/inc/justifyitem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { ScCondFormatItem, ScCondFormatIndexes, ScRotateValueItem } from "../../../inc/attrib";
import { ATTR_LINEBREAK, ATTR_CONDITIONAL, ATTR_ROTATE_VALUE } from "../../../inc/scitems";
import { SvxCellHorJustify, SvxCellOrientation } from "../../../../editeng/inc/svxenum";
import { SC_INDENT_STEP, HasAttrFlags } from "../../../inc/global";
import { ATTR_INDENT, ATTR_HOR_JUSTIFY } from "../../../inc/scitems";
import { CellAttributeHolder, ScPatternAttr } from "../../../inc/patattr";
import type { ScDocument } from "../../../inc/document";
import type { ScMergePatternState } from "../../../inc/attarray";
import { SfxItemSet, SfxItemState } from "../../../../svl/inc/itemset";
import { SfxPoolItem } from "../../../../svl/inc/poolitem";
import {
  ATTR_PATTERN_START,
  ATTR_PATTERN_END,
  ATTR_MERGE,
  ATTR_MERGE_FLAG,
} from "../../../inc/scitems";

/** Original lcl_MergeDeep compares inherited values against actual pool defaults;existing invalid states remain invalid. @param merged - Parentless accumulator. @param source - Source pattern set. @returns Nothing. */
function lcl_MergeDeep(merged: SfxItemSet, source: SfxItemSet): void {
  for (let which = ATTR_PATTERN_START; which <= ATTR_PATTERN_END; which++) {
    const oldState = merged.GetItemState(which, false);
    if (oldState === SfxItemState.DEFAULT) {
      if (
        source.GetItemState(which, true) === SfxItemState.SET &&
        !source.Get(which).equals(merged.GetPool().GetUserOrPoolDefaultItem(which))
      )
        merged.InvalidateItem(which);
    } else if (oldState === SfxItemState.SET) {
      if (source.GetItemState(which, true) === SfxItemState.SET) {
        if (
          !SfxPoolItem.areSame(source.GetItemIfSet(which, true), merged.GetItemIfSet(which, false))
        )
          merged.InvalidateItem(which);
      } else if (!merged.Get(which).equals(source.GetPool().GetUserOrPoolDefaultItem(which)))
        merged.InvalidateItem(which);
    }
  }
}
/** Original lcl_TestAttr records first values and sticky mixed states. @param old - Accumulator line. @param next - Cell line. @param flags - Native flags. @param key - Native member. @param result - Borrowed line output. @returns Replace accumulator. */
function lcl_TestAttr(
  old: SvxBorderLine | undefined,
  next: SvxBorderLine | undefined,
  flags: ScLineFlags,
  key: keyof ScLineFlags,
  result: [SvxBorderLine | undefined],
): boolean {
  if (flags[key] === SC_LINE_DONTCARE) return false;
  if (flags[key] === SC_LINE_EMPTY) {
    flags[key] = SC_LINE_SET;
    result[0] = next;
    return true;
  }
  if (old === next || (old !== undefined && next !== undefined && old.equals(next))) {
    result[0] = old;
    return false;
  }
  flags[key] = SC_LINE_DONTCARE;
  result[0] = undefined;
  return true;
}
/** Original frame perimeter/interior accumulation including real merge extents. @param outer - Outer accumulator. @param inner - Inner accumulator. @param flags - Native six-way flags. @param pattern - Actual cell pattern. @param left - First column. @param right - Right distance. @param top - First row. @param bottom - Bottom distance. @returns Nothing. */
function lcl_MergeToFrame(
  outer: SvxBoxItem,
  inner: SvxBoxInfoItem,
  flags: ScLineFlags,
  pattern: ScPatternAttr,
  left: boolean,
  right: number,
  top: boolean,
  bottom: number,
): void {
  const merge = pattern.GetItem(ATTR_MERGE) as ScMergeAttr;
  if (merge.GetColMerge() === right + 1) right = 0;
  if (merge.GetRowMerge() === bottom + 1) bottom = 0;
  const frame = pattern.GetItem(ATTR_BORDER) as SvxBoxItem,
    result: [SvxBorderLine | undefined] = [undefined];
  if (top) {
    if (lcl_TestAttr(outer.GetTop(), frame.GetTop(), flags, "nTop", result))
      outer.SetLine(result[0], Edge.TOP);
  } else if (lcl_TestAttr(inner.GetHori(), frame.GetTop(), flags, "nHori", result))
    inner.SetLine(result[0], InnerEdge.HORI);
  if (bottom === 0) {
    if (lcl_TestAttr(outer.GetBottom(), frame.GetBottom(), flags, "nBottom", result))
      outer.SetLine(result[0], Edge.BOTTOM);
  } else if (lcl_TestAttr(inner.GetHori(), frame.GetBottom(), flags, "nHori", result))
    inner.SetLine(result[0], InnerEdge.HORI);
  if (left) {
    if (lcl_TestAttr(outer.GetLeft(), frame.GetLeft(), flags, "nLeft", result))
      outer.SetLine(result[0], Edge.LEFT);
  } else if (lcl_TestAttr(inner.GetVert(), frame.GetLeft(), flags, "nVert", result))
    inner.SetLine(result[0], InnerEdge.VERT);
  if (right === 0) {
    if (lcl_TestAttr(outer.GetRight(), frame.GetRight(), flags, "nRight", result))
      outer.SetLine(result[0], Edge.RIGHT);
  } else if (lcl_TestAttr(inner.GetVert(), frame.GetRight(), flags, "nVert", result))
    inner.SetLine(result[0], InnerEdge.VERT);
}
/** Original end-row entry with actual canonical holder ownership. */
class ScAttrEntry extends CellAttributeHolder {
  nEndRow = 0;
}
/** Original column attribute interval owner; rows without cell contents retain real patterns. */
export class ScAttrArray {
  /** Original merged-anchor query uses stored runs or the document's actual default attribute. @param row - Queried row. @returns Whether either merge span exceeds one. */
  IsMerged(row: number): boolean {
    if (this.mvData.length) {
      const index: [number] = [0];
      this.Search(row, index);
      const pattern = (this.mvData[index[0]] as ScAttrEntry).getScPatternAttr() as ScPatternAttr;
      return (pattern.GetItem(ATTR_MERGE) as ScMergeAttr).IsMerged();
    }
    const pattern = this.rDocument.getCellAttributeHelper().getDefaultCellAttribute();
    return (pattern.GetItem(ATTR_MERGE) as ScMergeAttr).IsMerged();
  }
  /** Original NeedHeight branch of HasAttrib_Impl over genuine pattern values;other masks remain explicitly unported. @param pattern - Actual pattern. @returns Height-sensitive attribute found. */
  private HasAttrib_Impl(pattern: ScPatternAttr): boolean {
    if (pattern.GetCellOrientation() !== SvxCellOrientation.Standard) return true;
    if ((pattern.GetItem(ATTR_LINEBREAK) as SfxBoolItem).GetValue()) return true;
    if (
      (pattern.GetItem(ATTR_HOR_JUSTIFY) as SvxHorJustifyItem).GetValue() ===
      SvxCellHorJustify.Block
    )
      return true;
    if (!(pattern.GetItem(ATTR_CONDITIONAL) as ScCondFormatItem).GetCondFormatData().empty())
      return true;
    return (pattern.GetItem(ATTR_ROTATE_VALUE) as ScRotateValueItem).GetValue() !== 0;
  }
  /** Original range search and early found termination for the consumed NeedHeight mask. @param first - First row. @param last - Last row. @param mask - Source mask. @returns Attribute found. */
  HasAttrib(first: number, last: number, mask: HasAttrFlags): boolean {
    if (mask !== HasAttrFlags.NeedHeight)
      throw new Error("Only NeedHeight attribute queries are implemented");
    if (this.mvData.length === 0)
      return this.HasAttrib_Impl(
        this.rDocument.getCellAttributeHelper().getDefaultCellAttribute() as ScPatternAttr,
      );
    const start: [number] = [0],
      end: [number] = [0];
    this.Search(first, start);
    if (first !== last) this.Search(last, end);
    else end[0] = start[0];
    let found = false;
    for (let i = start[0]; i <= end[0] && !found; i++)
      found = this.HasAttrib_Impl(
        (this.mvData[i] as ScAttrEntry).getScPatternAttr() as ScPatternAttr,
      );
    return found;
  }
  private readonly mvData: ScAttrEntry[] = [];
  /** Original Concat joins canonical neighboring runs after an in-place pattern change. @param position - Changed entry index. @returns Whether joined. */
  private Concat(position: number): boolean {
    let changed = false;
    if (position < this.mvData.length) {
      if (
        position > 0 &&
        ScPatternAttr.areSame(
          (this.mvData[position - 1] as ScAttrEntry).getScPatternAttr(),
          (this.mvData[position] as ScAttrEntry).getScPatternAttr(),
        )
      ) {
        (this.mvData[position - 1] as ScAttrEntry).nEndRow = (
          this.mvData[position] as ScAttrEntry
        ).nEndRow;
        (this.mvData.splice(position, 1)[0] as ScAttrEntry).Dispose();
        --position;
        changed = true;
      }
      if (
        position + 1 < this.mvData.length &&
        ScPatternAttr.areSame(
          (this.mvData[position + 1] as ScAttrEntry).getScPatternAttr(),
          (this.mvData[position] as ScAttrEntry).getScPatternAttr(),
        )
      ) {
        (this.mvData[position] as ScAttrEntry).nEndRow = (
          this.mvData[position + 1] as ScAttrEntry
        ).nEndRow;
        (this.mvData.splice(position + 1, 1)[0] as ScAttrEntry).Dispose();
        changed = true;
      }
    }
    return changed;
  }
  /** Original conditional-index insertion walks canonical runs and retains existing indices and styles. Valid rows always have the document's real default pattern. @param first - First row. @param last - Last row. @param index - Unsigned conditional-format key. @returns Nothing. */
  AddCondFormat(first: number, last: number, index: number): void {
    if (!this.rDocument.ValidRow(first) || !this.rDocument.ValidRow(last)) return;
    if (last < first) return;
    index >>>= 0;
    let start = first,
      end: number;
    do {
      const pattern = this.GetPattern(start) as ScPatternAttr;
      const runStart: [number] = [0],
        runEnd: [number] = [0];
      this.GetPatternRange(runStart, runEnd, start);
      end = Math.min(runEnd[0], last);
      const item = pattern.GetItemSet().GetItemIfSet(ATTR_CONDITIONAL) as ScCondFormatItem | null;
      let next: ScPatternAttr | null = null;
      if (item) {
        const indexes = item.GetCondFormatData();
        if (indexes.find(index) === -1) {
          const copied = new ScCondFormatIndexes([...indexes]);
          copied.insert(index);
          next = new ScPatternAttr(pattern);
          next.ItemSetPut(ScCondFormatItem.move(copied));
        }
      } else {
        next = new ScPatternAttr(pattern);
        next.ItemSetPut(new ScCondFormatItem(index));
      }
      const holder = next ? new CellAttributeHolder(next, true) : new CellAttributeHolder(pattern);
      try {
        this.SetPatternArea(start, end, holder);
      } finally {
        holder.Dispose();
      }
      start = end + 1;
    } while (end < last);
  }
  /** Original conditional-index removal preserves explicit empty items and all unrelated attributes. Valid rows have a real default pattern. @param first - First row. @param last - Last row. @param index - Unsigned key;zero removes all indices. @returns Nothing. */
  RemoveCondFormat(first: number, last: number, index: number): void {
    if (!this.rDocument.ValidRow(first) || !this.rDocument.ValidRow(last)) return;
    if (last < first) return;
    index >>>= 0;
    let start = first,
      end: number;
    do {
      const pattern = this.GetPattern(start) as ScPatternAttr;
      const runStart: [number] = [0],
        runEnd: [number] = [0];
      this.GetPatternRange(runStart, runEnd, start);
      end = Math.min(runEnd[0], last);
      const item = pattern.GetItemSet().GetItemIfSet(ATTR_CONDITIONAL) as
        ScCondFormatItem | undefined;
      if (item) {
        let next: ScCondFormatItem | null = null;
        if (index === 0) next = new ScCondFormatItem();
        else {
          const indexes = item.GetCondFormatData(),
            position = indexes.find(index);
          if (position !== -1) {
            const copied = new ScCondFormatIndexes([...indexes]);
            copied.erase_at(position);
            next = ScCondFormatItem.move(copied);
          }
        }
        if (next) {
          const replacement = new ScPatternAttr(pattern);
          replacement.ItemSetPut(next);
          const holder = new CellAttributeHolder(replacement, true);
          try {
            this.SetPatternArea(start, end, holder);
          } finally {
            holder.Dispose();
          }
        }
      }
      start = end + 1;
    } while (end < last);
  }
  /** Original ApplyCacheArea split/full-run traversal;rich-edit,width-cache and stream validity services remain unported. @param first - First row. @param last - Last row. @param cache - Actual native cache. @param changed - Original optional change output. @returns Nothing. */
  ApplyCacheArea(first: number, last: number, cache: ScItemPoolCache, changed?: [boolean]): void {
    if (!(this.rDocument.ValidRow(first) && this.rDocument.ValidRow(last))) return;
    const position: [number] = [0];
    let start = 0;
    this.SetDefaultIfNotInit();
    if (!this.Search(first, position)) return;
    do {
      const old = this.mvData[position[0]] as ScAttrEntry,
        next = cache.ApplyTo(old);
      if (!CellAttributeHolder.areSame(next, old)) {
        if (changed) changed[0] = true;
        let from = start,
          to = old.nEndRow;
        start = old.nEndRow + 1;
        if (from < first || to > last) {
          from = Math.max(from, first);
          to = Math.min(to, last);
          this.SetPatternArea(from, to, next);
          this.Search(start, position);
        } else {
          old.assign(next);
          if (this.Concat(position[0])) this.Search(start, position);
          else ++position[0];
        }
      } else {
        start = old.nEndRow + 1;
        ++position[0];
      }
    } while (start <= last);
  }
  /** Original existing-line style/color mutation;no absent lines are created and valid runs are re-searched after coalescing. @param first - First row. @param last - Last row. @param line - New style or absent for removal. @param colorOnly - Change color only. @returns Nothing. */
  ApplyLineStyleArea(
    first: number,
    last: number,
    line: SvxBorderLine | undefined,
    colorOnly: boolean,
  ): void {
    if (colorOnly && !line) return;
    if (!(this.rDocument.ValidRow(first) && this.rDocument.ValidRow(last))) return;
    const position: [number] = [0];
    let start = 0;
    this.SetDefaultIfNotInit();
    if (!this.Search(first, position)) return;
    do {
      const entry = this.mvData[position[0]] as ScAttrEntry,
        old = entry.getScPatternAttr() as ScPatternAttr,
        set = old.GetItemSet(),
        box = set.GetItemIfSet(ATTR_BORDER) as SvxBoxItem | undefined,
        tlbr = set.GetItemIfSet(141) as SvxLineItem | undefined,
        bltr = set.GetItemIfSet(142) as SvxLineItem | undefined;
      if (box || tlbr || bltr) {
        const next = new ScPatternAttr(old),
          newBox = box?.Clone(),
          newTLBR = tlbr?.Clone(),
          newBLTR = bltr?.Clone();
        let from = start,
          to = entry.nEndRow;
        if (!line) {
          if (newBox)
            for (const edge of [Edge.TOP, Edge.BOTTOM, Edge.LEFT, Edge.RIGHT])
              if (newBox.GetLine(edge)) newBox.SetLine(undefined, edge);
          if (newTLBR?.GetLine()) newTLBR.SetLine(null);
          if (newBLTR?.GetLine()) newBLTR.SetLine(null);
        } else {
          const lines = [
            newBox?.GetTop(),
            newBox?.GetBottom(),
            newBox?.GetLeft(),
            newBox?.GetRight(),
            newTLBR?.GetLine(),
            newBLTR?.GetLine(),
          ];
          for (const destination of lines)
            if (destination) {
              if (colorOnly) destination.SetColor(line.GetColor());
              else {
                destination.SetBorderLineStyle(line.GetBorderLineStyle());
                destination.SetWidth(line.GetWidth());
              }
            }
        }
        if (newBox) next.ItemSetPut(newBox);
        if (newTLBR) next.ItemSetPut(newTLBR);
        if (newBLTR) next.ItemSetPut(newBLTR);
        start = entry.nEndRow + 1;
        if (from < first || to > last) {
          from = Math.max(from, first);
          to = Math.min(to, last);
          const holder = new CellAttributeHolder(next, true);
          try {
            this.SetPatternArea(from, to, holder);
          } finally {
            holder.Dispose();
          }
          this.Search(start, position);
        } else {
          entry.setScPatternAttr(next, true);
          if (this.Concat(position[0])) this.Search(start, position);
          else ++position[0];
        }
      } else {
        start = entry.nEndRow + 1;
        ++position[0];
      }
    } while (start <= last && position[0] < this.mvData.length);
  }
  /** Original frame query over compressed runs,including native default-pattern and edge ordering. @param outer - Outer accumulator. @param inner - Inner accumulator. @param flags - Shared flags. @param first - First row. @param last - Last row. @param left - First column. @param right - Right distance. @returns Nothing. */
  MergeBlockFrame(
    outer: SvxBoxItem,
    inner: SvxBoxInfoItem,
    flags: ScLineFlags,
    first: number,
    last: number,
    left: boolean,
    right: number,
  ): void {
    if (first === last)
      lcl_MergeToFrame(
        outer,
        inner,
        flags,
        this.GetPattern(first) as ScPatternAttr,
        left,
        right,
        true,
        0,
      );
    else if (this.mvData.length !== 0) {
      lcl_MergeToFrame(
        outer,
        inner,
        flags,
        this.GetPattern(first) as ScPatternAttr,
        left,
        right,
        true,
        last - first,
      );
      const start: [number] = [0],
        end: [number] = [0];
      this.Search(first + 1, start);
      this.Search(last - 1, end);
      for (let index = start[0]; index <= end[0]; index++) {
        const entry = this.mvData[index] as ScAttrEntry;
        lcl_MergeToFrame(
          outer,
          inner,
          flags,
          entry.getScPatternAttr() as ScPatternAttr,
          left,
          right,
          false,
          last - Math.min(entry.nEndRow, last - 1),
        );
      }
      lcl_MergeToFrame(
        outer,
        inner,
        flags,
        this.GetPattern(last) as ScPatternAttr,
        left,
        right,
        false,
        0,
      );
    } else
      lcl_MergeToFrame(
        outer,
        inner,
        flags,
        this.rDocument.getCellAttributeHelper().getDefaultCellAttribute() as ScPatternAttr,
        left,
        right,
        true,
        0,
      );
  }
  /** Original frame update consumes real validity flags,merge extents and sheet direction. @param outer - Requested outer lines. @param inner - Native inner lines/validity. @param first - First row. @param last - Last row. @param left - Left edge column. @param rightDistance - Distance to right column. @param top - Top row. @param bottomDistance - Distance to bottom row. @returns Changed. */
  private ApplyFrame(
    outer: SvxBoxItem,
    inner: SvxBoxInfoItem,
    first: number,
    last: number,
    left: boolean,
    rightDistance: number,
    top: boolean,
    bottomDistance: number,
  ): boolean {
    const pattern = this.GetPattern(first) as ScPatternAttr,
      old = pattern.GetItem(ATTR_BORDER) as SvxBoxItem,
      merge = pattern.GetItem(ATTR_MERGE) as ScMergeAttr;
    if (merge.GetColMerge() === rightDistance + 1) rightDistance = 0;
    if (merge.GetRowMerge() === bottomDistance + 1) bottomDistance = 0;
    const next = new SvxBoxItem(old);
    if (this.rDocument.IsLayoutRTL(this.nTab)) {
      if (left && rightDistance === 0) {
        if (inner.IsValid(Valid.LEFT)) next.SetLine(outer.GetLeft(), Edge.RIGHT);
        if (inner.IsValid(Valid.RIGHT)) next.SetLine(outer.GetRight(), Edge.LEFT);
      } else {
        if (inner.IsValid(rightDistance === 0 ? Valid.LEFT : Valid.VERT))
          next.SetLine(rightDistance === 0 ? outer.GetLeft() : inner.GetVert(), Edge.RIGHT);
        if (inner.IsValid(left ? Valid.RIGHT : Valid.VERT))
          next.SetLine(left ? outer.GetRight() : inner.GetVert(), Edge.LEFT);
      }
    } else {
      if (inner.IsValid(left ? Valid.LEFT : Valid.VERT))
        next.SetLine(left ? outer.GetLeft() : inner.GetVert(), Edge.LEFT);
      if (inner.IsValid(rightDistance === 0 ? Valid.RIGHT : Valid.VERT))
        next.SetLine(rightDistance === 0 ? outer.GetRight() : inner.GetVert(), Edge.RIGHT);
    }
    if (inner.IsValid(top ? Valid.TOP : Valid.HORI))
      next.SetLine(top ? outer.GetTop() : inner.GetHori(), Edge.TOP);
    if (inner.IsValid(bottomDistance === 0 ? Valid.BOTTOM : Valid.HORI))
      next.SetLine(bottomDistance === 0 ? outer.GetBottom() : inner.GetHori(), Edge.BOTTOM);
    if (next.equals(old)) return false;
    const cache = new ScItemPoolCache(this.rDocument.getCellAttributeHelper(), next);
    try {
      this.ApplyCacheArea(first, last, cache);
    } finally {
      cache.Dispose();
    }
    return true;
  }
  /** Original block-frame perimeter/interior traversal re-searches coalesced runs after changes. @param outer - Outer lines. @param inner - Inner lines/validity. @param first - First row. @param last - Last row. @param left - Left column. @param rightDistance - Distance to right column. @returns Nothing. */
  ApplyBlockFrame(
    outer: SvxBoxItem,
    inner: SvxBoxInfoItem,
    first: number,
    last: number,
    left: boolean,
    rightDistance: number,
  ): void {
    this.SetDefaultIfNotInit();
    if (first === last) this.ApplyFrame(outer, inner, first, last, left, rightDistance, true, 0);
    else {
      this.ApplyFrame(outer, inner, first, first, left, rightDistance, true, last - first);
      if (last > first + 1) {
        const start: [number] = [0],
          end: [number] = [0];
        this.Search(first + 1, start);
        this.Search(last - 1, end);
        let from = first + 1;
        while (start[0] <= end[0]) {
          const to = Math.min(last - 1, (this.mvData[start[0]] as ScAttrEntry).nEndRow),
            changed = this.ApplyFrame(
              outer,
              inner,
              from,
              to,
              left,
              rightDistance,
              false,
              last - to,
            );
          from = to + 1;
          if (changed) {
            this.Search(from, start);
            this.Search(last - 1, end);
          } else ++start[0];
        }
      }
      this.ApplyFrame(outer, inner, last, last, left, rightDistance, false, 0);
    }
  }
  /** Original pattern-run selection merge without allocating cells or traversing individual rows. @param startRow - First row. @param endRow - Last row. @param state - Shared accumulator. @param deep - Whether inherited items participate. @returns Nothing. */
  MergePatternArea(
    startRow: number,
    endRow: number,
    state: ScMergePatternState,
    deep: boolean,
  ): void {
    if (!this.rDocument.ValidRow(startRow) || !this.rDocument.ValidRow(endRow)) return;
    const position: [number] = [0];
    let start: number;
    if (this.mvData.length !== 0 && !this.Search(startRow, position)) return;
    do {
      const pattern =
        this.mvData.length === 0
          ? this.rDocument.getCellAttributeHelper().getDefaultCellAttribute()
          : ((this.mvData[position[0]] as ScAttrEntry).getScPatternAttr() as ScPatternAttr);
      if (
        !ScPatternAttr.areSame(pattern, state.aOld1.getScPatternAttr()) &&
        !ScPatternAttr.areSame(pattern, state.aOld2.getScPatternAttr())
      ) {
        const source = pattern.GetItemSet();
        if (state.pItemSet !== undefined) {
          state.mbValidPatternId = false;
          if (deep) lcl_MergeDeep(state.pItemSet, source);
          else state.pItemSet.MergeValues(source);
        } else {
          state.pItemSet = new SfxItemSet(source.GetPool(), source.GetRanges());
          state.pItemSet.Set(source, deep);
          state.mnPatternId = pattern.GetPAKey();
        }
        state.aOld2.assign(state.aOld1);
        state.aOld1.setScPatternAttr(pattern);
      }
      start =
        this.mvData.length !== 0
          ? (this.mvData[position[0]] as ScAttrEntry).nEndRow + 1
          : this.rDocument.MaxRow() + 1;
      position[0]++;
    } while (start <= endRow);
  }
  /** Copies the source default column's runs, retaining real canonical holders. @param nCol - Column or default-column sentinel. @param nTab - Sheet. @param rDocument - Owner. @param defaults - Actual default-column array. @returns Array. */
  constructor(
    private readonly nCol: number,
    private nTab: number,
    private readonly rDocument: ScDocument,
    defaults?: ScAttrArray,
  ) {
    if (nCol !== -1 && defaults !== undefined)
      for (const old of defaults.mvData) {
        const entry = new ScAttrEntry(old);
        entry.nEndRow = old.nEndRow;
        this.mvData.push(entry);
      }
  }
  /** Original sheet-position update. @param tab - Sheet. @returns Nothing. */
  SetTab(tab: number): void {
    this.nTab = tab;
  }
  /** Original ChangeIndent over canonical pattern runs;alignment coercion is independent of numeric changes. @param first - First row. @param last - Last row. @param increment - Increase versus decrease. @returns Nothing. */
  ChangeIndent(first: number, last: number, increment: boolean): void {
    this.SetDefaultIfNotInit();
    const index: [number] = [0];
    this.Search(first, index);
    let row = Math.max(
      first,
      index[0] > 0 ? (this.mvData[index[0] - 1] as ScAttrEntry).nEndRow + 1 : 0,
    );
    while (row <= last) {
      const entry = this.mvData[index[0]] as ScAttrEntry,
        old = entry.getScPatternAttr() as ScPatternAttr,
        set = old.GetItemSet(),
        justify = set.GetItemIfSet(ATTR_HOR_JUSTIFY, false) as SvxHorJustifyItem | undefined,
        needJust =
          !justify ||
          (justify.GetValue() !== SvxCellHorJustify.Left &&
            justify.GetValue() !== SvxCellHorJustify.Right),
        oldValue = (set.Get(ATTR_INDENT) as ScIndentItem).GetValue(),
        width = this.rDocument.GetColWidth(
          this.nCol === -1 ? this.rDocument.MaxCol() : this.nCol,
          this.nTab,
        );
      let value = oldValue;
      if (increment) {
        if (value < width - SC_INDENT_STEP) {
          value = (value + SC_INDENT_STEP) & 0xffff;
          if (value > width - SC_INDENT_STEP) value = width - SC_INDENT_STEP;
        }
      } else if (value > 0) value = value > SC_INDENT_STEP ? value - SC_INDENT_STEP : 0;
      const end = entry.nEndRow;
      if (needJust || value !== oldValue) {
        const next = new ScPatternAttr(old);
        next.ItemSetPut(new ScIndentItem(value));
        if (needJust)
          next.ItemSetPut(new SvxHorJustifyItem(SvxCellHorJustify.Left, ATTR_HOR_JUSTIFY));
        const holder = new CellAttributeHolder(next, true);
        try {
          this.SetPatternArea(row, Math.min(end, last), holder);
        } finally {
          holder.Dispose();
        }
        row = end + 1;
        this.Search(row, index);
      } else {
        row = end + 1;
        ++index[0];
      }
    }
  }
  /** Releases actual logical registrations when a sheet/document is discarded. @returns Nothing. */
  Dispose(): void {
    for (const entry of this.mvData) entry.Dispose();
    this.mvData.length = 0;
  }
  /** Creates the native full-height default run lazily. @returns Nothing. */
  private SetDefaultIfNotInit(): void {
    if (this.mvData.length) return;
    const entry = new ScAttrEntry(
      this.rDocument.getCellAttributeHelper().getDefaultCellAttribute() as ScPatternAttr,
    );
    entry.nEndRow = this.rDocument.MaxRow();
    this.mvData.push(entry);
  }
  /** Native binary search, including the source single-entry fast path. Callers preserve row preconditions. @param row - Row. @param index - Output index. @returns Found. */
  private Search(row: number, index: [number]): boolean {
    if (this.mvData.length === 1) {
      index[0] = 0;
      return true;
    }
    let low = 0,
      high = this.mvData.length - 1;
    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      if ((this.mvData[middle] as ScAttrEntry).nEndRow < row) low = middle + 1;
      else if (middle > 0 && (this.mvData[middle - 1] as ScAttrEntry).nEndRow >= row)
        high = middle - 1;
      else {
        index[0] = middle;
        return true;
      }
    }
    index[0] = 0;
    return false;
  }
  /** Reads native canonical pattern/default. @param row - Row. @returns Pattern or null. */
  GetPattern(row: number): ScPatternAttr | null {
    if (!this.mvData.length)
      return this.rDocument.ValidRow(row)
        ? this.rDocument.getCellAttributeHelper().getDefaultCellAttribute()
        : null;
    const index: [number] = [0];
    return this.Search(row, index)
      ? (this.mvData[index[0]] as ScAttrEntry).getScPatternAttr()
      : null;
  }
  /** Borrows a complete native run without enumerating cells. @param start - Start output. @param end - End output. @param row - Query row. @returns Pattern or null. */
  GetPatternRange(start: [number], end: [number], row: number): ScPatternAttr | null {
    if (!this.mvData.length) {
      if (!this.rDocument.ValidRow(row)) return null;
      start[0] = 0;
      end[0] = this.rDocument.MaxRow();
      return this.rDocument.getCellAttributeHelper().getDefaultCellAttribute();
    }
    const index: [number] = [0];
    if (!this.Search(row, index)) return null;
    start[0] = index[0] > 0 ? (this.mvData[index[0] - 1] as ScAttrEntry).nEndRow + 1 : 0;
    end[0] = (this.mvData[index[0]] as ScAttrEntry).nEndRow;
    return (this.mvData[index[0]] as ScAttrEntry).getScPatternAttr();
  }
  /** Replaces all runs with the supplied real canonical value. @param pattern - Holder. @returns Nothing. */
  Reset(pattern: CellAttributeHolder): void {
    const value = pattern.getScPatternAttr();
    if (value === null) return;
    this.Dispose();
    const entry = new ScAttrEntry(value);
    entry.nEndRow = this.rDocument.MaxRow();
    this.mvData.push(entry);
  }
  /** Original DeleteHardAttr clears direct items while retaining styles and both merge items;canonical runs are re-searched after replacement. @param first - Ordered valid first row. @param last - Ordered valid last row. @returns Nothing. */
  DeleteHardAttr(first: number, last: number): void {
    this.SetDefaultIfNotInit();
    const defaults = new CellAttributeHolder(
        this.rDocument.getCellAttributeHelper().getDefaultCellAttribute() as ScPatternAttr,
      ),
      index: [number] = [0];
    try {
      this.Search(first, index);
      let row = index[0] > 0 ? (this.mvData[index[0] - 1] as ScAttrEntry).nEndRow + 1 : 0;
      if (row < first) row = first;
      while (row <= last) {
        const entry = this.mvData[index[0]] as ScAttrEntry,
          old = entry.getScPatternAttr() as ScPatternAttr;
        if (old.GetItemSet().Count()) {
          const stop = Math.min(entry.nEndRow, last),
            next = new ScPatternAttr(old);
          for (let which = ATTR_PATTERN_START; which <= ATTR_PATTERN_END; which++)
            if (which !== ATTR_MERGE && which !== ATTR_MERGE_FLAG) next.ItemSetClearItem(which);
          if (next.equals(defaults.getScPatternAttr() as ScPatternAttr)) {
            next.Dispose();
            this.SetPatternArea(row, stop, defaults);
          } else {
            const holder = new CellAttributeHolder(next, true);
            try {
              this.SetPatternArea(row, stop, holder);
            } finally {
              holder.Dispose();
            }
          }
          this.Search(row, index);
        }
        ++index[0];
        row = (this.mvData[index[0] - 1] as ScAttrEntry).nEndRow + 1;
      }
    } finally {
      defaults.Dispose();
    }
  }
  /** Original attarray.hxx cursor assignment wraps the same complete-pattern area owner. @param row - Native row. @param holder - Complete canonical pattern. @returns Nothing. */
  SetPattern(row: number, holder: CellAttributeHolder): void {
    this.SetPatternArea(row, row, holder);
  }
  /** Original SetPatternAreaImpl logical split/shrink/replace/combine operations. Rich text is not a represented cell alternative. @param start - Ordered first row. @param end - Ordered last row. @param holder - Canonical source. @returns Nothing. */
  SetPatternArea(start: number, end: number, holder: CellAttributeHolder): void {
    const pattern = holder.getScPatternAttr();
    if (pattern === null || !this.rDocument.ValidRow(start) || !this.rDocument.ValidRow(end))
      return;
    if (start === 0 && end === this.rDocument.MaxRow()) {
      this.Reset(holder);
      return;
    }
    this.SetDefaultIfNotInit();
    const same =
      /** Compares actual canonical native patterns. @param index - Existing run. @returns Equality. */ (
        index: number,
      ): boolean =>
        ScPatternAttr.areSame((this.mvData[index] as ScAttrEntry).getScPatternAttr(), pattern);
    let ni = 0;
    if (start > 0) {
      const index: [number] = [0];
      this.Search(start, index);
      ni = index[0];
    }
    let insert: number,
      combined = false,
      split = false;
    if (start > 0) {
      insert = this.rDocument.MaxRow() + 1;
      if (!same(ni)) {
        if (ni === 0 || (this.mvData[ni - 1] as ScAttrEntry).nEndRow < start - 1) {
          if ((this.mvData[ni] as ScAttrEntry).nEndRow > end) split = true;
          ni++;
          insert = ni;
        } else {
          // Search guarantees previousEnd < start; after the < start-1 test,
          // native integer row endpoints necessarily satisfy previousEnd === start-1.
          insert = ni;
        }
      }
      if (ni > 0 && same(ni - 1)) {
        (this.mvData[ni - 1] as ScAttrEntry).nEndRow = end;
        insert = this.rDocument.MaxRow() + 1;
        combined = true;
      }
    } else insert = 0;
    let nj = ni;
    while (nj < this.mvData.length && (this.mvData[nj] as ScAttrEntry).nEndRow <= end) nj++;
    if (!split) {
      if (nj < this.mvData.length && same(nj)) {
        if (ni > 0) {
          if (same(ni - 1)) {
            (this.mvData[ni - 1] as ScAttrEntry).nEndRow = (this.mvData[nj] as ScAttrEntry).nEndRow;
            nj++;
          } else if (ni === insert) (this.mvData[ni - 1] as ScAttrEntry).nEndRow = start - 1;
        }
        insert = this.rDocument.MaxRow() + 1;
        combined = true;
      } else if (ni > 0 && ni === insert) (this.mvData[ni - 1] as ScAttrEntry).nEndRow = start - 1;
    }
    if (ni < nj) {
      if (!combined) {
        (this.mvData[ni] as ScAttrEntry).nEndRow = end;
        (this.mvData[ni] as ScAttrEntry).setScPatternAttr(pattern);
        ni++;
        insert = this.rDocument.MaxRow() + 1;
      }
      for (const entry of this.mvData.splice(ni, nj - ni)) entry.Dispose();
    }
    if (insert < this.rDocument.MaxRow() + 1) {
      if (!split) this.mvData.splice(insert, 0, new ScAttrEntry());
      else {
        const tail = new ScAttrEntry(this.mvData[insert - 1] as ScAttrEntry);
        tail.nEndRow = (this.mvData[insert - 1] as ScAttrEntry).nEndRow;
        this.mvData.splice(insert, 0, new ScAttrEntry(), tail);
      }
      if (insert) (this.mvData[insert - 1] as ScAttrEntry).nEndRow = start - 1;
      (this.mvData[insert] as ScAttrEntry).nEndRow = end;
      (this.mvData[insert] as ScAttrEntry).setScPatternAttr(pattern);
    }
  }
  /** Original native attribute run copying,including offset clipping,canonical defaults,merge-flag stripping and actual helper migration. @param first - Destination first row. @param last - Destination last row. @param dy - Source-to-destination displacement. @param target - Actual target attribute owner. @param strip - Original default NONE. @returns Nothing. */
  CopyArea(first: number, last: number, dy: number, target: ScAttrArray, strip = ScMF.NONE): void {
    first -= dy;
    last -= dy;
    let destination = Math.max(first + dy, 0);
    const end = Math.min(last + dy, this.rDocument.MaxRow()),
      sameHelper =
        this.rDocument.getCellAttributeHelper() === target.rDocument.getCellAttributeHelper(),
      sourceDefault = this.rDocument.getCellAttributeHelper().getDefaultCellAttribute(),
      targetDefault = target.rDocument.getCellAttributeHelper().getDefaultCellAttribute();
    if (!this.mvData.length) {
      const holder = new CellAttributeHolder(targetDefault);
      try {
        target.SetPatternArea(destination, end, holder);
      } finally {
        holder.Dispose();
      }
      return;
    }
    for (let index = 0; index < this.mvData.length && destination <= end; ++index) {
      const entry = this.mvData[index] as ScAttrEntry;
      if (entry.nEndRow >= first) {
        const pattern = entry.getScPatternAttr() as ScPatternAttr;
        let holder: CellAttributeHolder;
        if (ScPatternAttr.areSame(sourceDefault, pattern))
          holder = new CellAttributeHolder(targetDefault);
        else if (strip !== ScMF.NONE) {
          const temporary = new ScPatternAttr(pattern),
            flags =
              strip === ScMF.All
                ? ScMF.NONE
                : (((temporary.GetItem(ATTR_MERGE_FLAG) as ScMergeFlagAttr).GetValue() &
                    ~strip) as ScMF);
          if (flags !== ScMF.NONE) temporary.ItemSetPut(new ScMergeFlagAttr(flags));
          else temporary.ItemSetClearItem(ATTR_MERGE_FLAG);
          if (sameHelper) holder = new CellAttributeHolder(temporary, true);
          else {
            try {
              holder = temporary.MigrateToDocument(target.rDocument, this.rDocument);
            } finally {
              temporary.Dispose();
            }
          }
        } else
          holder = sameHelper
            ? new CellAttributeHolder(pattern)
            : pattern.MigrateToDocument(target.rDocument, this.rDocument);
        try {
          target.SetPatternArea(destination, Math.min(entry.nEndRow + dy, end), holder);
        } finally {
          holder.Dispose();
        }
      }
      destination = Math.max(destination, (this.mvData[index] as ScAttrEntry).nEndRow + dy + 1);
    }
  }
}
