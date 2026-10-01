/** @fileoverview Verifies the pinned Writer restart item default without synthesizing direct list restart state. */
import { expect, it } from "vitest";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { RES_PARATR_LIST_RESTARTVALUE, WRITER_TEXT_NODE_WHICH_RANGES } from "../../../inc/hintids";
import { SwNumRuleItem } from "../para/paratr";
import { SwDoc } from "../doc/doc";
import { SwAttrSet } from "./swatrset";
import { SwUndoInsNum } from "../undo/unnum";
import { createWriterCollapsedCursorState } from "../undo/undobj";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import type { SwTextNode } from "../txtnode/ndtxt";

it("owns the native default1 while resolving direct and inherited broadcast values independently", /** Verifies literal pinned initializer/default/state/clone and clear deltas in normal and reading documents. @returns Nothing. */ () => {
  for (const reading of [false, true]) {
    const doc = new SwDoc();
    doc.SetInReading(reading);
    const pool = doc.GetAttrPool();
    const item = pool.GetUserOrPoolDefaultItem(RES_PARATR_LIST_RESTARTVALUE);
    expect(item).toBeInstanceOf(SfxInt16Item);
    expect(item.QueryValue()).toBe(1);
    expect(new SfxInt16Item(86).QueryValue()).toBe(0);
    expect(pool.CreateItem({ which: 86, value: 0 }).QueryValue()).toBe(0);
    expect(item.Clone()).not.toBe(item);
    expect(item.Clone()?.QueryValue()).toBe(1);
    const parent = new SwAttrSet(pool, [[84, 87]]);
    const set = new SwAttrSet(pool, [[84, 87]], parent);
    const old = new SwAttrSet(pool, [[84, 87]]);
    const next = new SwAttrSet(pool, [[84, 87]]);
    expect(set.Count()).toBe(0);
    expect(set.GetItemState(86, false)).toBe(SfxItemState.DEFAULT);
    expect(set.GetItemIfSet(86, false)).toBeUndefined();
    expect(set.Get(86).QueryValue()).toBe(1);
    expect(set.CloneAsValue().Get(86).QueryValue()).toBe(1);
    parent.Put(new SfxInt16Item(86, 9));
    expect(set.Get(86).QueryValue()).toBe(9);
    expect(set.Get(86, false).QueryValue()).toBe(1);
    expect(set.GetItemState(86, false)).toBe(SfxItemState.DEFAULT);
    expect(set.GetItemState(86, true)).toBe(SfxItemState.SET);
    expect(set.Put_BC(new SfxInt16Item(86, 7), old, next)).toBe(true);
    expect(old.Get(86).QueryValue()).toBe(9);
    expect(next.Get(86).QueryValue()).toBe(7);
    expect(set.ClearItem_BC(86, old, next)).toBe(1);
    expect(next.Get(86).QueryValue()).toBe(9);
    parent.ClearItem(86);
    expect(set.Put_BC(new SfxInt16Item(86, 0), old, next)).toBe(true);
    expect(old.Get(86).QueryValue()).toBe(1);
    expect(next.Get(86).QueryValue()).toBe(0);
    expect(set.ClearItem_BC(86, old, next)).toBe(1);
    expect(next.Get(86).QueryValue()).toBe(1);
    expect(pool.GetUserOrPoolDefaultItem(86)).toBe(item);
  }
});

/** Checks independent implicit default and explicit restart start/state. @param node - Actual owned node. @param value - Optional direct restart. @returns Nothing. */
function checkStart(node: SwTextNode, value?: number): void {
  expect(node.HasAttrListRestartValue()).toBe(value !== undefined);
  expect(node.GetActualListStartValue()).toBe(value ?? 9);
  expect(node.GetAttr(86).QueryValue()).toBe(value ?? 1);
  if (value !== undefined) expect(node.GetAttrListRestartValue()).toBe(value);
  expect(node.GetDoc().GetAttrPool().GetUserOrPoolDefaultItem(86).QueryValue()).toBe(1);
}

it("keeps rule start9 and explicit zero/seven distinct through actual list undo, Worker16 and reset", /** Proves the pool default never creates restart state or replaces a rule-defined start. @returns Nothing. */ () => {
  for (const value of [0, 7]) {
    const doc = new SwDoc();
    const node = doc.paragraphs[0] as SwTextNode;
    const rule = doc.EnsureNumRule("Restart audit", "numbered");
    rule.GetNumFormat(0).SetStart(9);
    node.SetAttr(new SwNumRuleItem(rule.GetName()));
    expect(node.IsListRestart()).toBe(false);
    checkStart(node);
    node.SetListRestart(true);
    expect(node.IsListRestart()).toBe(true);
    checkStart(node);
    const before = node.CaptureListItems();
    const cursor = createWriterCollapsedCursorState(
      node,
      0,
      new SfxItemSet(doc.GetAttrPool(), WRITER_TEXT_NODE_WHICH_RANGES),
    );
    node.SetListRestart(true, value);
    checkStart(node, value);
    const undo = new SwUndoInsNum(node, before, node.CaptureListItems(), cursor, cursor);
    const restored: unknown[] = [];
    const context = {
      /** Supplies the real document to the existing undo owner. @returns Owned document. */
      GetDoc: () => doc,
      /** Records the real undo cursor restoration. @param state - Retained cursor. @returns Nothing. */
      RestoreCursor: (state: unknown) => {
        restored.push(state);
      },
    };
    undo.UndoWithContext(context);
    checkStart(node);
    undo.RedoWithContext(context);
    checkStart(node, value);
    expect(restored).toHaveLength(2);
    const transferred = decodeWriterDocument(encodeWriterDocument(doc));
    checkStart(transferred.paragraphs[0] as SwTextNode, value);
    node.ResetAttr(86, 86);
    checkStart(node);
    node.SetListRestart(true, value);
    node.ResetAttr([86, 86]);
    checkStart(node);
    node.SetListRestart(true, value);
    node.ResetAllAttr();
    expect(node.GetAttr(86).QueryValue()).toBe(1);
    expect(node.HasAttrListRestartValue()).toBe(false);
  }
});
