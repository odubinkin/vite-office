/** @fileoverview Native paragraph list dispatch, cached character formatting, copied margins and source restart-reference behavior. */
import { assert, expect, it, vi } from "vitest";
import { createRtfExport } from "../../../../test/writer-rtf-export";
import { applyWriterParagraphList } from "../../core/doc/list";
import { SwNumFormat, SwNumRuleType, SvxNumType } from "../../core/doc/number";
import { SwNumRuleItem } from "../../core/para/paratr";
import {
  SvxTextLeftMarginItem,
  SvxFirstLineIndentItem,
  SvxIndentValue,
} from "../../../../editeng/inc/lrspitem";
import {
  RES_MARGIN_TEXTLEFT,
  RES_MARGIN_FIRSTLINE,
  RES_PARATR_LIST_LEVEL,
  RES_CHRATR_WEIGHT,
} from "../../../inc/hintids";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { FontWeight } from "../../../../tools/inc/fontenum";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";

it.each([9, 32768, 65535])(
  "duplicates restart %s at Writer level9 before the Word clamp and keeps the original list reference",
  /** Checks signed restart narrowing, the USHRT_MAX clear sentinel and actual export ownership. @param restart - Native setter input. @returns Nothing. */ (
    restart,
  ) => {
    const owner = createRtfExport(),
      doc = owner.m_rDoc,
      node = doc.paragraphs[0];
    assert(node);
    node.SetText("Restart");
    applyWriterParagraphList(node, { kind: "numbered", level: 9, listId: "numbers" });
    const rule = node.GetNumRule();
    assert(rule);
    const format = new SwNumFormat(rule.Get(9));
    format.SetStart(17);
    rule.Set(9, format);
    format.Dispose();
    node.SetListRestart(true);
    node.SetAttrListRestartValue(restart);
    const before = [...doc.GetNumRuleTable()],
      text = new TextDecoder().decode(owner.ExportDocument());
    const temporary = owner.m_pUsedNumTable?.at(-1);
    assert(temporary);
    expect(owner.m_nUniqueList).toBe(1);
    expect(temporary.GetName()).toBe("WW8TempExport0");
    expect(temporary.Get(9).GetStart()).toBe(restart === 65535 ? 17 : restart);
    expect(temporary.Get(8).GetStart()).toBe(rule.Get(8).GetStart());
    expect(rule.Get(9).GetStart()).toBe(17);
    expect(doc.GetNumRuleTable()).toEqual(before);
    expect(text).toContain(`\\ilvl8\\ls${owner.GetNumberingId(rule) + 1} `);
    expect(text).not.toContain(`\\listid${owner.GetNumberingId(temporary) + 1}`);
    expect(owner.m_pOutFormatNode).toBeUndefined();
    expect(owner.m_pISet).toBeUndefined();
    owner.Dispose();
    expect(rule.Get(9).GetStart()).toBe(17);
  },
);
it("inserts actual cached character controls in listtext and adjusts copied native margins", /** Checks source li/lin and first-line policy without altering the node's stored items. @returns Nothing. */ () => {
  const owner = createRtfExport(),
    doc = owner.m_rDoc,
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("Label");
  applyWriterParagraphList(node, { kind: "numbered", level: 0, listId: "numbers" });
  const rule = node.GetNumRule();
  assert(rule);
  const style = doc.MakeCharFormat("Label bold", undefined);
  style.SetFormatAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
  const format = new SwNumFormat(rule.Get(0));
  format.SetCharFormat(style);
  format.SetPositionAndSpaceMode("label-alignment");
  format.SetIndentAt(420);
  format.SetFirstLineIndent(-180);
  rule.Set(0, format);
  format.Dispose();
  node.SetAttr(new SvxTextLeftMarginItem(SvxIndentValue.twips(100), RES_MARGIN_TEXTLEFT));
  node.SetAttr(new SvxFirstLineIndentItem(SvxIndentValue.twips(67), RES_MARGIN_FIRSTLINE));
  const text = new TextDecoder().decode(owner.ExportDocument()),
    properties = owner.GetStyle(owner.GetId(style));
  assert(properties !== undefined);
  expect(properties).toContain("\\b");
  expect(text).toContain(
    `{\\listtext\\pard\\plain ${properties} ${node.GetNumString()}\\tab}\\ilvl0\\ls1 \\fi-180\\li520\\lin520`,
  );
  expect(text).toContain("\\fi67\\li100\\lin100");
  expect((node.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft()).toBe(100);
  expect(
    (node.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem).ResolveTextFirstLineOffset(),
  ).toBe(67);
});
it.each([false, true])(
  "keeps the native empty-label tab policy for outline=%s",
  /** Distinguishes source outline policy from ordinary lists with no visible label. @param outline - Native rule kind. @returns Nothing. */ (
    outline,
  ) => {
    const owner = createRtfExport(),
      doc = owner.m_rDoc,
      node = doc.paragraphs[0];
    assert(node);
    node.SetText("Empty label");
    applyWriterParagraphList(node, {
      kind: "numbered",
      level: 0,
      listId: outline ? doc.GetOutlineNumRule().GetName() : "empty",
      ruleName: outline ? doc.GetOutlineNumRule().GetName() : undefined,
    });
    const rule = node.GetNumRule();
    assert(rule);
    const format = new SwNumFormat(rule.Get(0));
    format.SetNumberingType(SvxNumType.SVX_NUM_NUMBER_NONE);
    format.SetListFormat("");
    rule.Set(0, format);
    format.Dispose();
    const text = new TextDecoder().decode(owner.ExportDocument());
    if (outline) {
      expect(rule.GetRuleType()).toBe(SwNumRuleType.OUTLINE_RULE);
      expect(text).toContain("{\\listtext\\pard\\plain \\tab}\\ls1 ");
      expect(text.slice(text.lastIndexOf("{\\listtext"))).not.toContain("\\ilvl");
    } else expect(text).toContain("{\\listtext\\pard\\plain }\\ilvl0\\ls1 ");
  },
);
it("dispatches empty, unknown and style-only rules through the real virtual output and searches inherited list-level items", /** A transparent spy observes the actual implementation; no synthetic output result is installed. @returns Nothing. */ () => {
  const owner = createRtfExport(),
    doc = owner.m_rDoc,
    output = owner.AttrOutput(),
    rule = doc.EnsureNumRule("style numbering", "numbered");
  const parent = doc.MakeTextFormatColl("level parent", doc.GetDfltTextFormatColl());
  parent.SetFormatAttr(new SfxInt16Item(RES_PARATR_LIST_LEVEL, 5));
  const style = doc.MakeTextFormatColl("level child", parent);
  style.SetFormatAttr(new SwNumRuleItem(rule.GetName()));
  const spy = vi.spyOn(output, "ParaNumRule_Impl");
  try {
    owner.m_pOutFormatNode = style;
    owner.m_pISet = style.GetAttrSet();
    expect(output.ParaNumRule(new SwNumRuleItem())).toBe("");
    expect(spy).toHaveBeenLastCalledWith(undefined, 0, 0);
    spy.mockClear();
    expect(output.ParaNumRule(new SwNumRuleItem("unknown"))).toBe("");
    expect(spy).not.toHaveBeenCalled();
    output.ParaNumRule(new SwNumRuleItem(rule.GetName()));
    expect(spy).toHaveBeenLastCalledWith(undefined, 5, owner.GetNumberingId(rule) + 1);
    style.AssignToListLevelOfOutlineStyle(9);
    output.ParaNumRule(new SwNumRuleItem(rule.GetName()));
    expect(spy).toHaveBeenLastCalledWith(undefined, 8, owner.GetNumberingId(rule) + 1);
  } finally {
    spy.mockRestore();
    owner.m_pOutFormatNode = undefined;
    owner.m_pISet = undefined;
  }
});
it("retains native zero/missing-ID/null/not-in-list guards and skips uncounted paragraphs", /** Verifies guard effects with actual text owners and real list membership. @returns Nothing. */ () => {
  const owner = createRtfExport(),
    doc = owner.m_rDoc,
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("Not counted");
  applyWriterParagraphList(node, { kind: "numbered", level: 0, listId: "numbers" });
  const rule = node.GetNumRule();
  assert(rule);
  owner.m_pOutFormatNode = node;
  owner.m_pISet = node.GetSwAttrSet();
  owner.EnsureUsedNumberingTable();
  const output = owner.AttrOutput();
  for (const id of [0, 65535]) expect(output.ParaNumRule_Impl(node, 0, id)).toBe("");
  expect(output.ParaNumRule_Impl(undefined, 0, 1)).toBe("");
  node.SetCountedInList(false);
  expect(output.ParaNumRule(new SwNumRuleItem(rule.GetName()))).toBe("");
  node.RemoveFromList();
  expect(output.ParaNumRule_Impl(node, 0, 1)).toBe("");
  owner.m_pOutFormatNode = undefined;
  owner.m_pISet = undefined;
});

it("exports legacy list geometry and corrects retained tab positions without mutating paragraph attributes", /** Checks the final visible paragraph controls after native list preparation and sorted item dispatch. @returns Nothing. */ () => {
  const owner = createRtfExport(),
    node = owner.m_rDoc.paragraphs[0];
  assert(node);
  node.SetText("Legacy");
  applyWriterParagraphList(node, { kind: "numbered", level: 0, listId: "legacy" });
  const rule = node.GetNumRule();
  assert(rule);
  const format = new SwNumFormat(rule.Get(0));
  format.SetPositionAndSpaceMode("label-width-and-position");
  format.SetAbsLSpace(600);
  format.SetFirstLineOffset(-200);
  rule.Set(0, format);
  format.Dispose();
  node.SetAttr(new SvxTextLeftMarginItem(SvxIndentValue.twips(100), RES_MARGIN_TEXTLEFT));
  node.SetAttr(new SvxFirstLineIndentItem(SvxIndentValue.twips(25), RES_MARGIN_FIRSTLINE));
  const tabs = new SvxTabStopItem(RES_PARATR_TABSTOP);
  tabs.Insert(new SvxTabStop(400));
  tabs.Insert(new SvxTabStop(900, SvxTabAdjust.Right));
  node.SetAttr(tabs);
  const before = Array.from(
    { length: tabs.Count() },
    /** Records source positions including shipped default stops. @param _unused - Array placeholder. @param index - Stop index. @returns Position. */ (
      _unused,
      index,
    ) => tabs.At(index).GetTabPos(),
  );
  const text = new TextDecoder().decode(owner.ExportDocument());
  expect(text).toContain("\\fi-175\\li700\\lin700");
  const offset = node.GetDoc().GetDocumentSettingManager().get("TABS_RELATIVE_TO_INDENT") ? 700 : 0;
  expect(text).toContain(`\\tx${offset}\\tqr\\tx${300 + offset}`);
  const stored = node.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem;
  expect(
    Array.from(
      { length: stored.Count() },
      /** Reads retained stored positions. @param _unused - Array placeholder. @param index - Stop index. @returns Position. */ (
        _unused,
        index,
      ) => stored.At(index).GetTabPos(),
    ),
  ).toEqual(before);
  expect((node.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft()).toBe(100);
});
it("exports an uncounted list paragraph with visual indent and zero first-line offset", /** Uses the real list/tree owner and verifies visible geometry without a list label. @returns Nothing. */ () => {
  const owner = createRtfExport(),
    node = owner.m_rDoc.paragraphs[0];
  assert(node);
  node.SetText("Continuation");
  applyWriterParagraphList(node, { kind: "numbered", level: 0, listId: "continuation" });
  const rule = node.GetNumRule();
  assert(rule);
  const format = new SwNumFormat(rule.Get(0));
  format.SetPositionAndSpaceMode("label-alignment");
  format.SetIndentAt(420);
  rule.Set(0, format);
  format.Dispose();
  node.SetAttr(new SvxTextLeftMarginItem(SvxIndentValue.twips(100), RES_MARGIN_TEXTLEFT));
  node.SetAttr(new SvxFirstLineIndentItem(SvxIndentValue.twips(-20), RES_MARGIN_FIRSTLINE));
  node.SetCountedInList(false);
  const text = new TextDecoder().decode(owner.ExportDocument());
  expect(text).toContain("\\fi0\\li500\\lin500");
  expect(text).not.toContain("{\\listtext");
  expect(
    (node.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem).ResolveTextFirstLineOffset(),
  ).toBe(-20);
});
import { SvxTabStop, SvxTabStopItem, SvxTabAdjust } from "../../../../editeng/inc/tstpitem";
import { RES_PARATR_TABSTOP } from "../../../inc/hintids";
it("exports list membership inherited from a paragraph style without installing direct rule attributes", /** Exercises native temporary rule injection through the actual paragraph export path. @returns Nothing. */ () => {
  const owner = createRtfExport(),
    doc = owner.m_rDoc,
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("Inherited list");
  applyWriterParagraphList(node, { kind: "numbered", level: 2, listId: "inherited" });
  const rule = node.GetNumRule();
  assert(rule);
  const style = doc.MakeTextFormatColl("Inherited list style", doc.GetDfltTextFormatColl());
  style.SetFormatAttr(new SwNumRuleItem(rule.GetName()));
  node.ChgFormatColl(style);
  node.ResetAttr(RES_PARATR_NUMRULE);
  expect(node.GetNumRule()).toBe(rule);
  expect(node.IsInList()).toBe(true);
  expect(node.GetSwAttrSet().GetItemIfSet(RES_PARATR_NUMRULE, false)).toBeUndefined();
  const text = new TextDecoder().decode(owner.ExportDocument());
  expect(text).toContain(`\\ilvl2\\ls${owner.GetNumberingId(rule) + 1} `);
  expect(node.GetSwAttrSet().GetItemIfSet(RES_PARATR_NUMRULE, false)).toBeUndefined();
});
import { RES_PARATR_NUMRULE } from "../../../inc/hintids";
