/** @fileoverview Checks the bounded SwList counter and SwTextNode list attributes against pinned list.cxx, SwNumberTree.cxx and ndtxt.cxx. */

import { describe, expect, it } from "vitest";

import { createWriterDocument } from "./doc";
import { applyWriterParagraphList } from "./list";
import { getWriterParagraphListMarker } from "./number";
import { SfxStringItem } from "../../../../svl/source/items/poolitem";
import { RES_PARATR_LIST_ID } from "../../../inc/hintids";
import { SwNumRuleItem } from "../para/paratr";

describe("Writer list attribute invariants", /** Registers source-backed list tests. @returns Nothing. */ () => {
  it("revalidates restart and counted changes without advancing an uncounted item", /** Checks SwNodeNum::IsCounted and SwNumberTreeNode::ValidateChildren. @returns Nothing. */ () => {
    const document = createWriterDocument();
    const first = document.paragraphs[0];
    if (first === undefined) throw new Error("Writer fixture has no first paragraph.");
    const second = document.nodes.MakeTextNode();
    const third = document.nodes.MakeTextNode();
    for (const node of [first, second, third])
      applyWriterParagraphList(node, { kind: "numbered", level: 0 });
    expect([
      first.GetListItemNumber(),
      second.GetListItemNumber(),
      third.GetListItemNumber(),
    ]).toEqual([1, 2, 3]);
    second.SetListRestart(true, 5);
    expect([second.GetListItemNumber(), third.GetListItemNumber()]).toEqual([5, 6]);
    expect(
      /** Rejects an invalid restart without partial mutation. @returns Nothing. */ () =>
        second.SetListRestart(true, 40_000),
    ).toThrow("outside the supported range");
    expect(second.GetAttrListRestartValue()).toBe(5);
    second.SetListRestart(true);
    expect([second.GetListItemNumber(), third.GetListItemNumber()]).toEqual([1, 2]);
    second.SetListRestart(false);
    second.SetCountedInList(false);
    expect(second.IsCountedInList()).toBe(false);
    expect([first.GetListItemNumber(), third.GetListItemNumber()]).toEqual([1, 2]);
    expect(second.GetListLabel()).toBeUndefined();
    expect(getWriterParagraphListMarker(document.paragraphs, second)).toBeUndefined();
    const captured = second.CaptureListItems();
    second.SetCountedInList(true);
    expect([second.GetListItemNumber(), third.GetListItemNumber()]).toEqual([2, 3]);
    second.SetListItems(captured);
    expect(second.IsCountedInList()).toBe(false);
    expect(third.GetListItemNumber()).toBe(2);
  });

  it("reparents a registered item after a level change", /** Checks SwTextNode::SetAttrListLevel and SwList::InsertListItem. @returns Nothing. */ () => {
    const document = createWriterDocument();
    const first = document.paragraphs[0];
    if (first === undefined) throw new Error("Writer fixture has no first paragraph.");
    const second = document.nodes.MakeTextNode();
    applyWriterParagraphList(first, { kind: "numbered", level: 0 });
    applyWriterParagraphList(second, { kind: "numbered", level: 0 });
    const list = document.GetDocumentListsManager().GetListByName(first.GetListId());
    expect(list?.GetListItemNumber(second)).toBe(0);
    second.SetAttrListLevel(1);
    list?.ValidateListTree(document.paragraphs);
    expect(list?.GetListItem(second)?.level).toBe(1);
    expect(list?.GetListItem(second)?.GetParent()?.GetTextNode()).toBe(first);
    expect(list?.GetListItemNumberVector(second)).toEqual([1, 1]);
    second.SetAttrListLevel(0);
    list?.ValidateListTree(document.paragraphs);
    expect(list?.GetListItem(second)?.GetParent()).toBeUndefined();
    expect(list?.GetListItemNumber(second)).toBe(2);
  });

  it("starts after an uncounted first item and tolerates restored unregistered list attributes", /** Checks the bounded counter-tree first-child rule and incomplete restore states. @returns Nothing. */ () => {
    const document = createWriterDocument();
    const first = document.paragraphs[0];
    if (first === undefined) throw new Error("Writer fixture has no first paragraph.");
    const second = document.nodes.MakeTextNode();
    applyWriterParagraphList(first, { kind: "numbered", level: 0 });
    applyWriterParagraphList(second, { kind: "numbered", level: 0 });
    first.SetCountedInList(false);
    expect(first.GetListItemNumber()).toBe(0);
    expect(first.GetListLabel()).toBeUndefined();
    expect(second.GetListItemNumber()).toBe(1);
    const restored = document.nodes.MakeTextNode();
    restored.SetAttr(new SwNumRuleItem(first.GetNumRuleName()));
    restored.SetAttr(new SfxStringItem(RES_PARATR_LIST_ID, "restored-list"));
    expect(restored.GetListLabel()).toBeUndefined();
    document.GetDocumentListsManager().CreateList(first.GetNumRuleName(), "restored-list");
    expect(restored.GetListLabel()).toBeUndefined();
  });
});
