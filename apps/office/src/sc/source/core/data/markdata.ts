/** @fileoverview Original markdata.cxx selection flags, selected sheets, simple/multiple ranges, spans and envelopes over actual Calc owners. */
import { ScRange } from "../../../inc/address";
import type { ScAddressDocument } from "../tool/address";
import { ScRangeList } from "../../../inc/rangelst";
import { ScMultiSel, ScMultiSelIter } from "../../../inc/markmulti";
import { ScSheetLimits } from "../../../inc/sheetlimits";
import {
  ScFlatBoolRowSegments,
  ScFlatBoolColSegments,
  ScFlatBoolRowSegmentsForwardIterator,
} from "../../../inc/segmenttree";
import { ColRowSpan } from "../../../inc/columnspanset";
import { toSpanArray } from "../../../inc/fstalgorithm";
import { flat_segment_tree } from "../../../../external/mdds/include/mdds/flat_segment_tree";
import type { SCCOL, SCROW, SCTAB } from "../../../inc/types";
import type { ScMarkArray } from "../../../inc/markarr";

/** Expands only original column/row bounds, retaining destination sheet endpoints. @param destination - Mutable cover. @param added - Additional range. @returns Nothing. */
function addRanges(destination: ScRange, added: ScRange): void {
  let [c1, r1, , c2, r2] = added.GetVars();
  if (c1 > c2) [c1, c2] = [c2, c1];
  if (r1 > r2) [r1, r2] = [r2, r1];
  if (c1 < destination.aStart.Col()) destination.aStart.SetCol(c1);
  if (r1 < destination.aStart.Row()) destination.aStart.SetRow(r1);
  if (c2 > destination.aEnd.Col()) destination.aEnd.SetCol(c2);
  if (r2 > destination.aEnd.Row()) destination.aEnd.SetRow(r2);
}

/** Original selection owner; document/column/browser consumers remain separate owners. */
export class ScMarkData implements Iterable<SCTAB> {
  private readonly maTabMarked = new Set<SCTAB>();
  private readonly aMarkRange = new ScRange();
  private readonly aMultiRange = new ScRange();
  private readonly aMultiSel: ScMultiSel;
  private readonly aTopEnvelope = new ScRangeList();
  private readonly aBottomEnvelope = new ScRangeList();
  private readonly aLeftEnvelope = new ScRangeList();
  private readonly aRightEnvelope = new ScRangeList();
  private readonly mrSheetLimits: ScSheetLimits;
  private bMarked = false;
  private bMultiMarked = false;
  private bMarking = false;
  private bMarkIsNeg = false;

  /** Constructs original explicit bounds, optimized range-list initialization or a default value copy. @param source - Bounds or copied owner. @param list - Original range list. @returns Owner. */
  public constructor(source: ScSheetLimits | ScMarkData, list?: ScRangeList) {
    if (source instanceof ScMarkData) {
      this.mrSheetLimits = source.mrSheetLimits;
      this.aMultiSel = new ScMultiSel(source.aMultiSel);
      this.assign(source);
    } else {
      this.mrSheetLimits = source;
      this.aMultiSel = new ScMultiSel(source);
      this.ResetMark();
      if (list) {
        for (const range of list) this.SelectTable(range.aStart.Tab(), true);
        if (list.size() > 1) {
          this.bMultiMarked = true;
          this.aMultiRange.assign(list.Combine());
          this.aMultiSel.Set(list);
        } else if (list.size() === 1) this.SetMarkArea(list.at(0));
      }
    }
  }
  /** Adapts default native move construction with source bounds. @param source - Moved owner. @returns New owner. */
  public static move(source: ScMarkData): ScMarkData {
    return new ScMarkData(source.mrSheetLimits).moveAssign(source);
  }
  /** Copies all original values while retaining receiver sheet limits. @param source - Original value. @returns Receiver. */
  public assign(source: ScMarkData): this {
    this.SetSelectedTabs(source.maTabMarked);
    this.aMarkRange.assign(source.aMarkRange);
    this.aMultiRange.assign(source.aMultiRange);
    this.aMultiSel.assign(source.aMultiSel);
    this.aTopEnvelope.assign(source.aTopEnvelope);
    this.aBottomEnvelope.assign(source.aBottomEnvelope);
    this.aLeftEnvelope.assign(source.aLeftEnvelope);
    this.aRightEnvelope.assign(source.aRightEnvelope);
    this.bMarked = source.bMarked;
    this.bMultiMarked = source.bMultiMarked;
    this.bMarking = source.bMarking;
    this.bMarkIsNeg = source.bMarkIsNeg;
    return this;
  }
  /** Moves original containers and copies range/scalar values; native source lifetime states remain runtime-dependent. @param source - Moved owner. @returns Receiver. */
  public moveAssign(source: ScMarkData): this {
    this.SetSelectedTabs(source.maTabMarked);
    source.maTabMarked.clear();
    this.aMarkRange.assign(source.aMarkRange);
    this.aMultiRange.assign(source.aMultiRange);
    this.aMultiSel.moveAssign(source.aMultiSel);
    this.aTopEnvelope.moveAssign(source.aTopEnvelope);
    this.aBottomEnvelope.moveAssign(source.aBottomEnvelope);
    this.aLeftEnvelope.moveAssign(source.aLeftEnvelope);
    this.aRightEnvelope.moveAssign(source.aRightEnvelope);
    this.bMarked = source.bMarked;
    this.bMultiMarked = source.bMultiMarked;
    this.bMarking = source.bMarking;
    this.bMarkIsNeg = source.bMarkIsNeg;
    return this;
  }
  /** Resets mark flags/storage/envelopes while retaining selected sheets and range values. @returns Nothing. */
  public ResetMark(): void {
    this.aMultiSel.Clear();
    this.bMarked = this.bMultiMarked = false;
    this.bMarking = this.bMarkIsNeg = false;
    this.aTopEnvelope.RemoveAll();
    this.aBottomEnvelope.RemoveAll();
    this.aLeftEnvelope.RemoveAll();
    this.aRightEnvelope.RemoveAll();
  }
  /** Sets and orders the simple rectangle, selecting its first sheet only when previously unmarked with no selected sheets. @param range - Original rectangle. @returns Nothing. */
  public SetMarkArea(range: ScRange): void {
    this.aMarkRange.assign(range);
    this.aMarkRange.PutInOrder();
    if (!this.bMarked) {
      if (!this.GetSelectCount()) this.SelectTable(this.aMarkRange.aStart.Tab(), true);
      this.bMarked = true;
    }
  }
  /** Applies the original recursive simple-to-multi setup and expanding raw multi bounds. @param range - Rectangle. @param mark - Mark or clear. @param setupMulti - Original recursive-only setup flag. @returns Nothing. */
  public SetMultiMarkArea(range: ScRange, mark = true, setupMulti = false): void {
    if (this.aMultiSel.IsEmpty()) {
      if (this.bMarked && !this.bMarkIsNeg && !setupMulti) {
        this.bMarked = false;
        this.SetMultiMarkArea(this.aMarkRange, true, true);
      }
    }
    let [c1, r1, , c2, r2] = range.GetVars();
    if (c1 > c2) [c1, c2] = [c2, c1];
    if (r1 > r2) [r1, r2] = [r2, r1];
    this.aMultiSel.SetMarkArea(c1, c2, r1, r2, mark);
    if (this.bMultiMarked) addRanges(this.aMultiRange, range);
    else {
      this.aMultiRange.assign(range);
      this.bMultiMarked = true;
    }
  }
  /** Reads the simple-mark flag. @returns Flag. */
  public IsMarked(): boolean {
    return this.bMarked;
  }
  /** Reads the multi-mark flag. @returns Flag. */
  public IsMultiMarked(): boolean {
    return this.bMultiMarked;
  }
  /** Borrows the original simple rectangle. @returns Range. */
  public GetMarkArea(): Readonly<ScRange> {
    return this.aMarkRange;
  }
  /** Borrows the original expanding multi rectangle. @returns Range. */
  public GetMultiMarkArea(): Readonly<ScRange> {
    return this.aMultiRange;
  }
  /** Borrows the original flag-selected rectangle. @returns Range. */
  public GetArea(): Readonly<ScRange> {
    return this.bMultiMarked ? this.aMultiRange : this.aMarkRange;
  }
  /** Updates both rectangle sheet endpoints without changing sheet selection. @param tab - Sheet. @returns Nothing. */
  public SetAreaTab(tab: SCTAB): void {
    this.aMarkRange.aStart.SetTab(tab);
    this.aMarkRange.aEnd.SetTab(tab);
    this.aMultiRange.aStart.SetTab(tab);
    this.aMultiRange.aEnd.SetTab(tab);
  }
  /** Maintains native ordered unique sheet membership. @param tab - Sheet. @param selected - Membership. @returns Nothing. */
  public SelectTable(tab: SCTAB, selected: boolean): void {
    tab = (tab << 16) >> 16;
    if (selected) this.SetSelectedTabs([...this.maTabMarked, tab]);
    else this.maTabMarked.delete(tab);
  }
  /** Checks original sheet membership. @param tab - Sheet. @returns Selected. */
  public GetTableSelect(tab: SCTAB): boolean {
    return this.maTabMarked.has((tab << 16) >> 16);
  }
  /** Replaces sheet selection by one original value. @param tab - Sheet. @returns Nothing. */
  public SelectOneTable(tab: SCTAB): void {
    this.SetSelectedTabs([tab]);
  }
  /** Reads original signed16 selection count. @returns Count. */
  public GetSelectCount(): SCTAB {
    return (this.maTabMarked.size << 16) >> 16;
  }
  /** Returns the first native selected sheet, or original diagnostic fallback zero. @returns Sheet. */
  public GetFirstSelected(): SCTAB {
    return this.maTabMarked.values().next().value ?? 0;
  }
  /** Returns the last native selected sheet, or diagnostic fallback zero. @returns Sheet. */
  public GetLastSelected(): SCTAB {
    return [...this.maTabMarked].at(-1) ?? 0;
  }
  /** Borrows original ordered membership as a readonly collection. @returns Selected sheets. */
  public GetSelectedTabs(): ReadonlySet<SCTAB> {
    return this.maTabMarked;
  }
  /** Replaces membership from a copied input, including self input. @param tabs - Original selected sheets. @returns Nothing. */
  public SetSelectedTabs(tabs: Iterable<SCTAB>): void {
    const values = [...tabs]
      .map(
        /** Applies native sheet width. @param tab - Sheet. @returns Signed16 value. */ (tab) =>
          (tab << 16) >> 16,
      )
      .sort(
        /** Uses native numerical ordering. @param a - Left. @param b - Right. @returns Comparison. */ (
          a,
          b,
        ) => a - b,
      );
    this.maTabMarked.clear();
    for (const value of values) this.maTabMarked.add(value);
  }
  /** Iterates original sheets in ascending order. @returns Iterator. */
  public [Symbol.iterator](): SetIterator<SCTAB> {
    return this.maTabMarked.values();
  }
  /** Adapts original reverse sheet iteration. @returns Iterator. */
  public rbegin(): ArrayIterator<SCTAB> {
    return [...this.maTabMarked].reverse().values();
  }
  /** Sets original negative marking. @param flag - Flag. @returns Nothing. */
  public SetMarkNegative(flag: boolean): void {
    this.bMarkIsNeg = flag;
  }
  /** Reads original negative marking. @returns Flag. */
  public IsMarkNegative(): boolean {
    return this.bMarkIsNeg;
  }
  /** Sets original in-progress marking. @param flag - Flag. @returns Nothing. */
  public SetMarking(flag: boolean): void {
    this.bMarking = flag;
  }
  /** Reads original in-progress marking. @returns Flag. */
  public GetMarkingFlag(): boolean {
    return this.bMarking;
  }
  /** Borrows original multi-selection. @returns Owner. */
  public GetMultiSelData(): Readonly<ScMultiSel> {
    return this.aMultiSel;
  }
  /** Builds an independent original mark-array value. @param col - Column. @returns Array. */
  public GetMarkArray(col: SCCOL): ScMarkArray {
    return this.aMultiSel.GetMarkArray(col);
  }
  /** Converts an admitted simple mark and resets completely removed negative marks. @returns Nothing. */
  public MarkToMulti(): void {
    if (this.bMarked && !this.bMarking) {
      this.SetMultiMarkArea(this.aMarkRange, !this.bMarkIsNeg);
      this.bMarked = false;
      if (this.bMarkIsNeg && !this.HasAnyMultiMarks()) this.ResetMark();
    }
  }
  /** Reduces original equal single-interval columns to a simple rectangle. @returns Nothing. */
  public MarkToSimple(): void {
    if (this.bMarking) return;
    if (this.bMultiMarked && this.bMarked) this.MarkToMulti();
    if (!this.bMultiMarked) return;
    const range = new ScRange(this.aMultiRange);
    let first = range.aStart.Col(),
      last = range.aEnd.Col();
    while (first < last && !this.aMultiSel.HasMarks(first)) ++first;
    while (first < last && !this.aMultiSel.HasMarks(last)) --last;
    const [found, top, bottom] = this.aMultiSel.HasOneMark(first, 0, 0);
    let ok = found;
    if (found)
      for (let col = first + 1; col <= last && ok; ++col) {
        const [other, otherTop, otherBottom] = this.aMultiSel.HasOneMark(col, 0, 0);
        if (!other || otherTop !== top || otherBottom !== bottom) ok = false;
      }
    if (ok) {
      range.aStart.SetCol(first);
      range.aStart.SetRow(top);
      range.aEnd.SetCol(last);
      range.aEnd.SetRow(bottom);
      this.ResetMark();
      this.aMarkRange.assign(range);
      this.bMarked = true;
      this.bMarkIsNeg = false;
    }
  }
  /** Checks original admitted simple rectangle then multi storage. @param col - Column. @param row - Row. @param noSimple - Suppress simple selection. @returns Marked. */
  public IsCellMarked(col: SCCOL, row: SCROW, noSimple = false): boolean {
    col = (col << 16) >> 16;
    row |= 0;
    if (this.bMarked && !noSimple && !this.bMarkIsNeg)
      if (
        this.aMarkRange.aStart.Col() <= col &&
        this.aMarkRange.aEnd.Col() >= col &&
        this.aMarkRange.aStart.Row() <= row &&
        this.aMarkRange.aEnd.Row() >= row
      )
        return true;
    if (this.bMultiMarked) return this.aMultiSel.GetMark(col, row);
    return false;
  }
  /** Checks original full-height simple or multi column predicates. @param col - Column. @returns Marked. */
  public IsColumnMarked(col: SCCOL): boolean {
    col = (col << 16) >> 16;
    if (
      this.bMarked &&
      !this.bMarkIsNeg &&
      this.aMarkRange.aStart.Col() <= col &&
      this.aMarkRange.aEnd.Col() >= col &&
      this.aMarkRange.aStart.Row() === 0 &&
      this.aMarkRange.aEnd.Row() === this.mrSheetLimits.mnMaxRow
    )
      return true;
    if (this.bMultiMarked && this.aMultiSel.IsAllMarked(col, 0, this.mrSheetLimits.mnMaxRow))
      return true;
    return false;
  }
  /** Checks original full-width simple or global-row multi predicates. @param row - Row. @returns Marked. */
  public IsRowMarked(row: SCROW): boolean {
    row |= 0;
    if (
      this.bMarked &&
      !this.bMarkIsNeg &&
      this.aMarkRange.aStart.Col() === 0 &&
      this.aMarkRange.aEnd.Col() === this.mrSheetLimits.mnMaxCol &&
      this.aMarkRange.aStart.Row() <= row &&
      this.aMarkRange.aEnd.Row() >= row
    )
      return true;
    if (this.bMultiMarked) return this.aMultiSel.IsRowMarked(row);
    return false;
  }
  /** Imports original simple singleton or multi ranges with the empty-reset sheet-preservation rule. @param list - Original list. @param reset - Replace marks. @returns Nothing. */
  public MarkFromRangeList(list: ScRangeList, reset: boolean): void {
    const count = list.size();
    if (reset) {
      if (count > 0) this.maTabMarked.clear();
      this.ResetMark();
    }
    if (count === 1 && !this.bMarked && !this.bMultiMarked) {
      this.SetMarkArea(list.at(0));
      this.SelectTable(list.at(0).aStart.Tab(), true);
    } else
      for (const range of list) {
        this.SetMultiMarkArea(range);
        this.SelectTable(range.aStart.Tab(), true);
      }
  }
  /** Appends original column-grouped joined multi fragments and the independent simple range. @param list - Nullable output owner. @param clear - Clear first. @param forTab - Negative uses stored tab, otherwise explicit tab. @returns Nothing. */
  public FillRangeListWithMarks(
    list: ScRangeList | null,
    clear: boolean,
    forTab: SCTAB = -1,
  ): void {
    if (!list) return;
    forTab = (forTab << 16) >> 16;
    if (clear) list.RemoveAll();
    if (this.bMultiMarked) {
      const tab = forTab < 0 ? this.aMultiRange.aStart.Tab() : forTab;
      const first = this.aMultiRange.aStart.Col(),
        last = this.aMultiRange.aEnd.Col();
      for (let col = first; col <= last; ++col) {
        if (this.aMultiSel.HasMarks(col)) {
          let to = col + 1;
          for (; to <= last; ++to) if (!this.aMultiSel.HasEqualRowsMarked(col, to)) break;
          --to;
          const range = new ScRange(col, 0, tab, to, 0, tab),
            iterator = new ScMultiSelIter(this.aMultiSel, col);
          for (let result = iterator.Next(0, 0); result[0]; result = iterator.Next(0, 0)) {
            range.aStart.SetRow(result[1]);
            range.aEnd.SetRow(result[2]);
            list.Join(range);
          }
          col = to;
        }
      }
    }
    if (this.bMarked) {
      if (forTab < 0) list.push_back(this.aMarkRange);
      else {
        const range = new ScRange(this.aMarkRange);
        range.aStart.SetTab(forTab);
        range.aEnd.SetTab(forTab);
        list.push_back(range);
      }
    }
  }
  /** Repeats original range values for each selected sheet in native sheet order. @param list - Nullable mutable list. @returns Nothing. */
  public ExtendRangeListTables(list: ScRangeList | null): void {
    if (!list) return;
    const old = new ScRangeList(list);
    list.RemoveAll();
    for (const tab of this.maTabMarked)
      for (const value of old) {
        const range = new ScRange(value);
        range.aStart.SetTab(tab);
        range.aEnd.SetTab(tab);
        list.push_back(range);
      }
  }
  /** Returns independent original marked ranges. @returns List. */
  public GetMarkedRanges(): ScRangeList {
    const list = new ScRangeList();
    this.FillRangeListWithMarks(list, false);
    return list;
  }
  /** Returns original marked ranges with explicit sheet endpoints. @param tab - Sheet. @returns List. */
  public GetMarkedRangesForTab(tab: SCTAB): ScRangeList {
    const list = new ScRangeList();
    this.FillRangeListWithMarks(list, false, tab);
    return list;
  }
  /** Unions original marked row intervals through actual shared mdds and fstalgorithm. @returns Inclusive spans. */
  public GetMarkedRowSpans(): ColRowSpan[] {
    const ranges = this.GetMarkedRanges(),
      spans = new flat_segment_tree<boolean>(0, this.mrSheetLimits.mnMaxRow + 1, false);
    let position = spans.begin();
    for (const range of ranges)
      position = spans.insert(position, range.aStart.Row(), range.aEnd.Row() + 1, true)[0];
    return toSpanArray(spans, ColRowSpan);
  }
  /** Uses original plain-vector or tree-union column paths, independently of negative simple flags. @returns Inclusive spans. */
  public GetMarkedColSpans(): ColRowSpan[] {
    if (this.bMultiMarked) {
      const first = this.aMultiRange.aStart.Col(),
        last = this.aMultiRange.aEnd.Col();
      if (this.bMarked) {
        const spans = new flat_segment_tree<boolean>(0, this.mrSheetLimits.mnMaxCol + 1, false);
        let position = spans.begin();
        if (this.aMultiSel.GetRowSelArray().HasMarks())
          position = spans.insert(position, first, last + 1, true)[0];
        else
          for (let col = first; col <= last; ++col) {
            const array = this.aMultiSel.GetMultiSelArray(col);
            if (array && array.HasMarks()) position = spans.insert(position, col, col + 1, true)[0];
          }
        spans.insert(position, this.aMarkRange.aStart.Col(), this.aMarkRange.aEnd.Col() + 1, true);
        return toSpanArray(spans, ColRowSpan);
      } else {
        const values: ColRowSpan[] = [];
        if (this.aMultiSel.GetRowSelArray().HasMarks()) {
          values.push(new ColRowSpan(first, last));
          return values;
        }
        const span = new ColRowSpan(-1, -1);
        for (let col = first; col <= last; ++col) {
          const array = this.aMultiSel.GetMultiSelArray(col);
          if (array && array.HasMarks()) {
            if (span.mnStart === -1) span.mnStart = col;
            span.mnEnd = col;
          } else if (span.mnStart !== -1) {
            values.push(new ColRowSpan(span.mnStart, span.mnEnd));
            span.mnStart = -1;
          }
        }
        if (span.mnStart !== -1) values.push(new ColRowSpan(span.mnStart, span.mnEnd));
        return values;
      }
    }
    const values: ColRowSpan[] = [];
    if (this.bMarked)
      values.push(new ColRowSpan(this.aMarkRange.aStart.Col(), this.aMarkRange.aEnd.Col()));
    return values;
  }
  /** Retains original full-width global-row shortcut and per-column multi query. @param range - Test area. @returns Covered. */
  public IsAllMarked(range: ScRange): boolean {
    const [c1, r1, , c2, r2] = range.GetVars();
    if (!this.bMultiMarked) {
      if (
        this.bMarked &&
        !this.bMarkIsNeg &&
        this.aMarkRange.aStart.Col() <= c1 &&
        this.aMarkRange.aEnd.Col() >= c2 &&
        this.aMarkRange.aStart.Row() <= r1 &&
        this.aMarkRange.aEnd.Row() >= r2
      )
        return true;
      return false;
    }
    if (c1 === 0 && c2 === this.mrSheetLimits.mnMaxCol)
      return this.aMultiSel.IsRowRangeMarked(r1, r2);
    let ok = true;
    for (let col = c1; col <= c2 && ok; ++col)
      if (!this.aMultiSel.IsAllMarked(col, r1, r2)) ok = false;
    return ok;
  }
  /** Retains original simple conditional order or delegates multi storage. @param last - Last column. @param min - Minimum. @returns Start column. */
  public GetStartOfEqualColumns(last: SCCOL, min: SCCOL = 0): SCCOL {
    last = (last << 16) >> 16;
    min = (min << 16) >> 16;
    if (!this.bMultiMarked) {
      if (this.bMarked && !this.bMarkIsNeg) {
        if (this.aMarkRange.aEnd.Col() >= min && this.aMarkRange.aStart.Col() < last)
          return this.aMarkRange.aEnd.Col() + 1;
        if (this.aMarkRange.aEnd.Col() >= last && this.aMarkRange.aStart.Col() <= min)
          return this.aMarkRange.aStart.Col();
      }
      return min;
    }
    return this.aMultiSel.GetStartOfEqualColumns(last, min);
  }
  /** Returns the original input row when multi flag is absent. @param col - Column. @param row - Start. @param up - Upward. @returns Row. */
  public GetNextMarked(col: SCCOL, row: SCROW, up: boolean): SCROW {
    return this.bMultiMarked ? this.aMultiSel.GetNextMarked(col, row, up) : row | 0;
  }
  /** Checks the original multi flag and column storage. @param col - Column. @returns Marks. */
  public HasMultiMarks(col: SCCOL): boolean {
    return this.bMultiMarked && this.aMultiSel.HasMarks(col);
  }
  /** Checks the original multi flag and storage. @returns Marks. */
  public HasAnyMultiMarks(): boolean {
    return this.bMultiMarked && this.aMultiSel.HasAnyMarks();
  }
  /** Shifts only selected-sheet membership for insertion. @param tab - Inserted sheet. @returns Nothing. */
  public InsertTab(tab: SCTAB): void {
    tab = (tab << 16) >> 16;
    const values: SCTAB[] = [];
    for (const value of this.maTabMarked) values.push(value < tab ? value : value + 1);
    this.SetSelectedTabs(values);
  }
  /** Deletes the selected sheet and shifts greater sheet indices. @param tab - Deleted sheet. @returns Nothing. */
  public DeleteTab(tab: SCTAB): void {
    tab = (tab << 16) >> 16;
    const values: SCTAB[] = [];
    for (const value of this.maTabMarked)
      if (value < tab) values.push(value);
      else if (value > tab) values.push(value - 1);
    this.SetSelectedTabs(values);
  }
  /** Uses original range movement and multi column shift when flags admit them. @param document - Existing numerical document getter view. @param start - First column. @param offset - Signed32 shift. @returns Nothing. */
  public ShiftCols(document: ScAddressDocument, start: SCCOL, offset: number): void {
    start = (start << 16) >> 16;
    offset |= 0;
    if (this.bMarked) this.aMarkRange.IncColIfNotLessThan(document, start, offset);
    if (this.bMultiMarked) {
      this.aMultiRange.IncColIfNotLessThan(document, start, offset);
      this.aMultiSel.ShiftCols(start, offset);
    }
  }
  /** Uses original range movement and multi row shift when flags admit them. @param document - Existing numerical document getter view. @param start - First row. @param offset - Signed32 shift. @returns Nothing. */
  public ShiftRows(document: ScAddressDocument, start: SCROW, offset: number): void {
    start |= 0;
    offset |= 0;
    if (this.bMarked) this.aMarkRange.IncRowIfNotLessThan(document, start, offset);
    if (this.bMultiMarked) {
      this.aMultiRange.IncRowIfNotLessThan(document, start, offset);
      this.aMultiSel.ShiftRows(start, offset);
    }
  }
  /** Borrows original top envelope storage. @returns List. */
  public GetTopEnvelope(): Readonly<ScRangeList> {
    return this.aTopEnvelope;
  }
  /** Borrows original bottom envelope storage. @returns List. */
  public GetBottomEnvelope(): Readonly<ScRangeList> {
    return this.aBottomEnvelope;
  }
  /** Borrows original left envelope storage. @returns List. */
  public GetLeftEnvelope(): Readonly<ScRangeList> {
    return this.aLeftEnvelope;
  }
  /** Borrows original right envelope storage. @returns List. */
  public GetRightEnvelope(): Readonly<ScRangeList> {
    return this.aRightEnvelope;
  }
  /** Generates original adjacent envelopes and cover, retaining accumulated envelope storage across calls. @param cover - Mutable caller output. @returns Nothing. */
  public GetSelectionCover(cover: ScRange): void {
    if (this.bMultiMarked) {
      cover.assign(this.aMultiRange);
      let first = this.aMultiRange.aStart.Col(),
        last = this.aMultiRange.aEnd.Col();
      if (first > last) [first, last] = [last, first];
      first = first === 0 ? first : first - 1;
      last = last === this.mrSheetLimits.mnMaxCol ? last : last + 1;
      let previous: ScFlatBoolRowSegments | null = null;
      const top = new Map<SCROW, ScFlatBoolColSegments>(),
        bottom = new Map<SCROW, ScFlatBoolColSegments>();
      const none = new ScFlatBoolRowSegments(this.mrSheetLimits.mnMaxRow);
      none.setFalse(0, this.mrSheetLimits.mnMaxRow);
      let previousUnmarked = false;
      const tab = this.aMultiRange.aStart.Tab();
      for (let col = first; col <= last; ++col) {
        const currentUnmarked = !this.aMultiSel.HasMarks(col);
        let current: ScFlatBoolRowSegments | null = null;
        if (!currentUnmarked) {
          current = new ScFlatBoolRowSegments(this.mrSheetLimits.mnMaxRow);
          current.setFalse(0, this.mrSheetLimits.mnMaxRow);
          const iterator = new ScMultiSelIter(this.aMultiSel, col),
            prev = new ScFlatBoolRowSegmentsForwardIterator(previous ?? none),
            prev1 = new ScFlatBoolRowSegmentsForwardIterator(previous ?? none);
          let topPrev = 0,
            bottomPrev = 0;
          for (let result = iterator.Next(0, 0); result[0]; result = iterator.Next(0, 0)) {
            const a = result[1],
              b = result[2];
            current.setTrue(a, b);
            if (previousUnmarked && col > first) {
              const added = new ScRange(col - 1, a, tab, col - 1, b, tab);
              addRanges(cover, added);
              this.aLeftEnvelope.push_back(added);
            } else if (col > first) {
              let a1 = a,
                b1 = a;
              while (a1 <= b && b1 <= b) {
                // Original assertion is guaranteed by this initialized cursor
                // and loop bounds within the row owner's inclusive maximum.
                const [, marked] = prev.getValue(a1, false);
                if (marked) {
                  a1 = prev.getLastPos() + 1;
                  b1 = a1;
                } else {
                  b1 = prev.getLastPos();
                  if (b1 > b) b1 = b;
                  const added = new ScRange(col - 1, a1, tab, col - 1, b1, tab);
                  addRanges(cover, added);
                  this.aLeftEnvelope.push_back(added);
                  a1 = ++b1;
                }
              }
              while (topPrev <= b && bottomPrev <= b) {
                const [, marked] = prev1.getValue(topPrev, false);
                if (marked) {
                  bottomPrev = prev1.getLastPos();
                  if (topPrev < a) {
                    if (bottomPrev >= a) {
                      bottomPrev = a - 1;
                      const added = new ScRange(col, topPrev, tab, col, bottomPrev, tab);
                      addRanges(cover, added);
                      this.aRightEnvelope.push_back(added);
                      topPrev = bottomPrev = b + 1;
                    } else {
                      const added = new ScRange(col, topPrev, tab, col, bottomPrev, tab);
                      addRanges(cover, added);
                      this.aRightEnvelope.push_back(added);
                      topPrev = ++bottomPrev;
                    }
                  } else topPrev = bottomPrev = b + 1;
                } else {
                  bottomPrev = prev1.getLastPos();
                  topPrev = ++bottomPrev;
                }
              }
            }
            if (a) {
              const added = new ScRange(col, a - 1, tab, col, a - 1, tab);
              addRanges(cover, added);
              if (!top.has(a - 1))
                top.set(a - 1, new ScFlatBoolColSegments(this.mrSheetLimits.mnMaxCol));
              (top.get(a - 1) as ScFlatBoolColSegments).setTrue(col, col);
            }
            if (b < this.mrSheetLimits.mnMaxRow) {
              const added = new ScRange(col, b + 1, tab, col, b + 1, tab);
              addRanges(cover, added);
              if (!bottom.has(b + 1))
                bottom.set(b + 1, new ScFlatBoolColSegments(this.mrSheetLimits.mnMaxCol));
              (bottom.get(b + 1) as ScFlatBoolColSegments).setTrue(col, col);
            }
          }
          while (
            topPrev <= this.mrSheetLimits.mnMaxRow &&
            bottomPrev <= this.mrSheetLimits.mnMaxRow &&
            col > first
          ) {
            const [, marked] = prev1.getValue(topPrev, false);
            if (marked) {
              bottomPrev = prev1.getLastPos();
              const added = new ScRange(col, topPrev, tab, col, bottomPrev, tab);
              addRanges(cover, added);
              this.aRightEnvelope.push_back(added);
              topPrev = ++bottomPrev;
            } else {
              bottomPrev = prev1.getLastPos();
              topPrev = ++bottomPrev;
            }
          }
        } else if (col > first) {
          previousUnmarked = true;
          let topPrev = 0,
            bottomPrev = 0;
          const prev = new ScFlatBoolRowSegmentsForwardIterator(previous ?? none);
          while (
            topPrev <= this.mrSheetLimits.mnMaxRow &&
            bottomPrev <= this.mrSheetLimits.mnMaxRow
          ) {
            const [, marked] = prev.getValue(topPrev, false);
            if (marked) {
              bottomPrev = prev.getLastPos();
              const added = new ScRange(col, topPrev, tab, col, bottomPrev, tab);
              addRanges(cover, added);
              this.aRightEnvelope.push_back(added);
              topPrev = ++bottomPrev;
            } else {
              bottomPrev = prev.getLastPos();
              topPrev = ++bottomPrev;
            }
          }
        }
        previous = currentUnmarked ? null : current;
      }
      // std::unordered_map does not specify its iteration order. The original
      // ranges and within-row segment order are retained; native row ordering
      // is a runtime adaptation requiring explicit comparison evidence.
      for (const [rows, envelope] of [
        [top, this.aTopEnvelope],
        [bottom, this.aBottomEnvelope],
      ] as const) {
        for (const [row, segments] of rows) {
          let start = first;
          const range = { mnCol1: 0, mnCol2: 0, mbValue: false };
          while (start <= last) {
            if (!segments.getRangeData(start, range)) break;
            if (range.mbValue)
              envelope.push_back(new ScRange(range.mnCol1, row, tab, range.mnCol2, row, tab));
            start = range.mnCol2 + 1;
          }
        }
      }
    } else if (this.bMarked) {
      this.aMarkRange.PutInOrder();
      const [c1, r1, t1, c2, r2, t2] = this.aMarkRange.GetVars();
      let firstCol = c1,
        lastCol = c2,
        firstRow = r1,
        lastRow = r2;
      if (c1 > 0) {
        this.aLeftEnvelope.push_back(new ScRange(c1 - 1, r1, t1, c1 - 1, r2, t2));
        --firstCol;
      }
      if (r1 > 0) {
        this.aTopEnvelope.push_back(new ScRange(c1, r1 - 1, t1, c2, r1 - 1, t2));
        --firstRow;
      }
      if (c2 < this.mrSheetLimits.mnMaxCol) {
        this.aRightEnvelope.push_back(new ScRange(c2 + 1, r1, t1, c2 + 1, r2, t2));
        ++lastCol;
      }
      if (r2 < this.mrSheetLimits.mnMaxRow) {
        this.aBottomEnvelope.push_back(new ScRange(c1, r2 + 1, t1, c2, r2 + 1, t2));
        ++lastRow;
      }
      cover.assign(new ScRange(firstCol, firstRow, t1, lastCol, lastRow, t2));
    }
  }
}
