/** @fileoverview Original EditDoc character-attribute insertion and overlap handling. */
import { SfxItemState, type SfxItemSet } from "../../../svl/source/items/itemset";
import { SfxPoolItem } from "../../../svl/source/items/poolitem";
import type { ContentNode } from "../../inc/ContentNode";
import { EE_FEATURE_START } from "../../inc/eeitem";
import type { EditCharAttrib } from "../../inc/editattr";
import { MakeCharAttrib, type EditDoc } from "./editdoc";

/** Original raw insertion overload. @param doc - Actual document. @param node - Actual paragraph. @param start - Native start. @param end - Native end. @param item - Source item. @returns Nothing. */
function insert(
  doc: EditDoc,
  node: ContentNode,
  start: number,
  end: number,
  item: SfxPoolItem,
): void {
  const attribute = MakeCharAttrib(doc.GetItemPool(), item, start, end);
  if (!attribute) throw new Error("EditDoc requires a character attribute");
  node.GetCharAttribs().InsertAttrib(attribute);
  doc.SetModified(true);
}

/** Original non-YRS RemoveAttribs branch for an individual Which ID. @param doc - Actual document. @param node - Actual paragraph. @param start - Native start. @param end - Native end. @param which - Which ID. @returns Start and end neighbors available for expansion. */
function removeAttribs(
  doc: EditDoc,
  node: ContentNode,
  start: number,
  end: number,
  which: number,
): [EditCharAttrib | null, EditCharAttrib | null] {
  const attributes = node.GetCharAttribs();
  const values = attributes.GetAttribs();
  let starting: EditCharAttrib | null = null;
  let ending: EditCharAttrib | null = null;
  let changed = false;
  let needsSorting = false;
  for (let index = 0; index < values.length;) {
    const attribute = values[index] as EditCharAttrib;
    if (attribute.Which() !== which || which >= EE_FEATURE_START) {
      index++;
      continue;
    }
    const from = attribute.GetStart();
    const to = attribute.GetEnd();
    if (from >= start && from <= end) {
      changed = true;
      if (to > end) {
        needsSorting = true;
        attribute.GetStart(true)[0] = end;
        starting = attribute;
        break;
      }
      attributes.Remove(index);
    } else if (to >= start && to <= end) {
      changed = true;
      if (from < start) {
        attribute.GetEnd(true)[0] = start;
        ending = attribute;
        index++;
      } else attributes.Remove(index);
    } else if (from <= start && to >= end) {
      changed = true;
      needsSorting = true;
      attribute.GetEnd(true)[0] = start;
      ending = attribute;
      insert(doc, node, end, to, attribute.GetItem() as SfxPoolItem);
      break;
    } else index++;
  }
  if (changed) {
    if (needsSorting) attributes.ResortAttribs();
    doc.SetModified(true);
  }
  return [starting, ending];
}

/** Original selection and caret overload with default adjacent-range expansion. @param doc - Actual document. @param node - Actual paragraph. @param start - Native start. @param end - Native end. @param item - Source item. @returns Nothing. */
export function InsertAttrib(
  doc: EditDoc,
  node: ContentNode,
  start: number,
  end: number,
  item: SfxPoolItem,
): void {
  const attributes = node.GetCharAttribs();
  if (start !== end) {
    const [starting, ending] = removeAttribs(doc, node, start, end, item.Which());
    if (starting && item.equals(starting.GetItem() as SfxPoolItem)) {
      if (ending && item.equals(ending.GetItem() as SfxPoolItem)) {
        ending.GetEnd(true)[0] = starting.GetEnd();
        attributes.Remove(starting);
      } else starting.GetStart(true)[0] = start;
    } else if (ending && item.equals(ending.GetItem() as SfxPoolItem)) ending.GetEnd(true)[0] = end;
    else insert(doc, node, start, end, item);
    if (starting) attributes.ResortAttribs();
  } else {
    const empty = attributes.FindEmptyAttrib(item.Which(), start);
    if (empty) attributes.Remove(empty);
    const existing = attributes.FindAttrib(item.Which(), start);
    if (existing?.IsInside(start)) {
      const tail = MakeCharAttrib(
        doc.GetItemPool(),
        existing.GetItem() as SfxPoolItem,
        start,
        existing.GetEnd(),
      );
      if (!tail) throw new Error("EditDoc requires a character attribute");
      existing.GetEnd(true)[0] = start;
      attributes.InsertAttrib(tail);
    } else if (existing?.GetEnd() === start && item.equals(existing.GetItem() as SfxPoolItem))
      return;
    insert(doc, node, start, start, item);
  }
  doc.SetModified(true);
}

/** Accumulates the original hard attributes at a cursor or over a selected range. @param node - Paragraph. @param start - Inclusive start. @param end - Exclusive end. @param items - Selection's accumulated item set. @returns Nothing. */
export function FindAttribs(
  node: ContentNode,
  start: number,
  end: number,
  items: SfxItemSet,
): void {
  const attributes = node.GetCharAttribs();
  for (const attr of attributes.GetAttribs()) {
    const from = attr.GetStart();
    const to = attr.GetEnd();
    const which = attr.Which();
    if (start === end) {
      if (from > start) break;
      if (from === start && to > start && start !== 0) continue;
      if (to < start || (from < start && to === start && attributes.FindEmptyAttrib(which, start)))
        continue;
    } else {
      if (from >= end) break;
      if (from > start || to < end) {
        if (from >= start || to > start) items.InvalidateItem(which);
        continue;
      }
    }
    const item = attr.GetItem();
    if (!item) continue;
    const state = items.GetItemState(which);
    if (state === SfxItemState.DEFAULT) items.Put(item);
    else if (state === SfxItemState.SET && !SfxPoolItem.areSame(item, items.Get(which)))
      items.InvalidateItem(which);
  }
}
