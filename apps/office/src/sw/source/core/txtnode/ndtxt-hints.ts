/** @fileoverview Owns portable hint insertion, copying and projection at the native ndtxt.cxx text-node responsibility boundary. */
import { DestroyTextNodeAttribute } from "./thints-insert";
import { SwContentIndexUpdateMode } from "../bastyp/index";
import { SwTextINetFormat } from "./txtatr2";
import { SvxAdjust } from "../../../../editeng/inc/adjustitem";
import type { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type {
  SwTextNode,
  SwTextFragment,
  WriterCharacterFormat,
  WriterParagraphAlignment,
} from "./ndtxt";
import type { WriterHyperlink } from "./fmtatr2";
import { SwpHints, type WriterTextRunLike } from "./ndhints";
import { SetAttrMode } from "../../../inc/swtypes";
import { RES_TXTATR_AUTOFMT } from "../../../inc/hintids";
import { SwFormatAutoFormat } from "./txatbase";
import { SfxItemSet as NativeItemSet } from "../../../../svl/source/items/itemset";
import { WRITER_CHARACTER_WHICH_RANGES } from "../../../inc/hintids";

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
      DestroyTextNodeAttribute(hint);
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
  const trailing = source.GetpSwpHints()?.shifted(offset);
  try {
    return new SwpHints(pool, [
      ...(node.GetpSwpHints()?.entries() ?? []),
      ...(trailing?.entries() ?? []),
    ]);
  } finally {
    trailing?.Dispose();
  }
}

/** Rebinds replacement maps before releasing old node backlinks. @param node - Owner. @param previous - Old map. @param next - New map. @returns New owned map, including allocated empty maps. */
export function ReplaceTextNodeHints(
  node: SwTextNode,
  previous: SwpHints | undefined,
  next: SwpHints | undefined,
): SwpHints | undefined {
  if (previous === next) return next;
  const retained = new Set(next?.entries() ?? []);
  for (const hint of previous?.entries() ?? [])
    if (!retained.has(hint) && hint instanceof SwTextINetFormat) hint.EndListeningAll();
  next?.BindToTextNode(node);
  previous?.BindToTextNode(undefined);
  previous?.Dispose();
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
  return {
    text,
    hints: new SwpHints(node.GetDoc().GetAttrPool()).createItemHints(
      text.length,
      attributes,
      node.GetSwAttrSet(),
      hyperlink,
    ),
  };
}

/** Projects one native node range to immutable runs. @param node - Source node. @param start - Inclusive offset. @param end - Exclusive offset. @returns Derived runs. */
export function copyWriterTextRangeRuns(
  node: SwTextNode,
  start: number,
  end: number,
): readonly WriterTextRunLike[] {
  const fragment = node.CaptureTextFragment(start, end);
  try {
    return fragment.hints.toTextRuns(fragment.text, node.GetSwAttrSet());
  } finally {
    fragment.hints.Dispose();
  }
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
      : (attributes ?? node.GetCharacterItemsAt(offset)),
    node.GetSwAttrSet(),
    hyperlink,
    mode,
  );
}

/** Snapshots effective native character items at a collapsed caret,including inherited item values. @param node - Native owner. @param offset - UTF-16 caret offset. @returns Independent native item snapshot. */
export function GetTextNodeCharacterItems(node: SwTextNode, offset: number): SfxItemSet {
  if (!Number.isInteger(offset) || offset < 0 || offset > node.Len())
    throw new Error("Writer character-format caret is outside the text node.");
  const items = new NativeItemSet(node.GetDoc().GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
  node.GetParaAttr(items, offset, offset);
  return items;
}

/** Creates a native fragment with one toggled character item. @param node - Native owner. @param start - Inclusive source offset. @param end - Exclusive source offset. @param format - Toggled item group. @returns Native formatted fragment. */
export function CreateTextNodeToggledFragment(
  node: SwTextNode,
  start: number,
  end: number,
  format: WriterCharacterFormat,
): SwTextFragment {
  const fragment = node.CaptureTextFragment(start, end);
  try {
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
  } finally {
    fragment.hints.Dispose();
  }
}

/** Creates a native fragment with replacement hyperlink metadata. @param node - Native owner. @param start - Inclusive source offset. @param end - Exclusive source offset. @param hyperlink - Replacement hyperlink or undefined. @returns Native formatted fragment. */
export function CreateTextNodeHyperlinkFragment(
  node: SwTextNode,
  start: number,
  end: number,
  hyperlink: WriterHyperlink | undefined,
): SwTextFragment {
  const fragment = node.CaptureTextFragment(start, end);
  try {
    return {
      text: fragment.text,
      hints: fragment.hints.setHyperlink(fragment.text.length, 0, fragment.text.length, hyperlink),
    };
  } finally {
    fragment.hints.Dispose();
  }
}

/** Converts a UI alignment to Writer's paragraph adjustment enum. @param alignment - Browser alignment. @returns SvxAdjust value. */
export function getSvxAdjust(alignment: WriterParagraphAlignment): SvxAdjust {
  switch (alignment) {
    case "center":
      return SvxAdjust.Center;
    case "right":
      return SvxAdjust.Right;
    case "justify":
      return SvxAdjust.Block;
    default:
      return SvxAdjust.Left;
  }
}

/** Converts Writer's paragraph adjustment enum to the current browser projection. @param adjust - Effective SvxAdjust value. @returns Browser alignment. */
export function getWriterParagraphAlignment(adjust: SvxAdjust): WriterParagraphAlignment {
  switch (adjust) {
    case SvxAdjust.Center:
      return "center";
    case SvxAdjust.Right:
    case SvxAdjust.ParaEnd:
    case SvxAdjust.End:
      return "right";
    case SvxAdjust.Block:
    case SvxAdjust.BlockLine:
      return "justify";
    default:
      return "left";
  }
}

/** Creates an immutable character fragment from the existing node without exposing private fields. @param node - Native node. @param start - Inclusive source offset. @param end - Exclusive source offset. @param family - Requested formatting value. @returns Native formatted fragment. */
export function CreateTextNodeFontFamilyFragment(
  node: SwTextNode,
  start: number,
  end: number,
  family: string | SvxFontItem,
): SwTextFragment {
  const fragment = node.CaptureTextFragment(start, end);
  try {
    return {
      text: fragment.text,
      hints: fragment.hints.setFontFamily(
        fragment.text.length,
        0,
        fragment.text.length,
        family,
        node.GetSwAttrSet(),
      ),
    };
  } finally {
    fragment.hints.Dispose();
  }
}

/** Creates an immutable character fragment from the existing node without exposing private fields. @param node - Native node. @param start - Inclusive source offset. @param end - Exclusive source offset. @param fontSizeTwips - Requested formatting value. @returns Native formatted fragment. */
export function CreateTextNodeFontSizeFragment(
  node: SwTextNode,
  start: number,
  end: number,
  fontSizeTwips: number,
): SwTextFragment {
  const fragment = node.CaptureTextFragment(start, end);
  try {
    return {
      text: fragment.text,
      hints: fragment.hints.setFontSize(
        fragment.text.length,
        0,
        fragment.text.length,
        fontSizeTwips,
        node.GetSwAttrSet(),
      ),
    };
  } finally {
    fragment.hints.Dispose();
  }
}

/** Creates an immutable character fragment from the existing node without exposing private fields. @param node - Native node. @param start - Inclusive source offset. @param end - Exclusive source offset. @param property - Requested formatting value. @param value - Requested color. @returns Native formatted fragment. */
export function CreateTextNodeColorFragment(
  node: SwTextNode,
  start: number,
  end: number,
  property: "color" | "highlight",
  value: string,
): SwTextFragment {
  const fragment = node.CaptureTextFragment(start, end);
  try {
    return {
      text: fragment.text,
      hints: fragment.hints.setCharacterColor(
        fragment.text.length,
        0,
        fragment.text.length,
        property,
        value,
        node.GetSwAttrSet(),
      ),
    };
  } finally {
    fragment.hints.Dispose();
  }
}

/** Reads the existing direct-format control state from actual native hints at this source-owned split. @param node - Actual paragraph. @param start - Inclusive range. @param end - Exclusive range. @param format - Queried property. @returns Existing immutable UI state. */
export function GetTextNodeRangeFormatState(
  node: SwTextNode,
  start: number,
  end: number,
  format: WriterCharacterFormat,
): "mixed" | "off" | "on" {
  AssertTextNodeRange(node, start, end);
  const hints = node.GetpSwpHints()?.clone() ?? new SwpHints(node.GetDoc().GetAttrPool());
  return hints.getCharacterFormatState(node.Len(), start, end, format, node.GetSwAttrSet());
}

/** Updates registered content indices after the existing fragment/full-text replacement paths have changed text. @param node - Actual node. @param start - Replacement start. @param removed - Old extent. @param inserted - New extent. @returns Nothing. */
export function UpdateTextNodeReplacementIndices(
  node: SwTextNode,
  start: number,
  removed: number,
  inserted: number,
): void {
  if (removed > inserted)
    node.UpdateContentIndices(
      start + inserted,
      removed - inserted,
      SwContentIndexUpdateMode.Negative,
    );
  else if (inserted > removed)
    node.UpdateContentIndices(
      start + removed,
      inserted - removed,
      SwContentIndexUpdateMode.Default,
    );
}

/** Prepares existing fragment replacement hints at the same source-owned split without changing text or content-index timing. @param node - Actual node. @param start - Range start. @param end - Range end. @param replacement - Native fragment. @param transfer - Whether move actual hint identities. @returns Prepared map. */
export function PrepareTextNodeReplacementHints(
  node: SwTextNode,
  start: number,
  end: number,
  replacement: SwTextFragment,
  transfer: boolean,
): SwpHints {
  const existing = node.GetpSwpHints() ?? new SwpHints(node.GetDoc().GetAttrPool());
  return !transfer &&
    replacement.hints.Count() === 0 &&
    end > start &&
    replacement.text.length === 0
    ? existing.EraseText(node.Len(), start, end - start)
    : existing.replaceRange(
        node.Len(),
        start,
        end,
        replacement.hints,
        replacement.text.length,
        transfer,
      );
}
