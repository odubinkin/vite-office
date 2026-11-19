/** @fileoverview Native Calc named formula data and indexed name collections. */
import { FormulaGrammar, type Grammar } from "../../../../formula/inc/grammar";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { ScAddress } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { ScTokenArray } from "../../../inc/tokenarray";
import { ScCompiler } from "./compiler";

/** Original flags of a named expression. */
export enum RangeDataType {
  Name = 0,
  Criteria = 2,
  PrintArea = 4,
  ColHeader = 8,
  RowHeader = 16,
  Hidden = 256,
}

/** Owns a named expression's native code, base and scope-local token index. */
export class ScRangeData {
  private code: ScTokenArray;
  private index = 0;
  readonly pos: ScAddress;

  /** Starts an empty native code owner, before the filter's second pass. @param document - Destination. @param name - Source spelling. @param position - Reference origin. @param type - Name flags. @returns Name data. */
  constructor(
    private readonly document: ScDocument,
    readonly name: string,
    position: ScAddress,
    readonly type = RangeDataType.Name,
  ) {
    this.pos = new ScAddress(position);
    this.code = new ScTokenArray(document);
  }

  /** Compiles in the actual document after names and sheet identities exist. @param symbol - Formula source. @param grammar - Original grammar. @returns Nothing. */
  CompileRangeData(symbol: string, grammar: Grammar): void {
    const value = unicode(symbol);
    try {
      const code = new ScCompiler(this.document, this.pos, grammar).CompileString(value);
      code.SetFromRangeName(true);
      this.code.Clear();
      this.code = code;
    } finally {
      value.dispose();
    }
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

  /** Serializes native code at the requested origin and grammar. @param grammar - Destination grammar. @param position - Requested reference origin. @returns Source formula. */
  GetSymbol(grammar: Grammar = FormulaGrammar.Grammar.GRAM_ODFF, position = this.pos): string {
    const result = new OUString();
    try {
      new ScCompiler(this.document, position, this.code, grammar).CreateStringFromTokenArray(
        result,
      );
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

  /** Looks up the original key. @param name - Uppercase name. @returns Definition or undefined. */
  findByUpperName(name: string): ScRangeData | undefined {
    return this.data.get(name);
  }

  /** Resolves a compiled name token. @param index - Native index. @returns Definition or undefined. */
  findByIndex(index: number): ScRangeData | undefined {
    return this.indexToData.get(index);
  }

  /** Inserts one definition at a free name and native token index. @param value - Actual definition. @returns Whether inserted. */
  insert(value: ScRangeData): boolean {
    const name = value.GetUpperName();
    if (!name || this.data.has(name)) return false;
    while (this.indexToData.has(this.nextIndex)) ++this.nextIndex;
    const index = value.GetIndex() || this.nextIndex;
    if (index > 0xffff || this.indexToData.has(index)) return false;
    value.SetIndex(index);
    this.data.set(name, value);
    this.indexToData.set(index, value);
    return true;
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
  }
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
