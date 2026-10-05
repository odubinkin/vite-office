/** @fileoverview Owns portable hint insertion, copying and projection at the native ndtxt.cxx text-node responsibility boundary. */
import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SwTextNode, SwTextFragment } from "./ndtxt";
import type { WriterHyperlink } from "./fmtatr2";
import { SwpHints, type WriterTextRunLike } from "./ndhints";
import { projectWriterCharacterAttributes } from "./txatbase";

/** Rebinds replacement maps before releasing old node backlinks. @param node - Owner. @param previous - Old map. @param next - New map. @returns New owned map, including allocated empty maps. */
export function ReplaceTextNodeHints(
  node: SwTextNode,
  previous: SwpHints | undefined,
  next: SwpHints | undefined,
): SwpHints | undefined {
  if (previous === next) return next;
  next?.BindToTextNode(node);
  previous?.BindToTextNode(undefined);
  return next;
}

/** Validates ranges before making destination-owned hint snapshots. @param node - Destination. @param hints - Input container. @returns Copied hints. */
export function CopyTextNodeHints(node: SwTextNode, hints: SwpHints): SwpHints {
  for (const hint of hints.entries())
    if (hint.end > node.Len()) throw new Error("Writer text hint is outside the text node.");
  return hints.clone(node.GetDoc().GetAttrPool());
}

/** Builds a detached insertion fragment from the supported effective items. @param node - Context node. @param text - Fragment text. @param attributes - Character items. @param hyperlink - Optional link. @returns Detached text fragment. */
export function CreateTextNodeFragment(
  node: SwTextNode,
  text: string,
  attributes: SfxItemSet,
  hyperlink?: WriterHyperlink,
): SwTextFragment {
  const hints = new SwpHints(node.GetDoc().GetAttrPool()).createTextHints(
    text.length,
    projectWriterCharacterAttributes(attributes),
    node.GetSwAttrSet(),
    hyperlink,
  );
  return { text, hints };
}

/** Projects one native node range to immutable runs. @param node - Source node. @param start - Inclusive offset. @param end - Exclusive offset. @returns Derived runs. */
export function copyWriterTextRangeRuns(
  node: SwTextNode,
  start: number,
  end: number,
): readonly WriterTextRunLike[] {
  const fragment = node.CaptureTextFragment(start, end);
  return fragment.hints.toTextRuns(fragment.text, node.GetSwAttrSet());
}

/** Projects a complete node without storing run state in SwTextNode. @param node - Canonical node. @returns Derived runs. */
export function projectWriterTextRuns(node: SwTextNode | undefined): readonly WriterTextRunLike[] {
  if (node === undefined) return [];
  return (node.GetpSwpHints() ?? new SwpHints(node.GetDoc().GetAttrPool())).toTextRuns(
    node.GetText(),
    node.GetSwAttrSet(),
  );
}

/** Prepares owned insertion hints using native modes and optional portable explicit values. @param node - Actual owner. @param text - Inserted text. @param offset - Position. @param mode - Native flags. @param attributes - Optional explicit items. @param hyperlink - Optional explicit link. @returns Updated owned map. */
export function InsertTextNodeHints(
  node: SwTextNode,
  text: string,
  offset: number,
  mode: SwInsertFlags,
  attributes?: SfxItemSet,
  hyperlink?: WriterHyperlink,
): SwpHints {
  const hints = node.GetpSwpHints() ?? new SwpHints(node.GetDoc().GetAttrPool());
  hints.BindToTextNode(node);
  return hints.insertText(
    node.Len(),
    offset,
    text.length,
    attributes === undefined && hyperlink === undefined
      ? undefined
      : projectWriterCharacterAttributes(attributes ?? node.GetCharacterItemsAt(offset)),
    node.GetSwAttrSet(),
    hyperlink,
    mode,
  );
}
