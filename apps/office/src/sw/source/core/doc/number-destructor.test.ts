/** @fileoverview Native numbering-format clients, rule map binding and shared-table destructor lifetimes. */
import { expect, it } from "vitest";
import { SwNumRule, SwNumFormat } from "./number";
import { SwDoc } from "./doc";
import { WriterListenerIterator, type SwModify } from "../../../inc/calbck";
/** Counts genuine intrusive Writer clients. @param owner - Actual format. @returns Client count. */
function clients(owner: SwModify): number {
  return [...new WriterListenerIterator(owner)].length;
}
it("retains shared base owners until the last native rule and recreates the tables afterwards", /** Verifies original first/last-rule ownership independently of document defaults. @returns Nothing. */ () => {
  const a = new SwNumRule("a", "label-width-and-position"),
    b = new SwNumRule("b", "label-width-and-position"),
    copy = new SwNumRule(a);
  const shared = a.Get(0);
  expect(b.Get(0)).toBe(shared);
  expect(copy.Get(0)).toBe(shared);
  a.Dispose();
  b.Dispose();
  expect(copy.Get(0)).toBe(shared);
  copy.Dispose();
  copy.Dispose();
  const fresh = new SwNumRule("fresh", "label-width-and-position");
  try {
    expect(fresh.Get(0)).not.toBe(shared);
    expect(fresh.Get(0).GetListFormat()).toBe("%1%.");
    expect(
      /** Rejects a forced logical destructor call through a native const view. @returns Never. */ () =>
        (fresh.Get(0) as unknown as SwNumFormat).Dispose(),
    ).toThrow("Cannot mutate a const");
  } finally {
    fresh.Dispose();
  }
});
it("unlinks replaced reference formats and cleared pointer formats without detaching retained clients", /** Exercises the native unique_ptr reset path omitted by the old JS assignment. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    rule = new SwNumRule("owned", "label-alignment"),
    style = doc.MakeCharFormat("labels", undefined),
    local = new SwNumFormat();
  const before = clients(style);
  try {
    local.SetCharFormat(style);
    rule.Set(0, local);
    expect(clients(style)).toBe(before + 2);
    const previous = rule.Get(0),
      changed = new SwNumFormat(local);
    try {
      changed.SetStart(7);
      rule.Set(0, changed);
    } finally {
      changed.Dispose();
    }
    expect(previous.GetRegisteredIn()).toBeUndefined();
    expect(clients(style)).toBe(before + 2);
    rule.SetByPointer(0, undefined);
    expect(clients(style)).toBe(before + 1);
    rule.Set(9, local);
    rule.Reset("reset");
    expect(clients(style)).toBe(before + 1);
    rule.Set(4, local);
    rule.Dispose();
    expect(clients(style)).toBe(before + 1);
  } finally {
    local.Dispose();
    rule.Dispose();
    doc.Dispose();
  }
});
it("keeps the source destructor's name erase even when a duplicate name has replaced the map entry", /** Preserves actual map-pointer binding rather than adding a pointer-equality correction. @returns Nothing. */ () => {
  const first = new SwNumRule("same", "label-alignment"),
    second = new SwNumRule("same", "label-alignment"),
    map = new Map([["same", first]]);
  first.SetNumRuleMap(map);
  const copy = new SwNumRule(first);
  try {
    copy.Dispose();
    expect(map.get("same")).toBe(first);
    map.set("same", second);
    first.Dispose();
    expect(map.has("same")).toBe(false);
  } finally {
    first.Dispose();
    second.Dispose();
    copy.Dispose();
  }
});
it("releases the actual transferred document rule table at document teardown", /** Checks the owner has no stale rules or name lookup after native-style table destruction. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    manager = doc.GetDocumentListsManager(),
    rule = new SwNumRule("document", "label-alignment");
  doc.AddNumRule(rule);
  expect(manager.FindNumRulePtr("document")).toBe(rule);
  doc.Dispose();
  expect(manager.GetNumRuleTable()).toEqual([]);
  expect(manager.FindNumRulePtr("document")).toBeUndefined();
});
