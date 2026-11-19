/** @fileoverview Range extraction from Calc source tokens for workbook settings. */
import { OpCode } from "../../../../formula/inc/opcode";
import { ScRange } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import type { ScRangeData } from "../../core/tool/rangenam";
import { ScDoubleRefToken, ScSingleRefToken } from "../../core/tool/token.references";

/** Original reference-list state machine adapted to the native token array. @param document - Workbook. @param definition - Named expression. @param tab - Required sheet. @returns Absolute ranges on this sheet. */
export function extractCellRangeList(
  document: ScDocument,
  definition: ScRangeData,
  tab: number,
): ScRange[] {
  const ranges: ScRange[] = [];
  let depth = 0;
  let state: "open" | "close" | "separator" | "reference" = "open";
  for (const token of definition.GetCode().Tokens()) {
    const op = token.GetOpCode();
    if (op === OpCode.ocSpaces || op === OpCode.ocWhitespace) continue;
    if (op === OpCode.ocSep || op === OpCode.ocUnion) {
      state = "separator";
    } else if (op === OpCode.ocClose) {
      if (--depth < 0) return [];
      state = "close";
    } else if (state === "reference" || state === "close") {
      return [];
    } else if (op === OpCode.ocOpen) {
      ++depth;
      state = "open";
    } else {
      const reference = token instanceof ScDoubleRefToken ? token.GetDoubleRef() : undefined;
      const first = token instanceof ScSingleRefToken ? token.GetSingleRef() : reference?.Ref1;
      if (!first) return [];
      const last = reference?.Ref2 ?? first;
      const start = first.toAbs(document, definition.pos);
      const end = last.toAbs(document, definition.pos);
      if (
        ![first, last].some(
          /** Rejects deleted or relative address components. @param ref - Native endpoint. @returns Whether this endpoint cannot describe a print area. */
          (ref) =>
            ref.IsDeleted() ||
            ref.IsColRel() ||
            ref.IsRowRel() ||
            ref.IsTabRel() ||
            ref.IsRelName(),
        ) &&
        start.Tab() === tab &&
        end.Tab() === tab &&
        document.ValidCol(start.Col()) &&
        document.ValidRow(start.Row()) &&
        document.ValidCol(end.Col()) &&
        document.ValidRow(end.Row())
      )
        ranges.push(new ScRange(start, end));
      state = "reference";
    }
  }
  return ranges;
}
