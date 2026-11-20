/** @fileoverview Calc color-scale entries, shared range value cache, and native RGB interpolation. */
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { approxFloor } from "../../../../sal/inc/rtl/math";
import { Color } from "../../../../tools/inc/color";
import type { Grammar } from "../../../../formula/inc/grammar";
import type { ScAddress } from "../../../inc/address";
import type { ScRefCellValue } from "../../../inc/cellvalue";
import type { ScDocument } from "../../../inc/document";
import type {
  RefUpdateContext,
  RefUpdateDeleteTabContext,
  RefUpdateInsertTabContext,
  RefUpdateMoveTabContext,
} from "../../../inc/refupdatecontext";
import { ScDoubleRefToken, ScSingleRefToken } from "../tool/token";
import { ScFormatEntry, ScFormatEntryType, type ScConditionalFormat } from "./conditio";
import { ScConditionMode } from "./conditio.entry";
import { ScHorizontalCellIterator } from "./dociter";
import { ScFormulaCell } from "./formulacell";

/** Original threshold kinds from colorscale.hxx. */
export enum ScColorScaleEntryType {
  AUTO,
  MIN,
  MAX,
  PERCENTILE,
  VALUE,
  PERCENT,
  FORMULA,
}

/** Original ScColorScaleEntry owns its formula cell independently of worksheet storage. */
export class ScColorScaleEntry {
  private cell: ScFormulaCell | undefined;
  private owner: ScDocument | undefined;
  private readonly color: Color;

  /** Constructs the original value, color, type and comparison mode. @param value - Stored threshold. @param color - Source RGB color. @param type - Threshold kind. @param mode - Boundary comparison. @returns Entry. */
  constructor(
    private readonly value = 0,
    color: Readonly<Color> = new Color(),
    private readonly type = ScColorScaleEntryType.VALUE,
    private readonly mode = ScConditionMode.EqGreater,
  ) {
    this.color = new Color(color);
  }

  /** Compiles a detached formula cell at its native source address. @param formula - Threshold expression. @param doc - Workbook. @param address - Formula origin. @param grammar - Source grammar. @returns Nothing. */
  SetFormula(formula: string, doc: ScDocument, address: ScAddress, grammar: Grammar): void {
    const source = unicode(formula);
    try {
      this.BindFormula(new ScFormulaCell(doc, address, source, grammar), doc);
    } finally {
      source.dispose();
    }
  }

  /** Binds the detached cell and starts its native reference subscriptions. @param cell - Owned cell. @param doc - Workbook. @returns Nothing. */
  private BindFormula(cell: ScFormulaCell, doc: ScDocument): void {
    this.Dispose();
    this.cell = cell;
    this.owner = doc;
    cell.SetNeedNumberFormat(false);
    cell.StartListeningTo(doc);
  }

  /** Serializes the owned token array in the requested grammar. @param grammar - Target grammar. @returns Formula text including its native equals prefix. */
  GetFormula(grammar: Grammar): string {
    const formula = this.cell?.GetFormula(grammar);
    if (!formula) return "";
    try {
      return text(formula);
    } finally {
      formula.dispose();
    }
  }

  /** Evaluates formulas on demand and returns the original non-numeric sentinel. @returns Threshold. */
  GetValue(): number {
    if (!this.cell) return this.value;
    this.cell.Interpret();
    return this.cell.IsValue() ? this.cell.GetValue() : Number.MAX_VALUE;
  }

  /** Reads the stored threshold type. @returns Native type. */
  GetType(): ScColorScaleEntryType {
    return this.type;
  }

  /** Reads the original comparison mode. @returns Mode. */
  GetMode(): ScConditionMode {
    return this.mode;
  }

  /** Borrows the threshold color. @returns RGB color. */
  GetColor(): Readonly<Color> {
    return this.color;
  }

  /** Copies the threshold into the destination document. @param doc - Destination. @returns Owned copy. */
  Clone(doc: ScDocument): ScColorScaleEntry {
    const copy = new ScColorScaleEntry(this.value, this.color, this.type, this.mode);
    if (this.cell)
      copy.BindFormula(new ScFormulaCell(doc, this.cell.aPos, this.cell.GetCode().Clone()), doc);
    return copy;
  }

  /** Updates the formula when the native document adjusts references. @param context - Reference update. @returns Nothing. */
  UpdateReference(context: RefUpdateContext): void {
    this.cell?.UpdateReference(context);
  }

  /** Maps the detached formula's local sheet references and base together. @param map - Maps a sheet index or reports a deleted sheet. @returns Nothing. */
  RemapTabs(map: (tab: number) => number | null): void {
    const cell = this.cell;
    const doc = this.owner;
    if (!cell || !doc) return;
    cell.EndListeningTo(doc);
    const prior = cell.aPos.Tab();
    const next = map(prior) ?? prior;
    for (const token of cell.GetCode().Tokens()) {
      const refs =
        token instanceof ScSingleRefToken
          ? [token.GetSingleRef()]
          : token instanceof ScDoubleRefToken
            ? [token.GetDoubleRef().Ref1, token.GetDoubleRef().Ref2]
            : [];
      for (const ref of refs) {
        if (ref.IsTabDeleted()) continue;
        const mapped = map(ref.Tab() + (ref.IsTabRel() ? prior : 0));
        if (mapped === null) ref.SetTabDeleted(true);
        else if (ref.IsTabRel()) ref.SetRelTab(mapped - next);
        else ref.SetAbsTab(mapped);
      }
    }
    cell.aPos.SetTab(next);
    cell.SetDirtyVar();
    cell.StartListeningTo(doc);
  }

  /** Releases the owned formula and its subscriptions. @returns Nothing. */
  Dispose(): void {
    this.cell?.Dispose();
    this.cell = undefined;
    this.owner = undefined;
  }
}

/** Reads a numeric cell or its evaluated value as the native ScRefCellValue does. @param cell - Numeric cell. @returns Value. */
function numericValue(cell: ScRefCellValue): number {
  return cell.getFormula()?.GetValue() ?? cell.getDouble();
}

/** Original shared owner for sorted conditional range values. */
export abstract class ScColorFormat extends ScFormatEntry {
  protected parent: ScConditionalFormat | null = null;

  /** Attaches the containing format and its shared cache. @param parent - Native format. @returns Nothing. */
  override SetParent(parent: ScConditionalFormat | null): void {
    this.parent = parent;
  }

  /** Collects live numeric values, including duplicates from overlapping ranges. @returns Sorted range values. */
  protected getValues(): readonly number[] {
    const parent = this.parent;
    if (!parent) return [];
    const cache = parent.GetCache();
    if (cache?.length) return cache;
    const values: number[] = [];
    const col: [number] = [0],
      row: [number] = [0];
    for (const range of parent.GetRange()) {
      const { aStart, aEnd } = range;
      if (!this.mrDoc.FetchTable(aStart.Tab())) continue;
      const cells = new ScHorizontalCellIterator(
        this.mrDoc,
        aStart.Tab(),
        aStart.Col(),
        aStart.Row(),
        aEnd.Col(),
        aEnd.Row(),
      );
      for (let cell = cells.GetNext(col, row); cell; cell = cells.GetNext(col, row))
        if (cell.hasNumeric()) values.push(numericValue(cell));
    }
    values.sort(
      /** Sorts in original ascending numeric order. @param left - First value. @param right - Second value. @returns Sort order. */ (
        left,
        right,
      ) => left - right,
    );
    parent.SetCache(values);
    return values;
  }
}

/** Original color interpolation with truncation toward zero before adding the low channel. @param value - Cell value. @param min - Lower threshold. @param low - Lower channel. @param max - Upper threshold. @param high - Upper channel. @returns Interpolated channel. */
function GetColorValue(value: number, min: number, low: number, max: number, high: number): number {
  if (value <= min) return low;
  if (value >= max) return high;
  return Math.trunc(((value - min) / (max - min)) * (high - low)) + low;
}

/** Implements the original inclusive percentile over the sorted numeric values. @param values - Sorted range. @param position - Fractional percentile. @returns Interpolated value or absence. */
function GetPercentile(values: readonly number[], position: number): number | undefined {
  if (!values.length) return undefined;
  if (position < 0) return values[0];
  const last = values.length - 1;
  const offset = Math.min(1, position) * last;
  const index = approxFloor(offset);
  const first = values[index] as number;
  const remainder = offset - index;
  return !remainder || index === last
    ? first
    : first + remainder * ((values[index + 1] as number) - first);
}

/** Native ordered color scale. */
export class ScColorScaleFormat extends ScColorFormat implements Iterable<ScColorScaleEntry> {
  private readonly entries: ScColorScaleEntry[] = [];

  /** Returns the native rule discriminator. @returns Color scale type. */
  override GetType(): ScFormatEntryType {
    return ScFormatEntryType.Colorscale;
  }

  /** Transfers ownership of one threshold. @param entry - Owned threshold. @returns Nothing. */
  AddEntry(entry: ScColorScaleEntry): void {
    this.entries.push(entry);
  }

  /** Returns the threshold at its original position. @param index - Threshold index. @returns Entry or null. */
  GetEntry(index: number): ScColorScaleEntry | null {
    return this.entries[index] ?? null;
  }

  /** Iterates the native stop order. @returns Stop iterator. */
  [Symbol.iterator](): ArrayIterator<ScColorScaleEntry> {
    return this.entries.values();
  }

  /** Copies stops independently of the original cache. @param doc - Destination. @returns Owned rule. */
  override Clone(doc: ScDocument): ScColorScaleFormat {
    const result = new ScColorScaleFormat(doc);
    for (const entry of this.entries) result.AddEntry(entry.Clone(doc));
    return result;
  }

  /** Compares resolved color, type and numeric value, retaining native prefix comparison. @param other - Compared entry. @returns Comparison result. */
  override IsEqual(other: ScFormatEntry): boolean {
    if (!(other instanceof ScColorScaleFormat)) return false;
    for (const [index, entry] of this.entries.entries()) {
      const right = other.GetEntry(index);
      if (
        !right ||
        !entry.GetColor().IsRGBEqual(right.GetColor()) ||
        entry.GetType() !== right.GetType() ||
        entry.GetValue() !== right.GetValue()
      )
        return false;
    }
    return true;
  }

  /** Resolves one endpoint from the explicit threshold or range data. @param entry - First or last stop. @param first - Whether resolving the lower endpoint. @returns Endpoint. */
  private GetEndpoint(entry: ScColorScaleEntry, first: boolean): number {
    const type = entry.GetType();
    if (type === ScColorScaleEntryType.VALUE || type === ScColorScaleEntryType.FORMULA)
      return entry.GetValue();
    return this.getValues().at(first ? 0 : -1) ?? 0;
  }

  /** Evaluates the original threshold type. @param min - Scale minimum. @param max - Scale maximum. @param entry - Stop. @returns Threshold or absence. */
  private CalcValue(min: number, max: number, entry: ScColorScaleEntry): number | undefined {
    switch (entry.GetType()) {
      case ScColorScaleEntryType.MIN:
        return min;
      case ScColorScaleEntryType.MAX:
        return max;
      case ScColorScaleEntryType.PERCENT:
        return min + (max - min) * (entry.GetValue() / 100);
      case ScColorScaleEntryType.PERCENTILE:
        return GetPercentile(this.getValues(), entry.GetValue() / 100);
      default:
        return entry.GetValue();
    }
  }

  /** Resolves the native background for a numeric cell, including tied upper percentiles. @param position - Target cell. @returns Blended RGB or absence. */
  override GetColor(position: ScAddress): Color | undefined {
    const cell = this.mrDoc.GetRefCellValue(position);
    const [first, second] = this.entries;
    const last = this.entries.at(-1);
    if (!cell.hasNumeric() || !first || !second || !last) return undefined;
    const value = numericValue(cell);
    const min = this.GetEndpoint(first, true),
      max = this.GetEndpoint(last, false);
    if (min > max) return undefined;
    let low = this.CalcValue(min, max, first),
      high = this.CalcValue(min, max, second);
    if (low === undefined || high === undefined) return undefined;
    let lowColor = first.GetColor(),
      highColor = second.GetColor();
    const equal =
      second.GetType() === ScColorScaleEntryType.PERCENTILE && value === max && value === high;
    for (let index = 2; index < this.entries.length && (value > high || equal); ++index) {
      const stop = this.entries[index] as ScColorScaleEntry;
      low = equal ? high - 1 : high;
      lowColor = highColor;
      highColor = stop.GetColor();
      high = this.CalcValue(min, max, stop);
      if (high === undefined) return undefined;
    }
    return new Color(
      GetColorValue(value, low, lowColor.GetRed(), high, highColor.GetRed()),
      GetColorValue(value, low, lowColor.GetGreen(), high, highColor.GetGreen()),
      GetColorValue(value, low, lowColor.GetBlue(), high, highColor.GetBlue()),
    );
  }

  /** Updates the owned threshold formula references. @param context - Native update. @returns Nothing. */
  override UpdateReference(context: RefUpdateContext): void {
    for (const entry of this.entries) entry.UpdateReference(context);
  }

  /** Moves threshold references past inserted sheets. @param context - Native insertion. @returns Nothing. */
  override UpdateInsertTab(context: RefUpdateInsertTabContext): void {
    for (const entry of this.entries)
      entry.RemapTabs(
        /** Maps an original sheet index. @param tab - Original sheet. @returns Mapped sheet. */ (
          tab,
        ) => (tab >= context.mnInsertPos ? tab + context.mnSheets : tab),
      );
  }

  /** Moves threshold references past deleted sheets. @param context - Native deletion. @returns Nothing. */
  override UpdateDeleteTab(context: RefUpdateDeleteTabContext): void {
    const end = context.mnDeletePos + context.mnSheets;
    for (const entry of this.entries)
      entry.RemapTabs(
        /** Maps an original sheet index. @param tab - Original sheet. @returns Mapped sheet or deleted sentinel. */ (
          tab,
        ) => (tab < context.mnDeletePos ? tab : tab < end ? null : tab - context.mnSheets),
      );
  }

  /** Adjusts threshold references after moving a sheet. @param context - Native move. @returns Nothing. */
  override UpdateMoveTab(context: RefUpdateMoveTabContext): void {
    for (const entry of this.entries) entry.RemapTabs(context.getNewTab.bind(context));
  }

  /** Releases all owned threshold formulas. @returns Nothing. */
  override Dispose(): void {
    for (const entry of this.entries) entry.Dispose();
    this.entries.length = 0;
    this.parent = null;
  }
}
