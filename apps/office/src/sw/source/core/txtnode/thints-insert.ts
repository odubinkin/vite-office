/** @fileoverview Original InsertHint/TryInsertHint decisions for the registered ranged and inline fly attributes from thints.cxx. */
import type { SwTextNode } from "./ndtxt";
import type { SwpHints, TextNodeAttribute } from "./ndhints";
import { SwTextFlyCnt } from "../../../inc/txtflcnt";
import { CH_TXTATR_BREAKWORD } from "../../../inc/hintids";
import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
import { SwFlyFrameFormat } from "../layout/atrfrm";
import { SwTextCharFormat, SwTextINetFormat } from "./txtatr2";
import { SwFormatAutoFormat, type SwTextAttrEnd } from "./txatbase";
import type { SwFormatCharFormat, SwFormatINetFormat } from "./fmtatr2";
import { SetAttrMode } from "../../../inc/swtypes";
import { BuildTextHintPortions, CheckCharacterHintSortNumber } from "./thints-portions";
import { MAX_HINTS } from "./thints-nesting";
import { SwUpdateAttr, UpdateAttrHint } from "../../../inc/hints";
/** Actual native ranged families represented by the kernel. */
type Hint = SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat | SwFormatCharFormat>;
/** Original hint destruction's represented SwClient-base cleanup. The owned pool item releases its shared automatic-style handle. @param hint - Unowned attribute. @returns Nothing. */
export function DestroyTextNodeAttribute(hint: TextNodeAttribute): void {
  if (hint instanceof SwTextINetFormat) hint.EndListeningAll();
  if (hint instanceof SwTextFlyCnt) {
    const format = hint.GetAttr().GetFrameFormat();
    hint.GetAttr().SetFlyFormat();
    if (format instanceof SwFlyFrameFormat)
      format.GetDoc().getIDocumentLayoutAccess().DelLayoutFormat(format);
  }
  hint.GetAttr().Dispose();
}
/** Original TryInsertHint branches; RSID/hidden fields, dummy/content hints and unrepresented nesting families are not fabricated. @param hints - Actual maps. @param hint - New owned-on-success attribute. @param node - Native node. @param mode - Original flags. @returns Native success, independently of whether merging retains the incoming identity. */
export function TryInsertTextNodeHint(
  hints: SwpHints,
  hint: Hint,
  node: SwTextNode,
  mode: SetAttrMode,
): boolean {
  if (MAX_HINTS <= BigInt(hints.Count())) {
    DestroyTextNodeAttribute(hint);
    return false;
  }
  if (hint instanceof SwTextCharFormat) hint.ChgTextNode(node);
  else if (hint instanceof SwTextINetFormat) hint.InitINetFormat(node);
  const families =
    hint.format instanceof SwFormatAutoFormat
      ? hint.format
          .GetStyleHandle()
          .entries()
          .map(
            /** Native CollectHasItems values. @param item - Direct value. @returns Which. */ (
              item,
            ) => item.Which(),
          )
      : [];
  if (mode & SetAttrMode.DONTEXPAND) hint.SetDontExpand(true);
  let start = hint.GetStart();
  if (hint.GetEnd() < start) {
    hint.SetStart(hint.GetEnd());
    hint.SetEnd(start);
    start = hint.GetStart();
  }
  const which = hint.Which();
  const end = hint.GetEnd(),
    noAdjust = (mode & SetAttrMode.NOHINTADJUST) !== 0;
  if (hint.IsNesting()) {
    if (!(hint instanceof SwTextINetFormat))
      throw new Error("Writer structured nesting is not implemented.");
    if (!hints.TryInsertNesting(node, hint)) return false;
  } else if (!noAdjust && !hint.IsOverlapAllowedAttr() && !node.GetDoc().IsInXMLImport()) {
    BuildTextHintPortions(hints, node, hint, mode);
    if (start < end) hints.MergePortions(node);
  } else if (
    !noAdjust &&
    (hint instanceof SwTextCharFormat ||
      (hint.format instanceof SwFormatAutoFormat && node.GetDoc().IsInXMLImport()))
  ) {
    BuildTextHintPortions(hints, node, hint, mode);
  } else {
    if (hint instanceof SwTextCharFormat) CheckCharacterHintSortNumber(hints, hint);
    hints.Insert(hint);
    hints.NoteInHistory(hint, true);
  }
  if (node.HasWriterListeners()) {
    const update = new SwUpdateAttr(start, end, which, families);
    node.TriggerNodeUpdate(new UpdateAttrHint(update, update));
  } else
    node.GetDoc().NotifyModelChange({
      kind: "attribute-set-changed",
      nodeIndex: node.GetNodes().indexOfOrUndefined(node),
    });
  return true;
}
/** Original node entrypoint for ranged attributes and inline fly points. @param node - Actual node. @param hint - Ownership transfers to insertion. @param mode - Original insertion flags. @returns Success. */
export function InsertTextNodeHint(
  node: SwTextNode,
  hint: TextNodeAttribute,
  mode: SetAttrMode,
): boolean {
  if (hint.GetStart() < 0 || hint.GetAnyEnd() > node.Len() || hint.GetStart() > node.Len())
    throw new Error("assert: Writer hint endpoint exceeds text length");
  if (hint instanceof SwTextFlyCnt) return InsertFlyHint(node, hint, mode);
  if (hint.HasDummyChar() || hint.HasContent())
    throw new Error("Writer structured InsertHint is not implemented.");
  return node.GetOrCreateSwpHints().TryInsertHint(hint, node, mode);
}

/** Applies the native point-hint insertion order, inserting its dummy before binding the fly format. @param node - Owning text node. @param hint - Detached point. @param mode - Native insertion flags. @returns Whether inserted. */
function InsertFlyHint(node: SwTextNode, hint: SwTextFlyCnt, mode: SetAttrMode): boolean {
  const format = hint.GetAttr().GetFrameFormat();
  if (!(format instanceof SwFlyFrameFormat) || format.GetDoc() !== node.GetDoc() || hint.m_pHints)
    throw new Error("Writer inline hint requires a detached point and an owned fly format.");
  const start = hint.GetStart();
  const existing = node.GetpSwpHints();
  const hasMarker = (mode & SetAttrMode.NOTXTATRCHR) !== 0;
  if (
    hasMarker &&
    (node.GetText().charAt(start) !== CH_TXTATR_BREAKWORD || existing?.GetTextAttrForCharAt(start))
  )
    throw new Error("Writer inline hint requires an unclaimed dummy character.");
  if (MAX_HINTS <= BigInt(existing?.Count() ?? 0) || (!hasMarker && !node.GetSpaceLeft())) {
    if (hasMarker) node.EraseText(start, 1);
    DestroyTextNodeAttribute(hint);
    return false;
  }
  if (!hasMarker) {
    const flags =
      mode & SetAttrMode.NOHINTEXPAND
        ? SwInsertFlags.NOHINTEXPAND
        : mode & SetAttrMode.FORCEHINTEXPAND
          ? SwInsertFlags.FORCEHINTEXPAND | SwInsertFlags.EMPTYEXPAND
          : SwInsertFlags.EMPTYEXPAND;
    node.InsertText(CH_TXTATR_BREAKWORD, start, flags);
  }
  hint.SetAnchor(node);
  node.GetOrCreateSwpHints().Insert(hint);
  node.TriggerNodeUpdate(
    new UpdateAttrHint(undefined, new SwUpdateAttr(start, start, hint.Which())),
  );
  return true;
}
