/** @fileoverview Original Calc XML condition expression scanner over UTF-16 formula text. */
import { implIsWhitespace } from "../../../../o3tl/inc/string_view";
import { ScSubTotalFunc } from "../../../inc/global";
import { ScConditionMode as Mode } from "../../../inc/conditio";

/** Removes local-reference dots outside quoted names in a table:cell-range-address. @param source - Original ODF address. @returns Calc A1 address. */
export function ConvertCellRangeAddress(source: string): string {
  let result = "";
  let quoted = false;
  let previous = "=";
  for (const unit of source) {
    if (unit === "'") quoted = !quoted;
    if (quoted || unit !== "." || (previous !== ":" && previous !== " " && previous !== "="))
      result += unit;
    previous = unit;
  }
  return result;
}

const conditionOperators = new Map([
  ["<=", Mode.EqLess],
  [">=", Mode.EqGreater],
  ["!=", Mode.NotEqual],
  ["<", Mode.Less],
  [">", Mode.Greater],
  ["=", Mode.Equal],
]);

const comparisonConditions = new Set(["cell-content", "cell-content-text-length"]);
const functionConditions = new Map([
  ["cell-content-is-between", Mode.Between],
  ["cell-content-is-not-between", Mode.NotBetween],
  ["cell-content-text-length-is-between", Mode.Between],
  ["cell-content-text-length-is-not-between", Mode.NotBetween],
  ["cell-content-is-in-list", Mode.Equal],
  ["is-true-formula", Mode.Direct],
]);

const emptyConditions = new Set([
  "cell-content-is-whole-number",
  "cell-content-is-decimal-number",
  "cell-content-is-date",
  "cell-content-is-time",
]);

/** Original token, operator, operands and resume position for condition chains. */
interface ScXMLConditionParseResult {
  readonly name: string;
  readonly mode: Mode;
  readonly operands: string[];
  readonly endIndex: number;
}

/** Calc XML converter's shared expression scanner. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Original ScXMLConditionHelper exposes static scanner operations.
export class ScXMLConditionHelper {
  /** Reads the operator and operands used by an original style map. @param source - Condition attribute without its formula namespace. @returns Native condition data. */
  static parseCondition(source: string): { mode: Mode; operands: string[] } {
    const parsed = this.parseConditionAt(source, 0);
    return parsed
      ? { mode: parsed.mode, operands: parsed.operands }
      : { mode: Mode.NONE, operands: [] };
  }

  /** Scans a native condition token from an offset and returns its resume position. @param source - Entire attribute. @param offset - UTF-16 starting offset. @returns Parsed token or absence. */
  static parseConditionAt(source: string, offset: number): ScXMLConditionParseResult | undefined {
    if (offset < 0 || offset >= source.length) return undefined;
    let start = offset;
    while (source.charCodeAt(start) <= 32) ++start;
    const name = /^[a-z-]+/u.exec(source.slice(start))?.[0];
    if (!name) return undefined;
    let endIndex = start + name.length;
    if (name === "and") return { name, mode: Mode.NONE, operands: [], endIndex };
    if (source[endIndex++] !== "(") return undefined;
    if (emptyConditions.has(name) || comparisonConditions.has(name)) {
      while (source.charCodeAt(endIndex) <= 32) ++endIndex;
      if (source[endIndex++] !== ")") return undefined;
      if (emptyConditions.has(name)) return { name, mode: Mode.NONE, operands: [], endIndex };
      const operator = /^(<=|>=|!=|<|>|=)/u.exec(source.slice(endIndex))?.[0];
      if (!operator) return undefined;
      endIndex += operator.length;
      while (source.charCodeAt(endIndex) <= 32) ++endIndex;
      if (endIndex >= source.length) return undefined;
      return {
        name,
        mode: conditionOperators.get(operator) ?? Mode.NONE,
        operands: [source.slice(endIndex)],
        endIndex,
      };
    }
    const mode = functionConditions.get(name);
    if (mode === undefined) return undefined;
    const binary = mode === Mode.Between || mode === Mode.NotBetween;
    const position: [number] = [endIndex];
    const first = this.getExpression(source, position, binary ? "," : ")");
    if (!first) return undefined;
    const operands = [first];
    if (binary) {
      const second = this.getExpression(source, position, ")");
      if (!second) return undefined;
      operands.push(second);
    }
    return { name, mode, operands, endIndex: position[0] };
  }

  /** Reads one expression and advances past its delimiter, or exhausts the input. @param source - Condition attribute. @param position - In/out UTF-16 offset. @param delimiter - Original terminating character. @returns Trimmed operand or empty text. */
  static getExpression(source: string, position: [number], delimiter: "," | ")"): string {
    let start = position[0];
    const ends: string[] = [delimiter];
    while (position[0] < source.length) {
      const index = position[0]++;
      const unit = source[index];
      if (unit === ends.at(-1)) {
        ends.pop();
        if (ends.length) continue;
        let end = index;
        while (start < end && implIsWhitespace(source.charCodeAt(start))) ++start;
        while (start < end && implIsWhitespace(source.charCodeAt(end - 1))) --end;
        return source.slice(start, end);
      }
      if (unit === "(") ends.push(")");
      else if (unit === "{") ends.push("}");
      else if (unit === '"' || unit === "'") {
        const close = source.indexOf(unit, position[0]);
        position[0] = close < 0 ? source.length : close + 1;
      }
    }
    return "";
  }
}

/** Calc ODF subtotal functions. The legacy import uses the GeneralFunction token subset. */
export const subtotalFunctions = new Map([
  ["none", ScSubTotalFunc.NONE],
  ["average", ScSubTotalFunc.AVE],
  ["count", ScSubTotalFunc.CNT2],
  ["countnums", ScSubTotalFunc.CNT],
  ["max", ScSubTotalFunc.MAX],
  ["min", ScSubTotalFunc.MIN],
  ["product", ScSubTotalFunc.PROD],
  ["stdev", ScSubTotalFunc.STD],
  ["stdevp", ScSubTotalFunc.STDP],
  ["sum", ScSubTotalFunc.SUM],
  ["var", ScSubTotalFunc.VAR],
  ["varp", ScSubTotalFunc.VARP],
]);

/** Native ScSubTotalFunc mapping shared by consolidation and subtotal export. */
export const subtotalFunctionNames = new Map<ScSubTotalFunc, string>();
for (const [token, operation] of subtotalFunctions) subtotalFunctionNames.set(operation, token);
subtotalFunctionNames.set(ScSubTotalFunc.CNT, "count");
subtotalFunctionNames.set(ScSubTotalFunc.CNT2, "countnums");
subtotalFunctionNames.set(ScSubTotalFunc.MED, "median");

/** Resolves the original ScSubTotalFunc spelling, including median. @param name - ODF function. @returns Native function or NONE. */
export function GetSubTotalFuncFromString(name: string): ScSubTotalFunc {
  if (name === "count") return ScSubTotalFunc.CNT;
  if (name === "countnums") return ScSubTotalFunc.CNT2;
  if (name === "median") return ScSubTotalFunc.MED;
  return subtotalFunctions.get(name) ?? ScSubTotalFunc.NONE;
}
