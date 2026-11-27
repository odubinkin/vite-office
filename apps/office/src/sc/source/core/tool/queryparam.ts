/** @fileoverview Original Excel criteria syntax applied to native Calc query items. */
import { OpCode } from "../../../../formula/inc/opcode";
import { SCTAB_MAX } from "../../../inc/address";
import type { ScQueryConnect, ScQueryOp } from "../../../inc/global";
import { SearchParam } from "../../../../unotools/source/i18n/textsearch";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { ScInterpreterContext } from "./interpretercontext";
import { ScQueryEntry, type ScQueryItem } from "./queryentry";

const operators = new Map([
  ["=", OpCode.ocEqual],
  ["<>", OpCode.ocNotEqual],
  ["<", OpCode.ocLess],
  ["<=", OpCode.ocLessEqual],
  [">", OpCode.ocGreater],
  [">=", OpCode.ocGreaterEqual],
]);

/** One native interpreter criterion with its original operator and optional empty-cell override. */
export interface ExcelQueryEntry {
  readonly entry: ScQueryEntry;
  readonly operation: OpCode;
  readonly lexical?: ScQueryEntry;
  readonly isEmpty?: boolean;
  readonly matchEmpty?: boolean;
}

/** Parses Excel comparison prefixes and recognizes the operand with the workbook formatter. @param context - Native interpreter context. @param key - Evaluated criterion. @returns The prepared query. */
export function FillInExcelSyntax(
  context: ScInterpreterContext,
  key: ScQueryItem,
): ExcelQueryEntry {
  const options = context.mpDoc.GetDocOptions();
  if (typeof key === "number")
    return { entry: new ScQueryEntry(key, options), operation: OpCode.ocEqual };
  const prefix = /^(?:<>|<=|>=|[<>=])/u.exec(key.text)?.[0] ?? "";
  const body = key.text.slice(prefix.length);
  const operation = operators.get(prefix) ?? OpCode.ocEqual;
  if (!body && (prefix === "=" || prefix === "<>"))
    return { entry: new ScQueryEntry(key, options), operation, isEmpty: prefix === "=" };
  const value = unicode(body);
  const folded = context.mpDoc.GetSharedStringPool().intern(value);
  try {
    const operand = { text: body, ignoreCase: text(folded.getIgnoreCaseString()) };
    const lexical = new ScQueryEntry(operand, options);
    const number: [number] = [0];
    const entry = context.NFIsNumberFormat(value, [0], number)
      ? new ScQueryEntry(number[0], options)
      : lexical;
    return {
      entry,
      operation,
      lexical,
      matchEmpty:
        operation === OpCode.ocEqual ? body === "" : operation === OpCode.ocNotEqual && body !== "",
    };
  } finally {
    folded.dispose();
    value.dispose();
  }
}

/** The native stored criteria use an absolute field and a connector to the preceding criterion. */
export interface ScQueryParamEntry {
  readonly nField: number;
  readonly eConnect: ScQueryConnect;
  readonly eOp: ScQueryOp;
  readonly empty?: boolean;
  readonly items: readonly ScDBQueryItem[];
}

/** Original query item kinds used in database filter input and output. */
export type ScDBQueryItem =
  | { readonly type: "string" | "date"; readonly value: string }
  | { readonly type: "number"; readonly value: number; readonly lexical?: string }
  | { readonly type: "text-color" | "background-color"; readonly value: string };

/** Value state of the pinned ScQueryParam database filter owner. */
export class ScQueryParam {
  nTab = SCTAB_MAX;
  nCol1 = 0;
  nRow1 = 0;
  nCol2 = 0;
  nRow2 = 0;
  bByRow = true;
  bHasHeader = false;
  bHasTotals = false;
  bInplace = true;
  bCaseSens = false;
  bDuplicate = true;
  bDestPers = true;
  nDestTab = 0;
  nDestCol = 0;
  nDestRow = 0;
  eSearchType = SearchParam.SearchType.Normal as number;
  readonly entries: ScQueryParamEntry[] = [];

  /** Copies query flags and entries without retaining source storage. @returns Independent query. */
  Clone(): ScQueryParam {
    return Object.assign(new ScQueryParam(), this, {
      entries: this.entries.map(
        /** Copies one query entry and its ordered items. @param entry - Native entry. @returns Independent entry. */
        (entry) => ({
          ...entry,
          items: entry.items.map(
            /** Copies one stored item. @param item - Native filter item. @returns Independent item. */
            (item) => ({ ...item }),
          ),
        }),
      ),
    });
  }
}
