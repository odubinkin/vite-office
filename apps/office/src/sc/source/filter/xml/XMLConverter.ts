/** @fileoverview Original Calc XML condition expression scanner over UTF-16 formula text. */
import { implIsWhitespace } from "../../../../o3tl/inc/string_view";

/** Calc XML converter's shared expression scanner. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Original ScXMLConditionHelper exposes static scanner operations.
export class ScXMLConditionHelper {
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
