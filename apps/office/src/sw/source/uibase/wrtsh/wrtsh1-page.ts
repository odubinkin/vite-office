/** @fileoverview Applies Page Style tab output through the native descriptor and history owners. */
import type { SfxItemSet } from "../../../../svl/inc/itemset";
import {
  equalWriterPageDescriptors,
  type WriterPageDescriptorValue,
} from "../../core/layout/pagedesc";
import { SwUndoPageDesc } from "../../core/undo/SwUndoPageDesc";
import { ItemSetToPageDesc } from "../utlui/uitool";
import type { SwWrtShell } from "./wrtsh1";

/** Applies the represented ItemSetToPageDesc exchange through a single SwUndoPageDesc. @param shell - Writer editing shell. @param value - Accepted Page geometry. @param name - Target style name. @param items - Accepted fill-page items. @returns Whether a change was applied. */
export function setPageDescriptor(
  shell: SwWrtShell,
  value: WriterPageDescriptorValue,
  name: string,
  items?: SfxItemSet,
): boolean {
  const descriptor = shell.GetDoc().FindPageDesc(name);
  if (descriptor === undefined) return false;
  const original = descriptor.GetValue();
  const geometryChanged = !equalWriterPageDescriptors(original, value);
  const master = descriptor.GetMaster().GetAttrSet();
  const fillChanged = items?.entries().some(
    /** Compares the native dialog item with the current effective value. @param item - Page delta. @returns Whether it differs. */
    (item) => !item.equals(master.Get(item.Which())),
  );
  if (!items || !fillChanged) {
    if (!geometryChanged) return false;
    const cursor = shell.CaptureCursorState();
    return shell.ApplyAction(new SwUndoPageDesc(original, value, cursor, cursor, name));
  }
  const updated = descriptor.Clone();
  try {
    if (geometryChanged) updated.SetValue(value);
    ItemSetToPageDesc(items, updated);
  } catch (error) {
    updated.DisposeModify();
    throw error;
  }
  const cursor = shell.CaptureCursorState();
  return shell.ApplyAction(new SwUndoPageDesc(descriptor.Clone(), updated, cursor, cursor, name));
}
