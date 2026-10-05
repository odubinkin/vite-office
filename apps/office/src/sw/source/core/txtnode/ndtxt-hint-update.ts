/** @fileoverview Ports owned AUTO/INET coordinate updates from pinned SwTextNode::Update and default InsertText in ndtxt.cxx. */
import type { SwDoc } from "../doc/doc";
import { RES_TXTATR_INETFMT } from "../../../inc/hintids";
import { MakeTextAttr } from "./thints";
import type { SwFormatINetFormat } from "./fmtatr2";
import type { SwFormatAutoFormat, SwTextAttrEnd } from "./txatbase";

/** Changes actual supported hint coordinates without splitting continuous values. @param doc - Owning document. @param hints - Stable start-ordered objects. @param offset - Change position. @param length - Positive change length. @param negative - Whether text is removed. @param ignoreDontExpand - Owning node state. @returns Existing objects and native end-boundary collectors. */
export function UpdateTextHints(
  doc: SwDoc,
  hints: readonly SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat>[],
  offset: number,
  length: number,
  negative: boolean,
  ignoreDontExpand = false,
): readonly SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat>[] {
  const collector = new Map<number, SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat>>();
  let noExpand = false;
  for (const hint of hints) {
    if (negative) {
      if (hint.start > offset) hint.SetStart(Math.max(offset, hint.start - length));
      if (hint.end > offset) hint.SetEnd(Math.max(offset, hint.end - length));
    } else if (hint.start >= offset) {
      hint.SetStart(hint.start + length);
      hint.SetEnd(hint.end + length);
    } else if (hint.end > offset || (hint.end === offset && ignoreDontExpand))
      hint.SetEnd(hint.end + length);
    else if (hint.end === offset) {
      if (hint.dontExpand) {
        hint.dontExpand = false;
        if (hint.Which() === RES_TXTATR_INETFMT) noExpand = true;
      } else if (noExpand)
        collector.set(hint.Which(), MakeTextAttr(doc, hint.format, offset, offset + length));
      else hint.SetEnd(hint.end + length);
    }
  }
  return [...hints, ...collector.values()];
}

/** Applies DEFAULT InsertText adjustment after coordinate Update. @param hints - Actual updated attributes. @param offset - Original insertion position. @param length - Inserted length. @returns The same actual attribute array. */
export function AdjustInsertTextHints(
  hints: readonly SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat>[],
  offset: number,
  length: number,
): readonly SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat>[] {
  for (const hint of hints) {
    if (hint.end === offset + length) {
      if (hint.dontExpand) {
        if (hint.start === hint.end) hint.SetStart(hint.start - length);
        hint.SetEnd(hint.end - length);
      } else continue;
    }
    if (offset === 0 && hint.start === length && !hint.dontExpandStart) hint.SetStart(0);
  }
  return hints;
}

/** Collects interior no-dummy ranged hints before EraseText updates coordinates. @param doc - Owning document. @param hints - Actual supported attributes. @param offset - Erase start. @param length - Erased length. @returns Retained actual attributes after negative Update. */
export function EraseTextHints(
  doc: SwDoc,
  hints: readonly SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat>[],
  offset: number,
  length: number,
): readonly SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat>[] {
  const end = offset + length;
  const retained = hints.filter(
    /** Preserves attributes outside the native interior-GC condition. @param hint - Actual attribute. @returns Whether retained. */
    (hint) => !(hint.start >= offset && hint.start <= end && hint.end < end),
  );
  return UpdateTextHints(doc, retained, offset, length, true);
}
