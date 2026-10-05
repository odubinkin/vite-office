/** @fileoverview Implements the ranged pointer branch of ndtxt.cxx text-attribute lookup. */
import { GetTextAttrMode } from "../../../inc/swtypes";
import { RES_TXTATR_AUTOFMT, RES_TXTATR_INETFMT } from "../../../inc/hintids";
import type { SwpHints } from "./ndhints";
import type { SwFormatINetFormat } from "./fmtatr2";
import type { SwFormatAutoFormat, SwTextAttrEnd } from "./txatbase";

/** Existing ranged families accepted by the native pointer-query boundary. */
export type RangedTextAttribute = SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat>;

/** Matches the default native interval. @param index - Offset. @param start - Hint start. @param end - Hint end. @returns Whether contained. */
function lcl_GetTextAttrDefault(index: number, start: number, end: number): boolean {
  return start <= index && index < end;
}
/** Matches the expansion native interval. @param index - Offset. @param start - Hint start. @param end - Hint end. @returns Whether contained. */
function lcl_GetTextAttrExpand(index: number, start: number, end: number): boolean {
  return start < index && index <= end;
}
/** Matches the parent native interval. @param index - Offset. @param start - Hint start. @param end - Hint end. @returns Whether contained. */
function lcl_GetTextAttrParent(index: number, start: number, end: number): boolean {
  return start < index && index < end;
}
/** Selects the native predicate before traversing the map. @param mode - Native mode. @returns Containment predicate. */
function matchFunction(mode: GetTextAttrMode): typeof lcl_GetTextAttrDefault {
  switch (mode) {
    case GetTextAttrMode.Default:
      return lcl_GetTextAttrDefault;
    case GetTextAttrMode.Expand:
      return lcl_GetTextAttrExpand;
    case GetTextAttrMode.Parent:
      return lcl_GetTextAttrParent;
    default:
      throw new Error("Unsupported Writer text-attribute query mode.");
  }
}

/** Returns the last matching owned attribute as in native lcl_GetTextAttrs's pointer branch. @param hints - Optional native map. @param index - Native offset. @param which - Implemented ranged family. @param mode - Containment mode. @returns Owned attribute without cloning or projection. */
export function GetTextAttrAt(
  hints: SwpHints | undefined,
  index: number,
  which: number,
  mode: GetTextAttrMode,
): RangedTextAttribute | undefined {
  if (which !== RES_TXTATR_AUTOFMT && which !== RES_TXTATR_INETFMT)
    throw new Error("Unsupported Writer text-attribute query family.");
  if (hints === undefined) return undefined;
  const count = hints.Count(),
    match = matchFunction(mode);
  let result: RangedTextAttribute | undefined;
  for (let position = hints.GetFirstPosSortedByWhichAndStart(which); position < count; position++) {
    const hint = hints.GetSortedByWhichAndStart(position);
    if (hint.Which() !== which) break;
    const start = hint.GetStart();
    if (index < start) break;
    if (match(index, start, hint.GetEnd())) result = hint;
  }
  return result;
}
