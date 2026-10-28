/** @fileoverview Source Word-level preparation and RTF table output against actual document/format owners. */
import { assert, expect, it } from "vitest";
import { createRtfExport } from "../../../../test/writer-rtf-export";
import { SwNumFormat } from "../../core/doc/number";
import { SvxNumType, SvxAdjust } from "../../../../editeng/inc/svxenum";
import { NumberingLevel } from "./wrtw8num";
import { applyWriterParagraphList } from "../../core/doc/list";
import { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_MS_1252 } from "../../../../sal/inc/rtl/textenc";
import { LANGUAGE_CHINESE_SIMPLIFIED } from "../../../../i18nlangtag/inc/lang";
import {
  RES_CHRATR_CJK_LANGUAGE,
  RES_CHRATR_FONT,
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CTL_FONT,
} from "../../../inc/hintids";

/** Extracts a level from a complete source abstract list. @param text - RTF. @param id - Abstract ID. @param level - Zero-based Word level. @returns Serialized level through levelnumbers. */
function levelText(text: string, id: number, level: number): string {
  const list = text.split(`\\listtemplateid${id}`)[1]?.split(`\\listid${id}}`)[0];
  assert(list);
  const result = list.split("{\\listlevel")[level + 1];
  assert(result);
  return result;
}
it("uses the font helper's actual used-rule table and pointer IDs, including style-only and unused outline rules", /** Checks source table order, native nine/one limits, original override destination and paragraph reference. @returns Nothing. */ () => {
  const owner = createRtfExport(),
    doc = owner.m_rDoc;
  const style = doc.EnsureNumRule("style-only", "numbered");
  doc
    .MakeTextFormatColl("list style", doc.GetDfltTextFormatColl())
    .SetFormatAttr(new SwNumRuleItem(style.GetName()));
  const continuous = doc.EnsureNumRule("continuous", "numbered");
  continuous.SetUsedByRedline(true);
  continuous.SetContinusNum(true);
  doc.EnsureNumRule("unused", "numbered");
  const node = doc.paragraphs[0];
  assert(node);
  node.SetText("body");
  applyWriterParagraphList(node, { kind: "numbered", level: 2, listId: "body-list" });
  const rule = node.GetNumRule();
  assert(rule);
  const text = new TextDecoder().decode(owner.ExportDocument());
  expect(owner.m_pUsedNumTable).toEqual([style, continuous, rule, doc.GetOutlineNumRule()]);
  expect(owner.GetNumberingId(rule)).toBe(2);
  expect(owner.GetNumberingId(doc.EnsureNumRule("late", "numbered"))).toBe(65535);
  expect(text.match(/\\listtemplateid/g)).toHaveLength(4);
  expect(text.match(/\\listlevel/g)).toHaveLength(28);
  expect(text).toContain("}{\\listoverridetable{\\listoverride\\listid1\\listoverridecount0\\ls1}");
  expect(text).not.toContain("\\listsimple");
  expect(text).toContain("\\ilvl2\\ls3");
  expect(levelText(text, 4, 0)).toContain("\\levelnfc255");
});
it("serializes level-specific/repeated placeholders instead of a fixed level-zero label", /** Verifies UTF16 placeholder bytes, one-based positions and ordinary suffixes. @returns Nothing. */ () => {
  const owner = createRtfExport(),
    rule = owner.m_rDoc.EnsureNumRule("pattern", "numbered");
  rule.SetUsedByRedline(true);
  const format = new SwNumFormat(rule.Get(2));
  format.SetListFormat("[%2%|%1%|%2%]");
  rule.Set(2, format);
  const text = new TextDecoder().decode(owner.ExportDocument());
  expect(levelText(text, 1, 2)).toContain(
    "{\\leveltext \\'07[\\'01|\\'00|\\'01];}{\\levelnumbers\\'02\\'04\\'06;}",
  );
  expect(levelText(text, 1, 1)).toContain("{\\leveltext \\'02\\'01.;}{\\levelnumbers\\'01;}");
});
it("preserves the source separator suppression, unsupported tenth level and position-byte overflow", /** Tests observable source edge cases directly through the common level writer. @returns Nothing. */ () => {
  const cases = [
    ["%1%/%2%/%3%", "\\'04\\'00\\'01/\\'02", "\\'01\\'02\\'04"],
    ["%3%/%9%/suffix", "\\'09\\'02//suffix", "\\'01"],
    ["%10%/%3%.", "\\'02\\'02.", "\\'01"],
    ["%3%/%10%/end", "\\'06\\'02//end", "\\'01"],
    ["x".repeat(255) + "%3%", "\\'00" + "x".repeat(255) + "\\'02", ""],
  ] as const;
  for (const [pattern, expectedText, expectedPositions] of cases) {
    const owner = createRtfExport(),
      rule = owner.m_rDoc.EnsureNumRule("edge", "numbered");
    const none = new SwNumFormat();
    none.SetNumberingType(SvxNumType.SVX_NUM_NUMBER_NONE);
    rule.Set(0, none);
    const format = new SwNumFormat(rule.Get(2));
    format.SetListFormat(pattern);
    rule.Set(2, format);
    NumberingLevel(owner, rule, 2);
    const text = new TextDecoder().decode(owner.Strm().GetData());
    expect(text).toContain(`{\\leveltext ${expectedText};}{\\levelnumbers${expectedPositions};}`);
  }
});
it("writes native alignment, legal, follow, start and signed16 indent fields", /** Covers legacy right-aligned distance and label alignment without modifying source geometry. @returns Nothing. */ () => {
  const owner = createRtfExport(),
    rule = owner.m_rDoc.EnsureNumRule("geometry", "numbered");
  const format = new SwNumFormat(rule.Get(0));
  format.SetPositionAndSpaceMode("label-width-and-position");
  format.SetNumAdjust(SvxAdjust.Right);
  format.SetStart(65535);
  format.SetIsLegal(true);
  format.SetAbsLSpace(40000);
  format.SetFirstLineOffset(-360);
  format.SetCharTextDistance(240);
  rule.Set(0, format);
  NumberingLevel(owner, rule, 0);
  expect(new TextDecoder().decode(owner.Strm().GetData())).toContain(
    "\\leveljc2\\levelstartat65535\\levellegal\\levelfollow0",
  );
  expect(new TextDecoder().decode(owner.Strm().GetData())).toContain("\\fi-240\\li-25536}");
  expect(rule.Get(0).GetAbsLSpace()).toBe(40000);
  const aligned = new SwNumFormat(rule.Get(0));
  aligned.SetPositionAndSpaceMode("label-alignment");
  aligned.SetIndentAt(66000);
  aligned.SetFirstLineIndent(-40000);
  aligned.SetLabelFollowedBy("space");
  aligned.SetNumberingType(SvxNumType.SVX_NUM_NUMBER_NONE);
  aligned.SetListFormat("");
  rule.Set(0, aligned);
  NumberingLevel(owner, rule, 0);
  const text = new TextDecoder().decode(owner.Strm().GetData());
  expect(text).toContain("\\levelnfc255\\leveljc2\\levelstartat65535\\levellegal\\levelfollow2");
  expect(text).toContain("\\fi25536\\li464}");
});
it("uses CJK character-style language for Chinese NFC and retains actual bullet font identities", /** Checks borrowed numeric style and copied bullet style behavior through actual native items. @returns Nothing. */ () => {
  const owner = createRtfExport(),
    doc = owner.m_rDoc,
    rule = doc.EnsureNumRule("style", "numbered");
  const style = doc.MakeCharFormat("number style", undefined);
  style.SetFormatAttr(new SvxColorItem(new Color(0x123456), RES_CHRATR_COLOR));
  style.SetFormatAttr(new SvxLanguageItem(LANGUAGE_CHINESE_SIMPLIFIED, RES_CHRATR_CJK_LANGUAGE));
  for (const which of [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT])
    style.SetFormatAttr(
      new SvxFontItem(
        FontFamily.FAMILY_ROMAN,
        `Native${which}`,
        "",
        FontPitch.PITCH_VARIABLE,
        RTL_TEXTENCODING_MS_1252,
        which,
      ),
    );
  const format = new SwNumFormat(rule.Get(0));
  format.SetCharFormat(style);
  format.SetNumberingType(SvxNumType.SVX_NUM_NUMBER_LOWER_ZH);
  rule.Set(0, format);
  NumberingLevel(owner, rule, 0);
  expect(new TextDecoder().decode(owner.Strm().GetData())).toContain("\\levelnfc39");
  const bullet = new SwNumFormat(format);
  bullet.SetNumberingType(SvxNumType.SVX_NUM_CHAR_SPECIAL);
  bullet.SetBulletChar(0x1f642);
  rule.Set(0, bullet);
  NumberingLevel(owner, rule, 0);
  const text = new TextDecoder().decode(owner.Strm().GetData());
  expect(text).toContain("{\\leveltext \\'01\\u-10179 ?;}{\\levelnumbers;}");
  expect(style.GetAttrSet().GetItemIfSet(RES_CHRATR_FONT, false)).toBeDefined();
  expect(style.GetAttrSet().GetItemIfSet(RES_CHRATR_CJK_FONT, false)).toBeDefined();
});

/** Native named-character color must be present before numbering callbacks reference its index. */
it("declares character-style numbering colors before writing the list levels", /** Exercises real RTF serialization rather than callbacks after the header. @returns Nothing. */ () => {
  const owner = createRtfExport(),
    doc = owner.m_rDoc;
  const rule = doc.EnsureNumRule("colored", "numbered");
  rule.SetUsedByRedline(true);
  const style = doc.MakeCharFormat("label color", undefined);
  style.SetFormatAttr(new SvxColorItem(new Color(0x123456), RES_CHRATR_COLOR));
  const level = new SwNumFormat(rule.Get(0));
  level.SetCharFormat(style);
  rule.Set(0, level);
  const text = new TextDecoder().decode(owner.ExportDocument());
  expect(text).toContain("\\red18\\green52\\blue86;");
  const table = text.split("{\\colortbl;")[1]?.split("}")[0];
  assert(table);
  const entries = table.split(";");
  const color =
    entries.findIndex(
      /** Finds the declared RGB entry. @param entry - Table entry. @returns Match. */ (entry) =>
        entry === "\\red18\\green52\\blue86",
    ) + 1;
  expect(levelText(text, 1, 0)).toContain(`\\cf${color}`);
});
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { Color } from "../../../../tools/inc/color";
import { RES_CHRATR_COLOR } from "../../../inc/hintids";

import { SwNumRuleItem } from "../../core/para/paratr";
