/** @fileoverview Native Calc named formula data and indexed name collections. */
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { StackVar } from "../../../../formula/inc/token.enum";
import { FormulaGrammar, type Grammar } from "../../../../formula/inc/grammar";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { ScAddress, ScRange, ScRefFlags } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { getRangeFromToken } from "../../../inc/reftokenhelper";
import { ScTokenArray } from "../../../inc/tokenarray";
import { ScCompiler } from "./compiler";

/** Original flags of a named expression. */
export enum RangeDataType {
  Name = 0,
  Database = 1,
  Criteria = 2,
  PrintArea = 4,
  ColHeader = 8,
  RowHeader = 16,
  AbsArea = 32,
  AbsPos = 128,
  Hidden = 256,
}

/** Owns a named expression's native code, base and scope-local token index. */
export class ScRangeData {
  private code: ScTokenArray;
  private index = 0;
  private flags: RangeDataType;
  readonly pos: ScAddress;

  /** Starts an empty native code owner, before the filter's second pass. @param document - Destination. @param name - Source spelling. @param position - Reference origin. @param type - Name flags. @returns Name data. */
  constructor(
    private readonly document: ScDocument,
    readonly name: string,
    position: ScAddress,
    type = RangeDataType.Name,
  ) {
    this.flags = type;
    this.pos = new ScAddress(position);
    this.code = new ScTokenArray(document);
  }

  /** Returns the native name classification flags. @returns Flags. */
  get type(): RangeDataType {
    return this.flags;
  }

  /** Compiles in the actual document after names and sheet identities exist. @param symbol - Formula source. @param grammar - Original grammar. @param manual - Compile token syntax for manual entry. @param names - Reference scope of a manager draft. @returns Nothing. */
  CompileRangeData(symbol: string, grammar: Grammar, manual = false, names?: ScRangeNameMap): void {
    const value = unicode(symbol);
    try {
      const code = new ScCompiler(this.document, this.pos, grammar)
        .SetRangeNameMap(names)
        .CompileString(value);
      code.SetFromRangeName(true);
      if (manual && code.GetCodeError() === FormulaError.NONE) {
        const first = code.GetArray()?.find((token) => {
          const type = token.GetType();
          return type === StackVar.svSingleRef || type === StackVar.svDoubleRef;
        });
        if (first)
          this.flags |=
            first.GetType() === StackVar.svSingleRef ? RangeDataType.AbsPos : RangeDataType.AbsArea;
        new ScCompiler(this.document, this.pos, code, grammar)
          .SetRangeNameMap(names)
          .CompileTokenArray();
        code.DelRPN();
      }
      this.code.Clear();
      this.code = code;
    } finally {
      value.dispose();
    }
  }

  /** Copies the indexed definition and native token array. @returns Independent name data. */
  Clone(): ScRangeData {
    const result = new ScRangeData(this.document, this.name, this.pos, this.type);
    result.code = this.code.Clone();
    result.index = this.index;
    return result;
  }

  /** Converts a cell label using the source all-convention name character rules. @param document - Workbook. @param label - Candidate cell text. @returns Name or empty string. */
  static MakeValidName(document: ScDocument, label: string): string {
    let name = label.replace(/^[^\p{L}\p{N}_.?]+/u, "");
    if (!name) return name;
    if (!/^[\p{L}_]/u.test(name)) name = "_" + name;
    name = name.replace(/[^\p{L}\p{N}_.?]/gu, "_");
    while (this.HasAddressConflict(name, document))
      name = name.includes(".") ? name.replace(".", "_") : "_" + name;
    return name;
  }

  /** Checks a source name against identifier and reference syntax. @param name - Proposed spelling. @param document - Workbook. @returns Name validation result. */
  static IsNameValid(name: string, document: ScDocument): "valid" | "syntax" | "reference" {
    if (!/^[\p{L}_][\p{L}\p{N}_?]*$/u.test(name)) return "syntax";
    return this.HasAddressConflict(name, document) ? "reference" : "valid";
  }

  /** Checks full and partial address parses under the admitted reference conventions. @param name - Candidate name. @param document - Workbook. @returns Address conflict. */
  private static HasAddressConflict(name: string, document: ScDocument): boolean {
    const value = unicode(name);
    try {
      // Lotus uses A1 row and column syntax for unqualified names.
      const conventions = FormulaGrammar.AddressConvention;
      for (
        let convention = conventions.CONV_OOO;
        convention <= conventions.CONV_XL_OOX;
        convention++
      ) {
        const details = new ScAddress.Details(convention, 0, 0);
        if (
          new ScRange().Parse(value, document, details) !== ScRefFlags.ZERO ||
          new ScAddress().Parse(value, document, details) !== ScRefFlags.ZERO
        )
          return true;
      }
      return false;
    } finally {
      value.dispose();
    }
  }

  /** Checks the exact named block using the definition origin. @param block - Compared range. @returns Match. */
  IsRangeAtBlock(block: ScRange): boolean {
    if (!(this.type & (RangeDataType.AbsArea | RangeDataType.AbsPos))) return false;
    const array = this.code.GetArray();
    const token = array?.length === 1 ? array[0] : undefined;
    const kind = token?.GetType();
    if (!token || (kind !== StackVar.svSingleRef && kind !== StackVar.svDoubleRef)) return false;
    const reference = new ScRange();
    return getRangeFromToken(this.document, reference, token, this.pos) && reference.equals(block);
  }

  /** Returns the native name identity. @returns Case-folded lookup key. */
  GetUpperName(): string {
    return this.name.toUpperCase();
  }

  /** Returns the scope-local token index. @returns Stable index. */
  GetIndex(): number {
    return this.index;
  }

  /** Assigns an index before insertion. @param index - Native unsigned16 index. @returns Nothing. */
  SetIndex(index: number): void {
    this.index = index;
  }

  /** Borrows the source token array. @returns Native code. */
  GetCode(): ScTokenArray {
    return this.code;
  }

  /** Serializes native code at the requested origin and grammar. @param grammar - Destination grammar. @param position - Requested reference origin. @param names - Optional manager scope snapshot. @returns Source formula. */
  GetSymbol(
    grammar: Grammar = FormulaGrammar.Grammar.GRAM_ODFF,
    position = this.pos,
    names?: ScRangeNameMap,
  ): string {
    const result = new OUString();
    try {
      new ScCompiler(this.document, position, this.code, grammar)
        .SetRangeNameMap(names)
        .CreateStringFromTokenArray(result);
      return text(result);
    } finally {
      result.dispose();
    }
  }
}

/** Document-wide or sheet-local ownership of native indexed names. */
export class ScRangeName {
  private readonly data = new Map<string, ScRangeData>();
  private readonly indexToData = new Map<number, ScRangeData>();
  private nextIndex = 1;
  private highestIndex = 0;

  /** Looks up the original key. @param name - Uppercase name. @returns Definition or undefined. */
  findByUpperName(name: string): ScRangeData | undefined {
    return this.data.get(name);
  }

  /** Finds the first name for an exact block, in native key order. @param block - Compared range. @returns Matching definition. */
  findByRange(block: ScRange): ScRangeData | undefined {
    for (const entry of this) if (entry.IsRangeAtBlock(block)) return entry;
    return undefined;
  }

  /** Resolves a compiled name token. @param index - Native index. @returns Definition or undefined. */
  findByIndex(index: number): ScRangeData | undefined {
    return this.indexToData.get(index);
  }

  /** Inserts one definition at a free name and native token index. @param value - Actual definition. @returns Whether inserted. */
  insert(value: ScRangeData, reuseFreeIndex = true): boolean {
    const name = value.GetUpperName();
    if (!name || this.data.has(name)) return false;
    while (this.indexToData.has(this.nextIndex)) ++this.nextIndex;
    let index = value.GetIndex();
    if (!index) {
      index = this.nextIndex;
      if (!reuseFreeIndex) index = Math.max(index, this.highestIndex + 1);
    }
    if (index > 0xffff || this.indexToData.has(index)) return false;
    value.SetIndex(index);
    this.data.set(name, value);
    this.indexToData.set(index, value);
    this.highestIndex = Math.max(this.highestIndex, index);
    return true;
  }

  /** Copies entries and the no-reuse index boundary. @returns Independent name collection. */
  Clone(): ScRangeName {
    const copy = new ScRangeName();
    copy.Assign(this);
    return copy;
  }

  /** Replaces the entries with native value copies. @param source - Published snapshot. @returns Nothing. */
  Assign(source: ScRangeName): void {
    if (source === this) return;
    this.clear();
    for (const value of source) this.insert(value.Clone());
    this.highestIndex = source.highestIndex;
  }

  /** Erases one owned name and its scope-local token lookup. @param entry - Current definition. @returns Nothing. */
  erase(entry: ScRangeData): void {
    if (this.data.get(entry.GetUpperName()) !== entry) return;
    this.data.delete(entry.GetUpperName());
    this.indexToData.delete(entry.GetIndex());
    entry.GetCode().Clear();
  }

  /** Traverses name order as the original ordered map. @returns Name data. */
  *[Symbol.iterator](): IterableIterator<ScRangeData> {
    for (const key of [...this.data.keys()].sort()) yield this.data.get(key) as ScRangeData;
  }

  /** Releases native code ownership at scope teardown. @returns Nothing. */
  clear(): void {
    for (const entry of this.data.values()) entry.GetCode().Clear();
    this.data.clear();
    this.indexToData.clear();
    this.nextIndex = 1;
    this.highestIndex = 0;
  }
}

/** Native all-scope name map keyed by document scope (-1) or sheet. */
export type ScRangeNameMap = ReadonlyMap<number, ScRangeName>;

/** Copies the original range name map before a transactional change. @param document - Source workbook. @returns Independent all-scope values. */
export function CloneRangeNameMap(document: ScDocument): Map<number, ScRangeName> {
  const result = new Map<number, ScRangeName>();
  for (let scope = -1; scope < document.GetTableCount(); scope++) {
    const names = document.GetRangeName(scope);
    if (names) result.set(scope, names.Clone());
  }
  return result;
}

/** One file-filter name definition awaiting two-pass admission. */
export interface RangeNameDefinition {
  readonly name: string;
  readonly scope: number;
  readonly pos: ScAddress;
  readonly type: RangeDataType;
  readonly symbol: string;
}

/** Allocates all name indexes before parsing formulas that refer to other names. @param document - Destination graph. @param definitions - Filter definitions. @param grammar - Source grammar. @returns Nothing. */
export function InsertRangeNames(
  document: ScDocument,
  definitions: readonly RangeNameDefinition[],
  grammar: Grammar,
): void {
  const pending: { definition: RangeNameDefinition; data: ScRangeData }[] = [];
  for (const definition of definitions) {
    const names = document.GetRangeName(definition.scope);
    if (!names) continue;
    const data = new ScRangeData(document, definition.name, definition.pos, definition.type);
    if (names.insert(data)) pending.push({ definition, data });
  }
  for (const { definition, data } of pending) data.CompileRangeData(definition.symbol, grammar);
}
