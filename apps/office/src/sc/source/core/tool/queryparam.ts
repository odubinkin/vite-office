/** @fileoverview Original Excel criteria syntax applied to native Calc query items. */
import { OpCode } from "../../../../formula/inc/opcode";
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
