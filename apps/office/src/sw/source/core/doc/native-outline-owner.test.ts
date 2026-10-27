/** @fileoverview Verifies the source docnew outline owner, transferred numbering identity and Worker owner restoration. */
import { afterEach, expect, it } from "vitest";
import { SwDoc } from "./doc";
import { SwNumRule, SwNumRuleType, SvxNumType } from "./number";
import { SwNumRuleItem } from "../para/paratr";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";

const docs: SwDoc[] = [];
afterEach(
  /** Releases native graph owners. @returns Nothing. */ () => {
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Creates an actual document. @returns Owned graph. */
function document() {
  const doc = new SwDoc();
  docs.push(doc);
  return doc;
}
it("creates the persistent outline rule before ordinary numbering rules and body text", /** Checks native identity, mode, defaults and original default-list creation. @returns Nothing. */ () => {
  const doc = document(),
    rule = doc.GetOutlineNumRule();
  expect(doc.GetNumRuleTable()).toEqual([rule]);
  expect(doc.FindNumRulePtr(SwNumRule.GetOutlineRuleName())).toBe(rule);
  expect(rule.GetRuleType()).toBe(SwNumRuleType.OUTLINE_RULE);
  expect(rule.IsAutoRule()).toBe(true);
  expect(rule.IsCountPhantoms()).toBe(!doc.GetDocumentSettingManager().get("OLD_NUMBERING"));
  expect(rule.GetDefaultNumberFormatPositionAndSpaceMode()).toBe("label-alignment");
  expect(rule.GetNumFormat(0)).toBeUndefined();
  expect(rule.Get(0).GetNumberingType()).toBe(SvxNumType.SVX_NUM_NUMBER_NONE);
  expect(doc.GetDocumentListsManager().GetListByName(rule.GetDefaultListId())).toBe(
    doc.GetDocumentListsManager().GetListForListStyle(rule.GetName()),
  );
  expect(doc.IsUsed(rule)).toBe(false);
  expect(doc.paragraphs[0]?.GetNumRule()).toBeUndefined();
  const ordinary = doc.EnsureNumRule("Ordinary", "numbered");
  expect(doc.GetNumRuleTable()).toEqual([rule, ordinary]);
});
it("transfers actual rules without cloning and separates table insertion from the last-name index", /** Preserves source ownership and duplicate-name map behavior rather than manufacturing uniqueness. @returns Nothing. */ () => {
  const doc = document();
  const first = new SwNumRule("Owned", "label-alignment");
  first.SetDefaultListId(doc.GetOutlineNumRule().GetDefaultListId());
  expect(doc.AddNumRule(first)).toBe(first);
  const list = doc.GetDocumentListsManager().GetListForListStyle("Owned");
  expect(first.GetDefaultListId()).toBe(list.GetListId());
  expect(first.GetDefaultListId()).not.toBe(doc.GetOutlineNumRule().GetDefaultListId());
  first.SetHidden(true);
  expect(doc.FindNumRulePtr("Owned")?.IsHidden()).toBe(true);
  const second = new SwNumRule("Owned", "label-alignment");
  doc.AddNumRule(second);
  expect(doc.GetNumRuleTable()).toEqual([doc.GetOutlineNumRule(), first, second]);
  expect(doc.FindNumRulePtr("Owned")).toBe(second);
  expect(second.GetDefaultListId()).toBe("");
  expect(doc.GetDocumentListsManager().GetListForListStyle("Owned")).toBe(list);
});
it("restores the precreated outline owner once and registers direct paragraph styles after rules", /** Checks actual Worker identity, sparse formats and native style client restoration. @returns Nothing. */ () => {
  const doc = document(),
    outline = doc.GetOutlineNumRule();
  const format = outline.Get(2).clone();
  format.SetNumberingType(SvxNumType.SVX_NUM_CHAR_SPECIAL);
  format.SetBulletChar(0x2605);
  outline.Set(2, format);
  const rule = doc.EnsureNumRule("Named", "numbered");
  const style = doc.MakeTextFormatColl("Numbered style", doc.GetDfltTextFormatColl());
  style.SetFormatAttr(new SwNumRuleItem(rule.GetName()));
  expect(rule.GetParagraphStyleListSize()).toBe(1);
  const restored = decodeWriterDocument(encodeWriterDocument(doc));
  docs.push(restored);
  expect(restored.GetNumRuleTable()).toHaveLength(2);
  expect(restored.GetNumRuleTable()[0]).toBe(restored.GetOutlineNumRule());
  expect(restored.GetOutlineNumRule()).not.toBe(outline);
  expect(restored.GetOutlineNumRule().Get(2).GetBulletChar()).toBe(0x2605);
  expect(restored.GetOutlineNumRule().GetNumFormat(1)).toBeUndefined();
  expect(restored.FindNumRulePtr("Named")?.GetParagraphStyleListSize()).toBe(1);
  expect(restored.IsUsed(restored.FindNumRulePtr("Named") as SwNumRule)).toBe(true);
});
it("copies ordinary rule owners explicitly between document node arrays", /** Protects cross-document ownership after removal of the old implicit AddNumRule copy. @returns Nothing. */ () => {
  const source = document(),
    destination = document();
  const rule = source.EnsureNumRule("Copied", "numbered");
  destination.GetNodes().copyContentFrom(source.GetNodes());
  const copy = destination.FindNumRulePtr("Copied");
  expect(copy).not.toBe(rule);
  expect(copy?.Equals(rule)).toBe(true);
  expect(destination.GetOutlineNumRule()).not.toBe(source.GetOutlineNumRule());
});

it("migrates legacy authored rules without inferring the outline owner from their names or types", /** Legacy graphs have no owner pointer index, so the native initialized outline remains distinct. @returns Nothing. */ () => {
  const source = document();
  source.EnsureNumRule("Legacy", "numbered");
  const record = structuredClone(encodeWriterDocument(source));
  delete (record as { outlineRuleIndex?: number }).outlineRuleIndex;
  (record as { numRules: typeof record.numRules }).numRules = record.numRules.slice(1);
  const restored = decodeWriterDocument(record);
  docs.push(restored);
  expect(restored.GetNumRuleTable()).toHaveLength(2);
  expect(restored.GetNumRuleTable()[0]).toBe(restored.GetOutlineNumRule());
  expect(restored.FindNumRulePtr("Legacy")?.GetRuleType()).toBe(SwNumRuleType.NUM_RULE);
  for (const index of [-1, 0.5, 3]) {
    expect(
      /** Rejects a malformed pointer index before owner restoration. @returns Invalid graph. */ () =>
        decodeWriterDocument({ ...encodeWriterDocument(source), outlineRuleIndex: index }),
    ).toThrow("outline owner index is invalid");
  }
});
