/** @fileoverview Original Calc XML condition expression scanner over UTF-16 formula text. */
import { implIsWhitespace } from "../../../../o3tl/inc/string_view";
import { ScConditionMode as Mode } from "../../../inc/conditio";

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

/** Calc XML converter's shared expression scanner. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Original ScXMLConditionHelper exposes static scanner operations.
export class ScXMLConditionHelper {
  /** Reads the operator and operands used by an original style map. @param source - Condition attribute without its formula namespace. @returns Native condition data. */
  static parseCondition(source: string): { mode: Mode; operands: string[] } {
    let start = 0;
    while (source.charCodeAt(start) <= 32) ++start;
    const identifier = /^[a-z-]+/u.exec(source.slice(start));
    if (!identifier) return { mode: Mode.NONE, operands: [] };
    const argument = source.slice(start + identifier[0].length);
    if (comparisonConditions.has(identifier[0])) {
      if (!argument.startsWith("(")) return { mode: Mode.NONE, operands: [] };
      let position = 1;
      while (argument.charCodeAt(position) <= 32) ++position;
      if (argument[position++] !== ")") return { mode: Mode.NONE, operands: [] };
      const operator = /^(<=|>=|!=|<|>|=)/u.exec(argument.slice(position))?.[0];
      if (!operator) return { mode: Mode.NONE, operands: [] };
      position += operator.length;
      while (argument.charCodeAt(position) <= 32) ++position;
      return {
        mode: conditionOperators.get(operator) ?? Mode.NONE,
        operands: position < argument.length ? [argument.slice(position)] : [],
      };
    }
    const mode = functionConditions.get(identifier[0]) ?? Mode.NONE;
    const operands: string[] = [];
    if (mode !== Mode.NONE && argument.startsWith("(")) {
      const binary = mode === Mode.Between || mode === Mode.NotBetween;
      const position: [number] = [1];
      const first = this.getExpression(argument, position, binary ? "," : ")");
      if (first) {
        operands.push(first);
        if (binary) {
          const second = this.getExpression(argument, position, ")");
          if (second) operands.push(second);
        }
      }
    }
    return { mode, operands };
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
