/** @fileoverview Owns portable hint insertion, copying and projection at the native ndtxt.cxx text-node responsibility boundary. */
import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SwTextNode, SwTextFragment, WriterCharacterFormat } from "./ndtxt";
import type { WriterHyperlink } from "./fmtatr2";
import { SwpHints, type WriterTextRunLike } from "./ndhints";
import { createWriterCharacterItemSet, projectWriterCharacterAttributes } from "./txatbase";
import { SetAttrMode } from "../../../inc/swtypes";
import { RES_TXTATR_AUTOFMT } from "../../../inc/hintids";
import { SwFormatAutoFormat } from "./txatbase";

/** Validates the existing text-node range contract at the source-owned responsibility split. @param node - Actual paragraph. @param start - Inclusive offset. @param end - Exclusive offset. @returns Nothing. */
export function AssertTextNodeRange(node: SwTextNode, start: number, end: number): void {
  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end < start ||
    end > node.Len()
  )
    throw new Error("Writer text range is outside the text node.");
}

/** Preserves CutText's equal-end attributes in an empty split suffix and removes closed empty hints. Full CutImpl ownership remains unverified. @param node - Source. @param offset - Split position. @param suffix - Captured nonempty suffix hints. @returns Remaining suffix hints. */
export function SplitTextNodeEndHints(
  node: SwTextNode,
  offset: number,
  suffix: SwpHints,
): SwpHints {
  if (offset !== node.Len()) return suffix;
  const hints = new SwpHints(node.GetDoc().GetAttrPool());
  for (const hint of node.GetpSwpHints()?.entries() ?? []) {
    if (hint.end !== offset || hint.DontExpand()) continue;
    const copied = hint.clone();
    copied.SetStart(0);
    copied.SetEnd(0);
    hints.Insert(copied);
  }
  return hints;
}

/** Moves eligible full-span attributes using native start-map traversal and successful SetAttr removal. @param node - Actual paragraph owner. @returns Nothing. */
export function MoveTextAttrToAttrSet(node: SwTextNode): void {
  const hints = node.GetpSwpHints();
  for (let index = 0; hints !== undefined && index < hints.Count(); index++) {
    const hint = hints.Get(index);
    if (hint.GetStart() !== 0) break;
    const end = hint.GetEnd();
    if (end === undefined) continue;
    if (end < node.Len() || hint.IsCharFormatAttr()) break;
    if (hint.IsDontMoveAttr()) continue;
    const item = hint.GetAttr();
    if (
      node.SetAttr(
        hint.Which() === RES_TXTATR_AUTOFMT ? (item as SwFormatAutoFormat).GetStyleHandle() : item,
      )
    ) {
      hints.DeleteAtPos(index);
      index--;
    }
  }
}

/** Prepares joined hints, using native CutImpl's CopyAttr branch for an empty source. Full nonempty CutImpl ownership remains unverified. @param node - Surviving node. @param source - Trailing source. @param offset - Destination boundary. @returns Joined native hints. */
export function AppendTextNodeHints(
  node: SwTextNode,
  source: SwTextNode,
  offset: number,
): SwpHints {
  const pool = node.GetDoc().GetAttrPool();
  if (source.Len() === 0) {
    for (const hint of source.GetpSwpHints()?.entries() ?? [])
      node.InsertItem(hint.format, offset, offset, SetAttrMode.IS_COPY);
    return node.GetpSwpHints() ?? new SwpHints(pool);
  }
  return new SwpHints(pool, [
    ...(node.GetpSwpHints()?.entries() ?? []),
    ...(source.GetpSwpHints()?.shifted(offset).entries() ?? []),
  ]);
}

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

/** Reads direct attributes inherited by a collapsed caret. @param node - Native owner. @param offset - UTF-16 caret offset. @returns Effective direct attributes. */
export function GetTextNodeCharacterItems(node: SwTextNode, offset: number): SfxItemSet {
  const hints = node.GetpSwpHints();
  const attributes =
    hints === undefined
      ? new SwpHints(node.GetDoc().GetAttrPool()).getCharacterAttributes(
          node.GetText(),
          offset,
          node.GetSwAttrSet(),
        )
      : hints.getCharacterAttributes(node.GetText(), offset, node.GetSwAttrSet());
  return createWriterCharacterItemSet(node.GetDoc().GetAttrPool(), attributes);
}

/** Creates a native fragment with one toggled character item. @param node - Native owner. @param start - Inclusive source offset. @param end - Exclusive source offset. @param format - Toggled item group. @returns Native formatted fragment. */
export function CreateTextNodeToggledFragment(
  node: SwTextNode,
  start: number,
  end: number,
  format: WriterCharacterFormat,
): SwTextFragment {
  const fragment = node.CaptureTextFragment(start, end);
  return {
    text: fragment.text,
    hints: fragment.hints.toggleCharacterFormat(
      fragment.text.length,
      0,
      fragment.text.length,
      format,
      node.GetSwAttrSet(),
    ),
  };
}

/** Creates a native fragment with replacement hyperlink metadata. @param node - Native owner. @param start - Inclusive source offset. @param end - Exclusive source offset. @param hyperlink - Replacement hyperlink or undefined. @returns Native formatted fragment. */
export function CreateTextNodeHyperlinkFragment(
  node: SwTextNode,
  start: number,
  end: number,
  hyperlink: WriterHyperlink | undefined,
): SwTextFragment {
  const fragment = node.CaptureTextFragment(start, end);
  return {
    text: fragment.text,
    hints: fragment.hints.setHyperlink(fragment.text.length, 0, fragment.text.length, hyperlink),
  };
}
