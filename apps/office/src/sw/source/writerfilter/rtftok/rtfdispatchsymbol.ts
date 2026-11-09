/** @fileoverview Original text-symbol stage of dispatchSymbol; remaining paragraph/table/section controls retain the actual reader's existing dispatch owners. */
import type { RtfDocumentImplContext, RtfState } from "./rtfdocumentimpl.context";
import { OStringToOUString } from "../../../../sal/rtl/ustring-convert";
import { RTL_TEXTENCODING_MS_1252 } from "../../../../sal/inc/rtl/textenc";
import { SVT_HARD_SPACE, SVT_HARD_HYPHEN, SVT_SOFT_HYPHEN } from "../../../../svl/inc/lngmisc";
/** Original cCh assignments, decoded with fixed MS1252 rather than the current group encoding. */
const trivial = new Map<string, number>([
  ["tab", 9],
  ["\\", 92],
  ["{", 123],
  ["}", 125],
  ["emdash", 151],
  ["endash", 150],
  ["bullet", 149],
  ["lquote", 145],
  ["rquote", 146],
  ["ldblquote", 147],
  ["rdblquote", 148],
]);
/** Consumes actual source symbols through the same destination-aware text callback; LINE preserves its separate singleChar/runProps path and bypasses checkNeedPap. @param this - Actual reader. @param name - Control spelling. @param state - Actual current group. @returns Whether consumed. */
export function DispatchTextSymbol(
  this: RtfDocumentImplContext,
  name: string,
  state: RtfState,
): boolean {
  if (state.destination === "skip") return false;
  if (name === "line") {
    this["m_aTextBuffer"].runs.push(this["SnapshotRun"]("\n", state));
    this["m_aTextBuffer"].terminatedParagraph = false;
    return true;
  }
  const byte = trivial.get(name);
  let value: string;
  if (byte !== undefined) value = OStringToOUString(Uint8Array.of(byte), RTL_TEXTENCODING_MS_1252);
  else if (name === "~") value = String.fromCharCode(SVT_HARD_SPACE);
  else if (name === "_") value = String.fromCharCode(SVT_HARD_HYPHEN);
  else if (name === "-") value = String.fromCharCode(SVT_SOFT_HYPHEN);
  else return false;
  this["Dispatch"]({ kind: "text", value });
  return true;
}
