/** @fileoverview Original InsertHint/TryInsertHint decisions for the registered ranged families from thints.cxx. */
import type { SwTextNode } from "./ndtxt";
import type { SwpHints } from "./ndhints";
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
export function DestroyTextNodeAttribute(hint: Hint): void {
  if (hint instanceof SwTextINetFormat) hint.EndListeningAll();
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
/** Original node entrypoint for represented non-dummy/non-content ranged attributes. @param node - Actual node. @param hint - Ownership transfers to insertion. @param mode - Original insertion flags. @returns Success. */
export function InsertTextNodeHint(node: SwTextNode, hint: Hint, mode: SetAttrMode): boolean {
  if (hint.GetStart() > node.Len() || hint.GetEnd() > node.Len())
    throw new Error("assert: Writer hint endpoint exceeds text length");
  if (hint.HasDummyChar() || hint.HasContent())
    throw new Error("Writer structured InsertHint is not implemented.");
  return node.GetOrCreateSwpHints().TryInsertHint(hint, node, mode);
}
