/** @fileoverview Ports MakeTextAttr construction and represented GetParaAttr character queries for the registered ranged hint types from pinned sw/source/core/txtnode/thints.cxx. */
import { SetAttrMode } from "../../../inc/swtypes";
import type { SwTextNode } from "./ndtxt";
import type { SwpHints } from "./ndhints";
import { assertTextRange } from "./ndhints-range";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { RES_CHRATR_BEGIN, RES_CHRATR_END } from "../../../inc/hintids";
import { SwAutoStyleFamily } from "../../../inc/istyleaccess";
import type { SwDoc } from "../doc/doc";
import { SwFormatINetFormat } from "./fmtatr2";
import { SwTextINetFormat } from "./txtatr2";
import { SwFormatAutoFormat, SwTextAttrEnd } from "./txatbase";

/** Builds a fresh ranged attribute, interning set/character inputs and converting foreign automatic handles into the destination pool. @param doc - Destination document. @param attr - Document-pool concrete set or supported pool item. @param start - Inclusive offset. @param end - Exclusive offset. @returns Fresh automatic or internet hint with native constructor flags. */
export function MakeTextAttr(
  doc: SwDoc,
  attr: SfxItemSet | SfxPoolItem,
  start: number,
  end: number,
): SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat> {
  if (attr instanceof SfxItemSet) {
    const handle = doc.GetIStyleAccess().getAutomaticStyle(attr, SwAutoStyleFamily.AUTO_STYLE_CHAR);
    return MakeTextAttr(doc, new SwFormatAutoFormat(handle), start, end);
  }
  if (attr.Which() >= RES_CHRATR_BEGIN && attr.Which() < RES_CHRATR_END) {
    const set = new SfxItemSet(doc.GetAttrPool(), [[RES_CHRATR_BEGIN, RES_CHRATR_END]]);
    set.Put(attr);
    return MakeTextAttr(doc, set, start, end);
  }
  if (attr instanceof SwFormatAutoFormat && attr.GetStyleHandle().GetPool() !== doc.GetAttrPool())
    return MakeTextAttr(doc, attr.GetStyleHandle().Clone(true, doc.GetAttrPool()), start, end);
  if (attr instanceof SwFormatINetFormat) return new SwTextINetFormat(attr.Clone(), start, end);
  if (attr instanceof SwFormatAutoFormat) return new SwTextAttrEnd(attr.Clone(), start, end);
  throw new Error("MakeTextAttr hint type is not implemented.");
}

/** Owns undo insertion and the zero-length CopyAttr path, merging equal-boundary automatic items. @param node - Destination. @param attr - Native item. @param start - Inclusive offset. @param end - Exclusive offset. @param mode - NOHINTADJUST or zero-length IS_COPY. @returns Fresh actual attribute. */
export function InsertTextNodeItem(
  node: SwTextNode,
  attr: SfxPoolItem,
  start: number,
  end: number,
  mode: SetAttrMode,
): SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat> {
  assertTextRange(node.Len(), start, end);
  const copyEmpty =
    !(mode & SetAttrMode.NOHINTADJUST) && (mode & SetAttrMode.IS_COPY) !== 0 && start === end;
  if (!(mode & SetAttrMode.NOHINTADJUST) && !copyEmpty)
    throw new Error("Writer InsertItem without NOHINTADJUST is not implemented.");
  if (attr.Which() >= RES_CHRATR_BEGIN && attr.Which() < RES_CHRATR_END)
    throw new Error("Writer InsertItem requires a text-attribute item.");
  let hint = MakeTextAttr(node.GetDoc(), attr, start, end);
  const hints = node.GetOrCreateSwpHints();
  if (copyEmpty) {
    for (const previous of hints.entries()) {
      if (previous.start !== start || previous.end !== end || previous.Which() !== hint.Which())
        continue;
      if (previous.format instanceof SwFormatAutoFormat) {
        const merged = previous.format.GetStyleHandle().Clone();
        merged.PutSet((hint.format as SwFormatAutoFormat).GetStyleHandle());
        hint = MakeTextAttr(node.GetDoc(), merged, start, end);
      }
      hints.DeleteAtPos(hints.entries().indexOf(previous));
    }
  }
  hints.Insert(hint);
  node.GetDoc().NotifyModelChange({
    kind: "attribute-set-changed",
    nodeIndex: node.GetNodes().indexOfOrUndefined(node),
  });
  return hint;
}

/** Implements ClearSwpHintsArr for the two currently supported ranged families. @param node - Actual owner. @param deleteFields - Native field policy;unsupported field hints are absent. @returns Nothing. */
export function ClearTextNodeHints(node: SwTextNode, deleteFields: boolean): void {
  void deleteFields;
  const map = node.GetpSwpHints();
  while (map !== undefined && map.Count() > 0) map.DeleteAtPos(0);
}

/** Merges adjacent equal registered AUTO portions, retaining the first actual owner;INET and zero extents are excluded as native MergePortions does. @param hints - Actual maps. @returns Whether any second portion was removed. */
export function MergeTextNodePortions(hints: SwpHints): boolean {
  let previous: SwTextAttrEnd<SwFormatAutoFormat> | undefined;
  let merged = false;
  for (const hint of hints.entries()) {
    if (!(hint.format instanceof SwFormatAutoFormat) || hint.start === hint.end) continue;
    hint.SetFormatIgnoreStart(false);
    hint.SetFormatIgnoreEnd(false);
    if (
      previous !== undefined &&
      previous.end === hint.start &&
      previous.format.equals(hint.format)
    ) {
      hints.DeleteAtPos(hints.entries().indexOf(hint));
      previous.SetEnd(hint.end);
      merged = true;
    } else previous = hint as SwTextAttrEnd<SwFormatAutoFormat>;
  }
  hints.SortIfNeedBe();
  return merged;
}

/** Converts direct character items over existing automatic-style spans and gaps,with existing ranged items taking precedence. @param node - Actual text node. @param items - Converted direct items. @returns Nothing. */
export function ConvertTextNodeItemsToHints(node: SwTextNode, items: SfxItemSet): void {
  if (items.Count() === 0) return;
  const hints = node.GetOrCreateSwpHints();
  const spans: { start: number; end: number; hint?: SwTextAttrEnd<SwFormatAutoFormat> }[] = [];
  let lastEnd = 0;
  for (const hint of hints.entries()) {
    if (!(hint.format instanceof SwFormatAutoFormat)) continue;
    if (lastEnd < hint.start) spans.push({ start: lastEnd, end: hint.start });
    spans.push({
      start: hint.start,
      end: hint.end,
      hint: hint as SwTextAttrEnd<SwFormatAutoFormat>,
    });
    lastEnd = hint.end;
  }
  if (lastEnd !== node.Len() && node.Len() !== 0) spans.push({ start: lastEnd, end: node.Len() });
  for (const span of spans) {
    const converted = items.Clone();
    if (span.hint !== undefined) {
      const old = span.hint.format.GetStyleHandle();
      for (const item of old.entries()) converted.ClearItem(item.Which());
      if (converted.Count() === 0) continue;
      converted.PutSet(old);
      hints.DeleteAtPos(hints.entries().indexOf(span.hint));
    }
    hints.Insert(MakeTextAttr(node.GetDoc(), converted, span.start, span.end));
  }
  hints.MergePortions(node);
  node.ResetAttr(
    items
      .entries()
      .map(
        /** Collects converted WhichIds. @param item - Direct item. @returns WhichId. */ (item) =>
          item.Which(),
      ),
  );
}

/** Converts the five native direct-item combinations between a source and surviving text node. @param node - Source paragraph. @param target - Main paragraph. @returns Nothing. */
export function FormatTextNodeToTextAttr(node: SwTextNode, target: SwTextNode): void {
  const source = new SfxItemSet(node.GetDoc().GetAttrPool(), [
    [RES_CHRATR_BEGIN, RES_CHRATR_END - 1],
  ]);
  const direct = node.GetpSwAttrSet();
  if (direct !== undefined) source.PutSet(direct);
  node.GetOrCreateSwpHints();
  if (target === node) {
    ConvertTextNodeItemsToHints(node, source);
    return;
  }
  const main = new SfxItemSet(target.GetDoc().GetAttrPool(), source.GetRanges());
  const targetDirect = target.GetpSwAttrSet();
  if (targetDirect !== undefined) main.PutSet(targetDirect);
  target.GetOrCreateSwpHints();
  const convert = new SfxItemSet(node.GetDoc().GetAttrPool(), source.GetRanges());
  const clear: number[] = [];
  for (const item of source.entries()) {
    const other = main.GetItemIfSet(item.Which(), false);
    if (other !== undefined) {
      if (item.equals(other)) clear.push(item.Which());
      else convert.Put(item);
      main.ClearItem(item.Which());
    } else convert.Put(item);
  }
  node.ResetAttr(clear);
  ConvertTextNodeItemsToHints(node, convert);
  ConvertTextNodeItemsToHints(target, main);
}

/** Consumes GetParaAttr's native automatic-character branch, including original partial-hint accumulation and collapsed DontExpand boundaries. Character styles, merged/redline and non-character requests remain outside this represented branch. @param node - Original text owner. @param result - Empty caller-owned character set. @param start - Inclusive content position. @param end - Exclusive content position. @param onlyText - Ignore inherited node/style values. @returns Whether any native state was collected. */
export function GetTextNodeParaAttr(
  node: SwTextNode,
  result: SfxItemSet,
  start: number,
  end: number,
  onlyText: boolean,
): boolean {
  assertTextRange(node.Len(), start, end);
  const format = new SfxItemSet(result.GetPool(), result.GetRanges());
  if (!onlyText) format.Set(node.GetSwAttrSet());
  const previous = new Map<number, { item: SfxPoolItem; end: number } | null>();
  for (const hint of node.GetpSwpHints()?.entries() ?? []) {
    const first = hint.GetStart(),
      last = hint.GetAnyEnd();
    if (first > end) break;
    if (!(hint.format instanceof SwFormatAutoFormat)) continue;
    const items = hint.format.GetStyleHandle();
    if (start === end) {
      if (
        (first < start && (hint.DontExpand() ? start < last : start <= last)) ||
        (start === first && (first === last || start === 0))
      )
        result.PutSet(items);
      continue;
    }
    let partial = false;
    if (first <= start) {
      if (last <= start) continue;
      if (end <= last) format.PutSet(items);
      else partial = true;
    } else if (first < end) partial = true;
    if (!partial) continue;
    for (const item of items.entries()) {
      const which = item.Which(),
        old = previous.get(which);
      if (which < RES_CHRATR_BEGIN || which >= RES_CHRATR_END) continue;
      if (old === undefined) {
        if (onlyText || !item.equals(format.Get(which))) {
          if (first > start) {
            result.InvalidateItem(which);
            previous.set(which, null);
          } else previous.set(which, { item, end: last });
        }
      } else if (old !== null) {
        if (old.end === first && old.item.equals(item)) previous.set(which, { item, end: last });
        else {
          result.InvalidateItem(which);
          previous.set(which, null);
        }
      }
    }
  }
  for (const [which, value] of previous) {
    if (value === null) continue;
    if (end <= value.end) {
      if (!value.item.equals(format.Get(which))) result.Put(value.item);
    } else result.InvalidateItem(which);
  }
  format.Differentiate(result);
  result.PutSet(format);
  return result.Count() !== 0;
}
