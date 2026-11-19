/** @fileoverview Original DocxAttributeOutput::ParaTabStop and tab child output. */
import {
  SvxTabAdjust,
  type SvxTabStopConstReference,
  type SvxTabStopItem,
} from "../../../../editeng/inc/tstpitem";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { FSNS } from "../../../../sax/inc/fshelper";
import type { DocxAttributeOutput } from "./docxattributeoutput";

const w = token("w");
const val = FSNS(w, token("val"));
const pos = FSNS(w, token("pos"));
const leader = FSNS(w, token("leader"));
const adjustments = new Map([
  [SvxTabAdjust.Center, "center"],
  [SvxTabAdjust.Right, "right"],
  [SvxTabAdjust.Decimal, "decimal"],
]);
const leaders = new Map([
  [".", "dot"],
  ["-", "hyphen"],
  ["·", "middleDot"],
  ["_", "underscore"],
]);

/** Emits one custom stop relative to the Word page margin. @param output - Attribute writer. @param stop - Native stop. @param offset - Absolute paragraph indentation when required. @returns Nothing. */
function WriteTabElement(
  output: DocxAttributeOutput,
  stop: SvxTabStopConstReference,
  offset: number,
): void {
  output
    .GetSerializer()
    .singleElementNS(
      w,
      token("tab"),
      val,
      adjustments.get(stop.GetAdjustment()) ?? "left",
      pos,
      String(stop.GetTabPos() + offset),
      leader,
      leaders.get(stop.GetFill()) ?? "none",
    );
}

/** Records the native document default or writes the custom delta after inherited stops have been considered. @param output - Native attribute writer. @param tabs - Paragraph or style stop item. @param inherited - Effective parent item. @param offset - Source paragraph indent in twips. @returns Nothing. */
export function ParaTabStop(
  output: DocxAttributeOutput,
  tabs: SvxTabStopItem,
  inherited?: SvxTabStopItem,
  offset = 0,
): void {
  const count = tabs.Count();
  const inheritedCount = inherited?.Count() ?? 0;
  if (!count && !inheritedCount) return;
  const owner = output.GetExport();
  if (count === 1 && tabs.At(0).GetAdjustment() === SvxTabAdjust.Default) {
    owner.setDefaultTabStop(tabs.At(0).GetTabPos());
    return;
  }
  if (inherited && count === inheritedCount && inherited.equals(tabs)) return;

  const serializer = output.GetSerializer();
  serializer.startElementNS(w, token("tabs"));
  let written = 0;
  let current = 0;
  const unchanged = new Set<number>();
  if (inherited) {
    for (let i = 0; i < inheritedCount && written < 64; ++i) {
      const previous = inherited.At(i);
      while (current < count && tabs.At(current).lessThan(previous)) ++current;
      if (current === count || previous.lessThan(tabs.At(current))) {
        serializer.singleElementNS(
          w,
          token("tab"),
          val,
          "clear",
          pos,
          String(previous.GetTabPos()),
        );
        ++written;
      } else if (previous.equals(tabs.At(current))) unchanged.add(current);
    }
  }
  for (let i = 0; i < count; ++i) {
    const stop = tabs.At(i);
    if (stop.GetAdjustment() === SvxTabAdjust.Default) owner.setDefaultTabStop(stop.GetTabPos());
    else if (!unchanged.has(i) && written < 64) {
      WriteTabElement(output, stop, offset);
      ++written;
    }
  }
  serializer.endElementNS(w, token("tabs"));
}
