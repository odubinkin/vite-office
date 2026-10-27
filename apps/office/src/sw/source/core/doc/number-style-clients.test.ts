/** @fileoverview Verifies actual paragraph-style numbering clients and all represented native SwDoc::IsUsed branches. */
import { afterEach, expect, it } from "vitest";
import { SwDoc } from "./doc";
import { SwNumRule } from "./number";
import { SwNumRuleItem } from "../para/paratr";
import { RES_PARATR_NUMRULE, RES_PARATR_OUTLINELEVEL } from "../../../inc/hintids";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { applyWriterParagraphList } from "./list";

const docs: SwDoc[] = [];
afterEach(
  /** Releases actual graph owners. @returns Nothing. */ () => {
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Constructs native paragraph and numbering owners without body-node use. @returns Actual owners. */
function fixture() {
  const doc = new SwDoc();
  docs.push(doc);
  const first = doc.EnsureNumRule("First", "numbered");
  const second = doc.EnsureNumRule("Second", "bullet");
  const style = doc.MakeTextFormatColl("Clients", doc.GetDfltTextFormatColl(), "clients");
  return { doc, first, second, style };
}

it("registers only explicit style rules and transfers clients before and after base mutation", /** Checks direct versus inherited owners, equal values and original reset range boundaries. @returns Nothing. */ () => {
  const { doc, first, second, style } = fixture();
  expect(doc.IsUsed(style)).toBe(false);
  expect(doc.IsUsed(first)).toBe(false);
  style.SetFormatAttr(new SwNumRuleItem(first.GetName()));
  expect(first.GetParagraphStyleListSize()).toBe(1);
  expect(first.GetTextNodeListSize()).toBe(0);
  expect(doc.IsUsed(first)).toBe(true);
  expect(doc.IsUsed(style)).toBe(false);
  style.SetFormatAttr(new SwNumRuleItem(first.GetName()));
  expect(first.GetParagraphStyleListSize()).toBe(1);
  const derived = doc.MakeTextFormatColl("Derived", style, "derived");
  expect(derived.GetNumRule().GetValue()).toBe("First");
  expect(first.GetParagraphStyleListSize()).toBe(1);
  style.SetFormatAttr(new SwNumRuleItem(second.GetName()));
  expect(first.GetParagraphStyleListSize()).toBe(0);
  expect(second.GetParagraphStyleListSize()).toBe(1);
  expect(doc.IsUsed(first)).toBe(false);
  derived.SetFormatAttr(new SwNumRuleItem(first.GetName()));
  expect(first.GetParagraphStyleListSize()).toBe(1);
  derived.ResetFormatAttr(RES_PARATR_NUMRULE);
  expect(first.GetParagraphStyleListSize()).toBe(0);
  expect(second.GetParagraphStyleListSize()).toBe(1);
  style.ResetFormatAttr(RES_PARATR_NUMRULE - 1, RES_PARATR_NUMRULE + 1);
  expect(second.GetParagraphStyleListSize()).toBe(0);
  expect(doc.IsUsed(second)).toBe(false);
});

it("retains source set-overload direct SET and locked mutation registration", /** Exercises actual owner overrides with empty, unrelated, rule and empty-name items. @returns Nothing. */ () => {
  const { doc, first, second, style } = fixture();
  const set = new SfxItemSet(style.GetAttrSet());
  set.Put(new SwNumRuleItem(first.GetName()));
  style.LockModify();
  style.SetFormatAttrSet(set);
  expect(first.GetParagraphStyleListSize()).toBe(1);
  set.ClearItem();
  set.Put(new SfxUInt16Item(RES_PARATR_OUTLINELEVEL, 1));
  style.SetFormatAttrSet(set);
  expect(first.GetParagraphStyleListSize()).toBe(1);
  set.Put(new SwNumRuleItem(second.GetName()));
  style.SetFormatAttrSet(set);
  expect(first.GetParagraphStyleListSize()).toBe(0);
  expect(second.GetParagraphStyleListSize()).toBe(1);
  style.SetFormatAttr(new SwNumRuleItem(""));
  expect(second.GetParagraphStyleListSize()).toBe(0);
  expect(doc.IsUsed(first)).toBe(false);
  style.UnlockModify();
  set.Dispose();
});

it("does not register inherited or unresolved rules retroactively", /** Preserves original direct-item lookup and absence of a late-registration scan. @returns Nothing. */ () => {
  const { doc, first, style } = fixture();
  style.SetFormatAttr(new SwNumRuleItem("Later"));
  const later = doc.EnsureNumRule("Later", "numbered");
  expect(later.GetParagraphStyleListSize()).toBe(0);
  expect(doc.IsUsed(later)).toBe(false);
  style.SetFormatAttr(new SwNumRuleItem("Later"));
  expect(later.GetParagraphStyleListSize()).toBe(1);
  expect(doc.IsUsed(later)).toBe(true);
  expect(first.GetParagraphStyleListSize()).toBe(0);
});

it("suppresses duplicate style identities and preserves recipients across assignment and reset", /** Original rule constructors have empty clients, assignment/reset retain recipient containers. @returns Nothing. */ () => {
  const { first, second, style } = fixture();
  first.AddParagraphStyle(style);
  first.AddParagraphStyle(style);
  expect(first.GetParagraphStyleListSize()).toBe(1);
  expect(new SwNumRule(first).GetParagraphStyleListSize()).toBe(0);
  second.Assign(first);
  expect(second.GetParagraphStyleListSize()).toBe(0);
  first.Assign(second);
  expect(first.GetParagraphStyleListSize()).toBe(1);
  first.Reset("Reset");
  expect(first.GetParagraphStyleListSize()).toBe(1);
  first.RemoveParagraphStyle(style);
  first.RemoveParagraphStyle(style);
  expect(first.GetParagraphStyleListSize()).toBe(0);
});

it("counts redlines independently from text and paragraph-style clients", /** Tests the original rule-object predicate without name substitution. @returns Nothing. */ () => {
  const { doc, first } = fixture();
  first.SetUsedByRedline(true);
  expect(doc.IsUsed(first)).toBe(true);
  const sameName = new SwNumRule(first);
  expect(sameName.IsUsedByRedline()).toBe(false);
  expect(doc.IsUsed(sameName)).toBe(false);
  first.SetUsedByRedline(false);
  expect(doc.IsUsed(first)).toBe(false);
});

it("counts nodes in the matching default list after rule override and excludes a renamed list", /** Uses actual list trees to cover tdf135014 with zero clients in the original default rule. @returns Nothing. */ () => {
  const { doc, first, second } = fixture();
  const list = doc.GetDocumentListsManager().GetListForListStyle(first.GetName());
  first.SetDefaultListId(list.GetListId());
  const node = doc.GetNodes().getTextNodes()[0];
  if (node === undefined) throw new Error("Missing native paragraph");
  applyWriterParagraphList(node, {
    kind: "bullet",
    styleId: second.GetName(),
    listId: list.GetListId(),
    level: 0,
  });
  expect(first.GetTextNodeListSize()).toBe(0);
  expect(first.GetParagraphStyleListSize()).toBe(0);
  expect(list.HasNodes()).toBe(true);
  expect(doc.IsUsed(first)).toBe(true);
  list.SetDefaultListStyleName("Other");
  expect(doc.IsUsed(first)).toBe(false);
  list.SetDefaultListStyleName(first.GetName());
  node.RemoveFromList();
  expect(doc.IsUsed(first)).toBe(false);
});

it("retains the upstream client entry when ResetAll bypasses the numbering reset override", /** Preserves the suspected upstream stale-registration branch rather than inventing cleanup. @returns Nothing. */ () => {
  const { doc, first, style } = fixture();
  style.SetFormatAttr(new SwNumRuleItem(first.GetName()));
  expect(first.GetParagraphStyleListSize()).toBe(1);
  style.ResetAllFormatAttr();
  expect(style.GetAttrSet().GetItemIfSet(RES_PARATR_NUMRULE, false)).toBeUndefined();
  expect(first.GetParagraphStyleListSize()).toBe(1);
  expect(doc.IsUsed(first)).toBe(true);
});
