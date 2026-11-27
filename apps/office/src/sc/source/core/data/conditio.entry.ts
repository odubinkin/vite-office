/** @fileoverview Native conditional cell comparison entries and their source-relative formula tokens. */
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { FormulaDoubleToken, FormulaStringToken } from "../../../../formula/inc/token";
import { approxEqual } from "../../../../sal/inc/rtl/math";
import type { ScRefCellValue } from "../../../inc/cellvalue";
import { CellType, UpdateRefMode } from "../../../inc/global";
import { ScInterpreter } from "../inc/interpre";
import { ScFormulaResult } from "../tool/formularesult";
import { GetString } from "../tool/editutil";
import { GetCollator } from "../tool/queryentry";
import { FormulaGrammar, type Grammar } from "../../../../formula/inc/grammar";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScAddress } from "../../../inc/address";
import { ScCompiler } from "../../../inc/compiler";
import type { ScDocument } from "../../../inc/document";
import type { ScSingleRefData } from "../../../inc/refdata";
import { ScDoubleRefToken, ScSingleRefToken } from "../../../inc/token";
import type { ScTokenArray } from "../../../inc/tokenarray";
import type {
  RefUpdateContext,
  RefUpdateDeleteTabContext,
  RefUpdateInsertTabContext,
  RefUpdateMoveTabContext,
} from "../../../inc/refupdatecontext";
import { ScFormatEntry, ScFormatEntryType, type ScConditionalFormat } from "./conditio";
import { ScGlobal } from "./global";
import { ScHorizontalCellIterator } from "./dociter";

const SC_COND_NOBLANKS = 1;
const SC_COND_CASESENS = 2;

/** Original ScConditionMode identities. */
export enum ScConditionMode {
  Equal,
  Less,
  Greater,
  EqLess,
  EqGreater,
  NotEqual,
  Between,
  NotBetween,
  Duplicate,
  NotDuplicate,
  Direct,
  Top10,
  Bottom10,
  TopPercent,
  BottomPercent,
  AboveAverage,
  BelowAverage,
  AboveEqualAverage,
  BelowEqualAverage,
  Error,
  NoError,
  BeginsWith,
  EndsWith,
  ContainsText,
  NotContainsText,
  NONE,
}

/** Native multiplicity cache used by statistical conditions in one rendering pass. */
interface ScConditionEntryCache {
  readonly values: readonly (readonly [number, number])[];
  readonly numbers: ReadonlyMap<number, number>;
  readonly strings: ReadonlyMap<string, number>;
  readonly valueItems: number;
  readonly average: number;
}

/** Uses the original locale-based lowercase key for duplicate strings. @param value - Cell text. @returns Cache key. */
function duplicateKey(value: string): string {
  const source = unicode(value);
  const lower = ScGlobal.getCharClass().lowercase(source);
  try {
    return text(lower);
  } finally {
    lower.dispose();
    source.dispose();
  }
}

/** Orders operands of the same native scalar type. @param first - Left operand. @param second - Right operand. @param caseSensitive - Native condition option. @returns Comparison sign. */
function compare(first: number | string, second: number | string, caseSensitive: boolean): number {
  if (typeof first === "number" && typeof second === "number")
    return approxEqual(first, second) ? 0 : Math.sign(first - second);
  return GetCollator(!caseSensitive).compare(String(first), String(second));
}

/** Uses the original comparison service and casing rules of each text condition. @param mode - Text operation. @param value - Actual scalar. @param operand - Condition operand. @returns Match. */
function IsTextValid(
  mode: ScConditionMode,
  value: number | string,
  operand: number | string,
): boolean {
  if (typeof value === "string" && typeof operand !== "string") return false;
  const actual = typeof value === "string" ? unicode(value) : OUString.numberDouble(value);
  const expected =
    typeof operand === "string" && (operand !== "" || typeof value === "string")
      ? unicode(operand)
      : OUString.numberDouble(typeof operand === "number" ? operand : 0);
  try {
    if (typeof value === "number") {
      if (mode === ScConditionMode.BeginsWith) return actual.startsWith(expected);
      if (mode === ScConditionMode.EndsWith)
        return actual.endsWith(expected.getStr().subarray(0, expected.getLength()));
      return (actual.indexOf(expected) !== -1) === (mode === ScConditionMode.ContainsText);
    }
    if (mode === ScConditionMode.BeginsWith)
      return ScGlobal.GetTransliteration().isMatch(expected, actual);
    if (mode === ScConditionMode.EndsWith) {
      const size = expected.getLength(),
        start = actual.getLength() - size;
      return (
        start >= 0 &&
        ScGlobal.GetTransliteration().equals(actual, start, size, [0], expected, 0, size, [0])
      );
    }
    const classifier = ScGlobal.getCharClass();
    const haystack = classifier.lowercase(actual),
      needle = classifier.lowercase(expected);
    try {
      return (haystack.indexOf(needle) !== -1) === (mode === ScConditionMode.ContainsText);
    } finally {
      haystack.dispose();
      needle.dispose();
    }
  } finally {
    actual.dispose();
    expected.dispose();
  }
}

/** Owns the original condition mode, source address and compiled expressions. */
export class ScConditionEntry extends ScFormatEntry {
  private readonly source: ScAddress;
  private parent: ScConditionalFormat | null = null;
  private readonly arrays: ScTokenArray[] = [];
  protected nOptions = 0;
  private readonly compiled = new Set<ScTokenArray>();
  private rendering = false;
  private statistics: ScConditionEntryCache | undefined;

  /** Compiles expressions at their original reference origin. @param mode - Condition operator. @param expressions - Formula text in the supplied grammar. @param document - Native document. @param source - Base address. @param grammar - Source grammar. @returns Condition entry. */
  constructor(
    private readonly mode: ScConditionMode,
    expressions: readonly (string | ScTokenArray)[],
    document: ScDocument,
    source: ScAddress,
    grammar: Grammar,
  ) {
    super(document);
    this.source = new ScAddress(source);
    try {
      for (const expression of expressions) {
        if (typeof expression !== "string") {
          this.arrays.push(expression.CloneValue());
          continue;
        }
        const value = unicode(expression);
        try {
          this.arrays.push(new ScCompiler(document, source, grammar).CompileString(value));
        } finally {
          value.dispose();
        }
      }
    } catch (error) {
      for (const code of this.arrays) code.Clear();
      throw error;
    }
  }

  /** Reads the native blank-cell option. @returns Whether blank input is ignored. */
  IsIgnoreBlank(): boolean {
    return !(this.nOptions & SC_COND_NOBLANKS);
  }

  /** Sets the inverse native blank-cell option. @param ignore - Ignore blank cells. @returns Nothing. */
  SetIgnoreBlank(ignore: boolean): void {
    if (ignore) this.nOptions &= ~SC_COND_NOBLANKS;
    else this.nOptions |= SC_COND_NOBLANKS;
  }

  /** Reads the native case comparison option. @returns Whether casing is significant. */
  IsCaseSensitive(): boolean {
    return Boolean(this.nOptions & SC_COND_CASESENS);
  }

  /** Updates the native case comparison option. @param caseSensitive - Compare casing. @returns Nothing. */
  SetCaseSensitive(caseSensitive: boolean): void {
    if (caseSensitive) this.nOptions |= SC_COND_CASESENS;
    else this.nOptions &= ~SC_COND_CASESENS;
  }

  /** Reads the native comparison mode. @returns Operation. */
  GetOperation(): ScConditionMode {
    return this.mode;
  }
  /** Borrows the formula base address. @returns Source position. */
  GetSrcPos(): ScAddress {
    return this.source;
  }
  /** Picks the original serializable source tab across retained reference tokens. @returns Valid reference origin. */
  GetValidSrcPos(): ScAddress {
    let min = this.source.Tab();
    let max = min;
    for (const ref of this.References()) {
      if (ref.IsTabDeleted()) continue;
      const tab = ref.toAbs(this.mrDoc, this.source).Tab();
      min = Math.min(min, tab);
      max = Math.max(max, tab);
    }
    const count = this.mrDoc.GetTableCount();
    const address = new ScAddress(this.source);
    if (max >= count && min > 0) address.SetTab(this.source.Tab() - min);
    if (address.Tab() >= count) address.SetTab(count - 1);
    return address;
  }
  /** Reads the original operand count. @returns Number of operands. */
  GetExpressionCount(): number {
    return this.arrays.length;
  }

  /** Returns the original flat operand copy for exporters. @param index - Operand number. @returns Owned token array or absence. */
  CreateFlatCopiedTokenArray(index: number): ScTokenArray | undefined {
    return this.arrays[index]?.CloneValue();
  }
  /** Writes an existing token array at the caller's reference origin. @param cursor - Output base address. @param index - Operand index. @param grammar - Destination grammar. @returns Formula text. */
  GetExpression(cursor: ScAddress, index: number, grammar: Grammar): string {
    const code = this.arrays[index];
    if (!code) return "";
    const result = new OUString();
    try {
      new ScCompiler(this.mrDoc, cursor, code, grammar).CreateStringFromTokenArray(result);
      return text(result);
    } finally {
      result.dispose();
    }
  }

  /** Runs an operand in the current cell's reference frame. @param index - Operand index. @param position - Evaluated cell. @returns Original value or error. */
  private Interpret(index: number, position: ScAddress): number | string | undefined {
    const code = this.arrays[index];
    if (!code) return undefined;
    if (code.GetCodeError() !== FormulaError.NONE) return 0;
    const value = code.GetLen() === 1 ? code.TokenAt(0) : undefined;
    if (value instanceof FormulaDoubleToken) return value.GetDouble();
    if (value instanceof FormulaStringToken) return text(value.GetString().getString());
    if (!this.compiled.has(code)) {
      new ScCompiler(this.mrDoc, this.source, code).CompileTokenArray();
      this.compiled.add(code);
    }
    if (code.GetCodeError() !== FormulaError.NONE) return 0;
    const interpreter = new ScInterpreter(
      null,
      this.mrDoc,
      this.mrDoc.GetNonThreadedContext(),
      position,
      code,
    );
    this.mrDoc.IncInterpretLevel();
    try {
      interpreter.Interpret();
      const result = new ScFormulaResult(interpreter.GetResultToken());
      if (!result.IsValue()) return text(result.GetString().getString());
      return result.GetResultError() === FormulaError.NONE ? result.GetDouble() : 0;
    } finally {
      interpreter.Dispose();
      this.mrDoc.DecInterpretLevel();
    }
  }

  /** Reads the scalar or edit text from the original cell view. @param cell - Borrowed cell. @param first - Evaluated first operand. @returns Native value or an absent formula result. */
  private GetCellContent(
    cell: ScRefCellValue,
    first: number | string,
  ): number | string | undefined {
    switch (cell.getType()) {
      case CellType.CELLTYPE_NONE:
        return typeof first === "number" ? 0 : "";
      case CellType.CELLTYPE_VALUE:
        return cell.getDouble();
      case CellType.CELLTYPE_STRING: {
        const value = cell.getSharedString();
        return value ? text(value.getString()) : "";
      }
      case CellType.CELLTYPE_FORMULA: {
        const formula = cell.getFormula();
        if (!formula) return undefined;
        return formula.IsValue() ? formula.GetValue() : text(formula.GetString().getString());
      }
      case CellType.CELLTYPE_EDIT: {
        const edit = cell.getEditText();
        if (!edit) return "";
        const value = GetString(edit, this.mrDoc);
        try {
          return text(value);
        } finally {
          value.dispose();
        }
      }
    }
  }

  /** Fills the original numeric and text histograms over occupied cells of each target range. @returns Statistics. */
  private FillCache(): ScConditionEntryCache {
    if (this.statistics) return this.statistics;
    const numbers = new Map<number, number>();
    const strings = new Map<string, number>();
    let valueItems = 0;
    for (const range of this.parent?.GetRange() ?? []) {
      const tab = range.aStart.Tab();
      if (!this.mrDoc.FetchTable(tab)) continue;
      const cells = new ScHorizontalCellIterator(
        this.mrDoc,
        tab,
        range.aStart.Col(),
        range.aStart.Row(),
        range.aEnd.Col(),
        range.aEnd.Row(),
      );
      const col: [number] = [0],
        row: [number] = [0];
      for (let cell = cells.GetNext(col, row); cell; cell = cells.GetNext(col, row)) {
        if (cell.isEmpty()) continue;
        const value = this.GetCellContent(cell, 0);
        if (typeof value === "number") {
          numbers.set(value, (numbers.get(value) ?? 0) + 1);
          valueItems++;
        } else if (value !== undefined) {
          const key = duplicateKey(value);
          strings.set(key, (strings.get(key) ?? 0) + 1);
        }
      }
    }
    const values = Array.from(numbers).sort(
      /** Orders the keys as in the original numeric map. @param left - Left entry. @param right - Right entry. @returns Sort order. */
      ([left], [right]) => left - right,
    );
    let sum = 0;
    for (const [value, count] of values) sum += value * count;
    const cache = { numbers, strings, values, valueItems, average: sum / valueItems };
    if (this.rendering) this.statistics = cache;
    return cache;
  }

  /** Applies the original count/percentage rank boundary, retaining ties as a group. @param value - Evaluated value. @param operand - Count or percentage. @param cache - Target range statistics. @returns Match. */
  private IsRank(value: number, operand: number, cache: ScConditionEntryCache): boolean {
    const top = this.mode === ScConditionMode.Top10 || this.mode === ScConditionMode.TopPercent;
    const percent =
      this.mode === ScConditionMode.TopPercent || this.mode === ScConditionMode.BottomPercent;
    if (!percent && cache.valueItems <= operand) return true;
    const limit = percent ? Math.trunc((cache.valueItems * operand) / 100) : operand;
    const values = cache.values;
    let cells = 0;
    for (let offset = 0; offset < values.length; offset++) {
      if (cells >= limit) return false;
      const [key, count] = values[top ? values.length - offset - 1 : offset] as readonly [
        number,
        number,
      ];
      if (top ? key <= value : key >= value) return true;
      cells += count;
    }
    return true;
  }

  /** Applies duplicate, rank or average semantics with the original scalar admission. @param cell - Evaluated cell. @param first - Condition operand. @returns Match. */
  private IsStatistical(cell: ScRefCellValue, first: number | string | undefined): boolean {
    if (!this.parent || typeof first === "string") return false;
    const value = this.GetCellContent(cell, 0);
    if (value === undefined) return false;
    if (this.mode === ScConditionMode.Duplicate || this.mode === ScConditionMode.NotDuplicate) {
      if (value === "") return false;
      const cache = this.FillCache();
      const count =
        typeof value === "number"
          ? cache.numbers.get(value)
          : cache.strings.get(duplicateKey(value));
      return (count ?? 0) > 1 === (this.mode === ScConditionMode.Duplicate);
    }
    if (typeof value !== "number") return false;
    const cache = this.FillCache();
    switch (this.mode) {
      case ScConditionMode.AboveAverage:
        return value > cache.average;
      case ScConditionMode.BelowAverage:
        return value < cache.average;
      case ScConditionMode.AboveEqualAverage:
        return value >= cache.average;
      case ScConditionMode.BelowEqualAverage:
        return value <= cache.average;
      default:
        return this.IsRank(value, first ?? 0, cache);
    }
  }

  /** Tests a represented comparison or formula using the native cell and interpreter. @param cell - Actual cell. @param position - Evaluated address. @returns Whether the rule matches. */
  IsCellValid(cell: ScRefCellValue, position: ScAddress): boolean {
    const first = this.Interpret(0, position);
    if (this.mode === ScConditionMode.Direct) return typeof first === "number" && first !== 0;
    if (this.mode === ScConditionMode.Error || this.mode === ScConditionMode.NoError)
      return (
        (this.mrDoc.GetErrCode(position) !== FormulaError.NONE) ===
        (this.mode === ScConditionMode.Error)
      );
    if (
      this.mode === ScConditionMode.Duplicate ||
      this.mode === ScConditionMode.NotDuplicate ||
      (this.mode >= ScConditionMode.Top10 && this.mode <= ScConditionMode.BelowEqualAverage)
    )
      return this.IsStatistical(cell, first);
    if (first === undefined) return false;
    const value = this.GetCellContent(cell, first);
    if (value === undefined) return false;
    if (this.mode >= ScConditionMode.BeginsWith && this.mode <= ScConditionMode.NotContainsText)
      return IsTextValid(this.mode, value, first);
    if (typeof value !== typeof first) return this.mode === ScConditionMode.NotEqual;
    const order = compare(value, first, this.IsCaseSensitive());
    switch (this.mode) {
      case ScConditionMode.Equal:
        return order === 0;
      case ScConditionMode.NotEqual:
        return order !== 0;
      case ScConditionMode.Less:
        return order < 0;
      case ScConditionMode.Greater:
        return order > 0;
      case ScConditionMode.EqLess:
        return order <= 0;
      case ScConditionMode.EqGreater:
        return order >= 0;
      case ScConditionMode.Between:
      case ScConditionMode.NotBetween: {
        const second = this.Interpret(1, position);
        if (second === undefined || typeof second !== typeof value) return false;
        const other = compare(value, second, this.IsCaseSensitive());
        const inside = (order >= 0 && other <= 0) || (order <= 0 && other >= 0);
        return this.mode === ScConditionMode.Between ? inside : !inside;
      }
      default:
        return false;
    }
  }

  /** Copies the source tokens independently. @param document - Destination document. @returns Condition entry. */
  override Clone(document: ScDocument): ScConditionEntry {
    const copy = new ScConditionEntry(
      this.mode,
      this.arrays,
      document,
      this.source,
      FormulaGrammar.Grammar.GRAM_ODFF,
    );
    copy.nOptions = this.nOptions;
    return copy;
  }
  /** Returns the original plain condition type. @returns Entry discriminator. */
  override GetType(): ScFormatEntryType {
    return ScFormatEntryType.Condition;
  }
  /** Binds the enclosing native format's source range. @param parent - Enclosing format. @returns Nothing. */
  override SetParent(parent: ScConditionalFormat | null): void {
    this.parent = parent;
    this.statistics = undefined;
  }
  /** Clears the previous render cache before a new pass. @returns Nothing. */
  override startRendering(): void {
    this.rendering = true;
    this.statistics = undefined;
  }
  /** Discards statistics at the end of the native rendering pass. @returns Nothing. */
  override endRendering(): void {
    this.rendering = false;
    this.statistics = undefined;
  }
  /** Reestablishes the base at the enclosing range before reference updates. @param context - Reference update. @returns Nothing. */
  override UpdateReference(context: RefUpdateContext): void {
    const range = this.parent?.GetRange();
    if (range && !range.empty()) this.source.assign(range.GetTopLeftCorner());
    if (context.meMode === UpdateRefMode.URM_INSDEL && context.maRange.Contains(this.source))
      this.source.Move(
        context.mnColDelta,
        context.mnRowDelta,
        context.mnTabDelta,
        new ScAddress(),
        this.mrDoc,
      );
    this.compiled.clear();
  }

  /** Iterates the local single-reference components of the original operands. @returns Borrowed references. */
  private *References(): IterableIterator<ScSingleRefData> {
    for (const code of this.arrays)
      for (const token of code.Tokens()) {
        if (token instanceof ScSingleRefToken) yield token.GetSingleRef();
        else if (token instanceof ScDoubleRefToken) {
          const range = token.GetDoubleRef();
          yield range.Ref1;
          yield range.Ref2;
        }
      }
  }

  /** Moves references and their base together, retaining relative sheet offsets. @param map - Original tab index mapping or deleted slot. @returns Nothing. */
  private remapTabs(map: (tab: number) => number | null): void {
    const prior = this.source.Tab();
    const next = map(prior) ?? prior;
    const adjust =
      /** Applies the tab mapping to one local reference. @param ref - Native reference. @returns Nothing. */ (
        ref: ScSingleRefData,
      ) => {
        if (ref.IsTabDeleted()) return;
        const mapped = map(ref.Tab() + (ref.IsTabRel() ? prior : 0));
        if (mapped === null) ref.SetTabDeleted(true);
        else if (ref.IsTabRel()) ref.SetRelTab(mapped - next);
        else ref.SetAbsTab(mapped);
      };
    for (const reference of this.References()) adjust(reference);
    this.source.SetTab(next);
    this.compiled.clear();
  }

  /** Applies native sheet insertion to condition formulas. @param context - Insertion. @returns Nothing. */
  override UpdateInsertTab(context: RefUpdateInsertTabContext): void {
    this.remapTabs(
      /** Maps tabs after insertion. @param tab - Original tab. @returns Mapped tab. */ (tab) =>
        tab >= context.mnInsertPos ? tab + context.mnSheets : tab,
    );
  }
  /** Applies native sheet deletion to condition formulas. @param context - Deletion. @returns Nothing. */
  override UpdateDeleteTab(context: RefUpdateDeleteTabContext): void {
    const end = context.mnDeletePos + context.mnSheets;
    this.remapTabs(
      /** Maps tabs after deletion. @param tab - Original tab. @returns Mapped tab. */ (tab) =>
        tab < context.mnDeletePos ? tab : tab < end ? null : tab - context.mnSheets,
    );
  }
  /** Applies native sheet moves to condition formulas. @param context - Move. @returns Nothing. */
  override UpdateMoveTab(context: RefUpdateMoveTabContext): void {
    this.remapTabs(context.getNewTab.bind(context));
  }
  /** Tests native token equality at the appropriate source position. @param other - Compared entry. @param ignore - Ignore source position. @returns Equality. */
  override IsEqual(other: ScFormatEntry, ignore: boolean): boolean {
    return (
      other instanceof ScConditionEntry &&
      this.GetType() === other.GetType() &&
      this.mode === other.mode &&
      this.nOptions === other.nOptions &&
      (ignore || this.source.equals(other.source)) &&
      this.arrays.length === other.arrays.length &&
      this.arrays.every(
        /** Compares the original tokens. @param code - Formula. @param index - Operand index. @returns Equality. */ (
          code,
          index,
        ) => code.EqualTokens(other.arrays[index] as ScTokenArray),
      )
    );
  }
  /** Clones entry operands for a derived class. @returns Borrowed tokens. */
  protected GetCode(): readonly ScTokenArray[] {
    return this.arrays;
  }
  /** Releases the stored formula tokens. @returns Nothing. */
  override Dispose(): void {
    for (const code of this.arrays) code.Clear();
  }
}

/** Native formula condition tied to a cell style. */
export class ScCondFormatEntry extends ScConditionEntry {
  /** Binds the original condition and named style. @param mode - Condition. @param expressions - Formula operands. @param document - Native document. @param source - Base address. @param grammar - Formula grammar. @param styleName - Cell style name. @param type - Native condition discriminator. @returns Format entry. */
  constructor(
    mode: ScConditionMode,
    expressions: readonly (string | ScTokenArray)[],
    document: ScDocument,
    source: ScAddress,
    grammar: Grammar,
    private readonly styleName: string,
    private readonly type = ScFormatEntryType.Condition,
  ) {
    super(mode, expressions, document, source, grammar);
  }
  /** Returns the condition or extension discriminator. @returns Original entry type. */
  override GetType(): ScFormatEntryType {
    return this.type;
  }
  /** Reads the original cell style identity. @returns Style name. */
  GetStyleName(): string {
    return this.styleName;
  }
  /** Returns this entry's named style when the native rule matches. @param cell - Actual cell. @param position - Evaluated address. @returns Style or no match. */
  override GetCellStyle(cell: ScRefCellValue, position: ScAddress): string | null {
    return this.IsCellValid(cell, position) ? this.styleName : null;
  }
  /** Copies formulas and the style binding. @param document - Destination. @returns Format entry. */
  override Clone(document: ScDocument): ScCondFormatEntry {
    const copy = new ScCondFormatEntry(
      this.GetOperation(),
      this.GetCode(),
      document,
      new ScAddress(this.GetSrcPos()),
      FormulaGrammar.Grammar.GRAM_ODFF,
      this.styleName,
      this.type,
    );
    copy.nOptions = this.nOptions;
    return copy;
  }
  /** Compares the condition and the associated style. @param other - Candidate entry. @param ignore - Ignore the reference origin. @returns Equality. */
  override IsEqual(other: ScFormatEntry, ignore: boolean): boolean {
    return (
      other instanceof ScCondFormatEntry &&
      this.styleName === other.styleName &&
      super.IsEqual(other, ignore)
    );
  }
}
