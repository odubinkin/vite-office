/** @fileoverview Original Word style-name suffix allocation and finite stylesheet slot contracts. */
import { assert, expect, it } from "vitest";
import { RtfExport } from "./rtfexport";
import { MSWordStyles } from "./wrtw8sty";

it("allocates case-insensitive Word suffixes past existing numeric names", /** Checks the native style table rather than renaming the actual Writer collections. @returns Nothing. */ () => {
  const owner = createRtfExport(),
    doc = owner.m_rDoc;
  try {
    const parent = doc.GetDfltTextFormatColl();
    const numbered = doc.MakeTextFormatColl("Normal1", parent);
    const first = doc.MakeTextFormatColl("Normal", parent);
    const second = doc.MakeTextFormatColl("NORMAL", parent);
    const styles = new MSWordStyles(owner);
    expect(styles.GetWWName(numbered)).toBe("Normal1");
    expect(styles.GetWWName(first)).toBe("Normal2");
    expect(styles.GetWWName(second)).toBe("NORMAL3");
    expect(first.GetName()).toBe("Normal");
    expect(second.GetName()).toBe("NORMAL");
  } finally {
    owner.Dispose();
  }
});

it("retains the native 4091-slot bound and missing-style sentinel", /** Checks an actual overflow collection through the Word table and RTF export. @returns Nothing. */ () => {
  const owner = createRtfExport(),
    doc = owner.m_rDoc;
  try {
    const parent = doc.GetDfltTextFormatColl();
    for (let index = 0; index < 4092; index++) doc.MakeTextFormatColl(`Bounded ${index}`, parent);
    const overflow = doc.MakeTextFormatColl("Overflow style", parent);
    const paragraph = doc.paragraphs[0];
    assert(paragraph);
    paragraph.SetText("Overflow paragraph");
    paragraph.ChgFormatColl(overflow);
    const styles = new MSWordStyles(owner);
    expect(styles.GetStyles()).toHaveLength(4091);
    expect(styles.GetSlot(overflow)).toBe(0x0fff);
    expect(styles.GetSlot(undefined)).toBe(1);
    expect(styles.GetWWName(overflow)).toBe("Overflow style");
    const rtf = new TextDecoder().decode(RtfExport.WriteDocument(doc));
    expect(rtf).not.toContain(" Overflow style;");
    const body = rtf.slice(rtf.lastIndexOf("\\pard"));
    expect(body).toContain("Overflow paragraph");
    expect(body).toContain("\\s0");
  } finally {
    owner.Dispose();
  }
});

import { createRtfExport } from "../../../../test/writer-rtf-export";

it("matches unchanged native Word style functions for all65536 pool IDs and builtin-name inputs", /** Covers every range/case and native null result using actual SwFormat scalar ownership. @returns Nothing. */ () => {
  const owner = createRtfExport(),
    format = owner.m_rDoc.MakeCharFormat("native probe", undefined);
  let count = 0;
  for (const [first, last, word, slot] of native.ranges) {
    assert(first !== undefined && last !== undefined);
    for (let id = first; id <= last; ++id) {
      format.SetPoolFormatId(id);
      expect(MSWordStyles.GetWWId(format)).toBe(word);
      expect(BuildGetSlot(format)).toBe(slot);
      expect(GetEnglishNameFromSti(id)).toBe(native.englishNames[id]);
      ++count;
    }
  }
  expect(count).toBe(65536);
  expect(GetEnglishNameFromSti(65536)).toBe("Normal");
  expect(GetEnglishNameFromSti(-1)).toBeUndefined();
});
it("places character styles first and allocates builtin names before user collisions across both format families", /** Uses native pointer slots, char fallback and recorded null lookup behavior. @returns Nothing. */ () => {
  const owner = createRtfExport(),
    doc = owner.m_rDoc;
  const para = doc.MakeTextFormatColl("Strong", doc.GetDfltTextFormatColl());
  const user = doc.MakeCharFormat("Strong", undefined),
    builtin = doc.GetCharFormatFromPool(SwPoolFormatId.CHR_HTML_STRONG);
  assert(builtin);
  const styles = new MSWordStyles(owner);
  owner.m_pStyles = styles;
  expect(styles.GetSlot(user)).toBe(15);
  expect(styles.GetSlot(builtin)).toBe(16);
  expect(styles.GetSlot(para)).toBe(17);
  expect(styles.GetWWName(builtin)).toBe("Strong");
  expect(styles.GetWWName(user)).toBe("Strong1");
  expect(styles.GetWWName(para)).toBe("Strong2");
  expect(styles.GetSlot(undefined)).toBe(native.nullSlots[0]);
  expect(owner.GetId(undefined)).toBe(1);
  expect(owner.GetId(doc.GetDfltCharFormat())).toBe(10);
  expect(owner.GetId(doc.MakeCharFormat("late", undefined))).toBe(10);
  for (let level = 1; level <= 9; ++level) doc.GetTextFormatColl(`heading-${level}`);
  expect(new MSWordStyles(owner).GetSlot(undefined)).toBe(native.nullSlots[1]);
});
it("serializes real character definitions and retains first-inserted property-only style cache entries", /** Checks the actual RTF header path and the cache consumed by paragraph numbering. @returns Nothing. */ () => {
  const owner = createRtfExport(),
    doc = owner.m_rDoc,
    style = doc.MakeCharFormat("Label style", doc.GetDfltCharFormat());
  style.SetFormatAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
  const text = new TextDecoder().decode(owner.ExportDocument()),
    slot = owner.m_pStyles?.GetSlot(style);
  assert(slot !== undefined);
  expect(text).toContain(`{\\*\\cs${slot}\\snext${slot}`);
  expect(text).toContain(" Label style;}");
  const properties = owner.GetStyle(slot);
  assert(properties !== undefined);
  expect(properties).toContain("\\b");
  expect(properties).not.toContain("Label style");
  expect(properties).not.toContain("\\cs");
  owner.InsStyle(slot, "replacement");
  expect(owner.GetStyle(slot)).toBe(properties);
  expect(owner.GetStyle(60000)).toBeUndefined();
});
it("retains original style framing, auto-update flag and character self-next value", /** Exercises real native output buffering while binding the existing StyleDefinition string sink. @returns Nothing. */ () => {
  const owner = createRtfExport(),
    output = owner.AttrOutput();
  output.StartStyles();
  output.StartStyle("Direct", StyleType.STYLE_TYPE_CHAR, 0x0fff, 15, 0x0fff, 0, 15, true);
  output.EndStyle("\\b");
  output.EndStyles(16);
  expect(new TextDecoder().decode(owner.Strm().GetData())).toBe(
    "\n{\\colortbl;}\n{\\stylesheet{\\*\\cs15\\snext15\\sautoupd\\b Direct;}\n}",
  );
  expect(owner.GetStyle(15)).toBe("\\b");
});
import native from "./word-styles-native.json";
import { BuildGetSlot } from "./wrtw8sty";
import { GetEnglishNameFromSti } from "./styles";
import { SwPoolFormatId } from "../../../inc/poolfmt";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { FontWeight } from "../../../../tools/inc/fontenum";
import { RES_CHRATR_WEIGHT } from "../../../inc/hintids";
import { StyleType } from "./attributeoutputbase";
