/** @fileoverview Verifies actual numbering-style notifications and the native rule-table capacity. */
import { assert, expect, it, vi } from "vitest";
import { SwDoc } from "./doc";
import { SwPosition, SwPaM } from "../crsr/pam";
import { SwNumFormat, SwNumRule } from "./number";
import { applyWriterParagraphList } from "./list";
import { DocumentListsManager } from "./DocumentListsManager";
import { DocumentStateManager } from "./DocumentStateManager";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { FontWeight } from "../../../../tools/inc/fontenum";
import { RES_CHRATR_WEIGHT } from "../../../inc/hintids";
it("notifies only text clients at the changed rule level after a real character style mutation", /** Verifies source reverse ownership lookup. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    first = doc.paragraphs[0];
  assert(first);
  try {
    const second = doc.GetNodes().MakeTextNode("second"),
      plain = doc.GetNodes().MakeTextNode("plain");
    const style = doc.MakeCharFormat("Number label", doc.GetDfltCharFormat()),
      rule = new SwNumRule("Notified", "label-alignment");
    const level0 = new SwNumFormat();
    level0.SetCharFormat(style);
    rule.SetByPointer(0, level0);
    const owned = doc.AddNumRule(rule);
    applyWriterParagraphList(first, {
      kind: "numbered",
      styleId: owned.GetName(),
      listId: owned.GetDefaultListId(),
      level: 0,
    });
    applyWriterParagraphList(second, {
      kind: "numbered",
      styleId: owned.GetName(),
      listId: owned.GetDefaultListId(),
      level: 1,
    });
    const changed = vi.spyOn(first, "NumRuleChgd"),
      otherLevel = vi.spyOn(second, "NumRuleChgd"),
      unlisted = vi.spyOn(plain, "NumRuleChgd");
    style.SetFormatAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
    expect(changed).toHaveBeenCalledTimes(1);
    expect(otherLevel).not.toHaveBeenCalled();
    expect(unlisted).not.toHaveBeenCalled();
    const detached = new SwNumFormat();
    detached.UpdateNumNodes(doc);
    expect(changed).toHaveBeenCalledTimes(1);
  } finally {
    doc.Dispose();
  }
});
it("rejects the first rule beyond the native unsigned16 reserved table capacity", /** Verifies capacity using genuine distinct owned rules. @returns Nothing. */ () => {
  const state = new DocumentStateManager(),
    manager = new DocumentListsManager(state);
  try {
    for (let i = 0; i < 65534; i++)
      manager.AddNumRule(new SwNumRule("Capacity " + i, "label-alignment"));
    expect(manager.GetNumRuleTable()).toHaveLength(65534);
    expect(
      /** Transfers one additional real owner. @returns Stored rule or failure. */ () =>
        manager.AddNumRule(new SwNumRule("Overflow", "label-alignment")),
    ).toThrow("table full");
    expect(manager.FindNumRulePtr("Overflow")).toBeUndefined();
    expect(state.GetModelRevision()).toBe(65534);
  } finally {
    state.Dispose();
  }
}, 30000);

it("materializes an empty incoming default list identity before applying a fresh native rule", /** Verifies the real AddNumRule postcondition used by SetNumRule. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  const position = new SwPosition(node),
    range = new SwPaM(position);
  position.Dispose();
  try {
    const rule = new SwNumRule("Fresh default list", "label-alignment");
    rule.SetDefaultListId("");
    expect(rule.GetDefaultListId()).toBe("");
    doc.SetNumRule(range, rule);
    const stored = doc.FindNumRulePtr(rule.GetName());
    assert(stored);
    expect(stored.GetDefaultListId()).not.toBe("");
    expect(stored.GetDefaultListId()).toMatch(/^list[0-9]+$/);
  } finally {
    range.Dispose();
    doc.Dispose();
  }
});
