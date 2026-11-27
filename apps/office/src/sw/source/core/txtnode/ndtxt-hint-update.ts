/** @fileoverview Ports owned ranged and fly point coordinate updates from pinned SwTextNode::Update and default InsertText in ndtxt.cxx. */
import type { SwFormatRuby } from "./fmtatr2";
import { SwTextTOXMark } from "./atrtox";
import type { TextNodeAttribute } from "./ndhints";
import type { SwFormatCharFormat } from "./fmtatr2";
import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
import type { SwDoc } from "../doc/doc";
import { RES_TXTATR_INETFMT } from "../../../inc/hintids";
import { MakeTextAttr } from "./thints";
import type { SwFormatINetFormat } from "./fmtatr2";
import { type SwFormatAutoFormat, SwTextAttrEnd } from "./txatbase";

/** Changes actual supported hint coordinates without splitting continuous values. @param doc - Owning document. @param hints - Stable start-ordered objects. @param offset - Change position. @param length - Positive change length. @param negative - Whether text is removed. @param ignoreDontExpand - Owning node state. @returns Existing objects and native end-boundary collectors. */
export function UpdateTextHints(
  doc: SwDoc,
  hints: readonly TextNodeAttribute[],
  offset: number,
  length: number,
  negative: boolean,
  ignoreDontExpand = false,
): readonly TextNodeAttribute[] {
  const collector = new Map<
    number,
    SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat | SwFormatCharFormat | SwFormatRuby>
  >();
  let noExpand = false;
  for (const hint of hints) {
    const end = hint.GetEnd();
    if (end === undefined) {
      if (negative && hint.start > offset) hint.SetStart(Math.max(offset, hint.start - length));
      else if (!negative && hint.start >= offset) hint.SetStart(hint.start + length);
      continue;
    }
    if (negative) {
      if (hint.start > offset) hint.SetStart(Math.max(offset, hint.start - length));
      if (end > offset) hint.SetEnd(Math.max(offset, end - length));
    } else if (hint.start >= offset) {
      hint.SetStart(hint.start + length);
      hint.SetEnd(end + length);
    } else if (end > offset || (end === offset && ignoreDontExpand)) hint.SetEnd(end + length);
    else if (end === offset) {
      if (hint.dontExpand) {
        hint.dontExpand = false;
        if (hint.Which() === RES_TXTATR_INETFMT) noExpand = true;
      } else if (noExpand && hint instanceof SwTextAttrEnd && !(hint instanceof SwTextTOXMark))
        collector.set(hint.Which(), MakeTextAttr(doc, hint.format, offset, offset + length));
      else hint.SetEnd(end + length);
    }
  }
  return [...hints, ...collector.values()];
}

/** Applies native InsertText mode adjustment after coordinate Update. @param hints - Actual updated attributes. @param offset - Original insertion position. @param length - Inserted length. @param mode - Native insertion flags. @returns The same actual attribute array. */
export function AdjustInsertTextHints(
  hints: readonly TextNodeAttribute[],
  offset: number,
  length: number,
  mode = SwInsertFlags.DEFAULT,
): readonly TextNodeAttribute[] {
  for (const hint of hints) {
    const end = hint.GetEnd();
    if (end === undefined) continue;
    if (end === offset + length) {
      if (
        mode & SwInsertFlags.NOHINTEXPAND ||
        (!(mode & SwInsertFlags.FORCEHINTEXPAND) && hint.dontExpand)
      ) {
        if (hint.start === end) hint.SetStart(hint.start - length);
        hint.SetEnd(end - length);
      } else if (mode & SwInsertFlags.EMPTYEXPAND && hint.start === end) {
        hint.SetStart(hint.start - length);
        continue;
      } else continue;
    }
    if (
      !(mode & SwInsertFlags.NOHINTEXPAND) &&
      offset === 0 &&
      hint.start === length &&
      !hint.dontExpandStart
    )
      hint.SetStart(0);
  }
  return hints;
}

/** Collects interior ranged and fly point hints before EraseText updates coordinates. @param doc - Owning document. @param hints - Actual supported attributes. @param offset - Erase start. @param length - Erased length. @returns Retained actual attributes after negative Update. */
export function EraseTextHints(
  doc: SwDoc,
  hints: readonly TextNodeAttribute[],
  offset: number,
  length: number,
): readonly TextNodeAttribute[] {
  const end = offset + length;
  const retained = hints.filter(
    /** Applies the native exact-end erasure for TOX ranges in ordinary erase mode. @param hint - Actual attribute. @returns Whether retained. */
    (hint) => {
      if (hint.start < offset || hint.start > end) return true;
      const endOfHint = hint.GetEnd();
      return hint.GetAnyEnd() >= end && !(hint instanceof SwTextTOXMark && endOfHint === end);
    },
  );
  return UpdateTextHints(doc, retained, offset, length, true);
}
