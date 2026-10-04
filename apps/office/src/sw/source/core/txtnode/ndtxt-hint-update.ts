/** @fileoverview Ports owned AUTO/INET coordinate updates from pinned SwTextNode::Update and default InsertText in ndtxt.cxx. */
import type { SwDoc } from "../doc/doc";
import { RES_TXTATR_INETFMT } from "../../../inc/hintids";
import { MakeTextAttr } from "./thints";
import type { SwFormatINetFormat } from "./fmtatr2";
import type { SwFormatAutoFormat, SwTextAttrEnd } from "./txatbase";

/** Changes actual supported hint coordinates without splitting continuous values. @param doc - Owning document. @param hints - Stable start-ordered objects. @param offset - Change position. @param length - Positive change length. @param negative - Whether text is removed. @returns Existing objects and native end-boundary collectors. */
export function UpdateTextHints(
  doc: SwDoc,
  hints: readonly SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat>[],
  offset: number,
  length: number,
  negative: boolean,
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
    } else if (hint.end > offset) hint.SetEnd(hint.end + length);
    else if (hint.end === offset) {
      if (hint.dontExpand) {
        hint.dontExpand = false;
        if (hint.Which() === RES_TXTATR_INETFMT) noExpand = true;
      } else if (noExpand)
        collector.set(hint.Which(), MakeTextAttr(doc, hint.format, offset, offset + length));
      else hint.SetEnd(hint.end + length);
    }
  }
  // Default InsertText expands starts only at paragraph start, after Update.
  if (!negative && offset === 0)
    for (const hint of hints) if (hint.start === length && !hint.dontExpandStart) hint.SetStart(0);
  return [...hints, ...collector.values()];
}
