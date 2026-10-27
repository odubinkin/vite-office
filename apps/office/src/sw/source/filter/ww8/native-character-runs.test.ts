/** @fileoverview Native Word pseudo-run boundaries over genuine SwDoc fonts, BreakIteratorImpl and ICU default bidi levels. Direction is an explicit native field binding; whole document traversal is not exercised here. */
import { expect, it } from "vitest";
import { getPseudoCharRunsForDirection, IfBeforeStart } from "./writerwordglue";
import { CharRunEntry } from "../inc/msfilter";
import { SwDoc } from "../../core/doc/doc";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { FontFamily as F, FontPitch as P } from "../../../../tools/inc/fontenum";
import { SvxFrameDirection as D } from "../../../../editeng/inc/frmdir";
import * as S from "../../../../offapi/com/sun/star/i18n/ScriptType";
import * as E from "../../../../sal/inc/rtl/textenc";
import {
  GetExtendedTextEncoding,
  GetExtendedCompatibilityTextEncoding,
} from "../../../../tools/inc/tenccvt";
import { RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT } from "../../../inc/hintids";
/** Genuine three-script node with different input charsets; return only the actual owner/node. @param text - Native UTF16 text. @returns Actual model owners. */
function setup(text: string) {
  const doc = new SwDoc(),
    node = doc.GetNodes().getTextNodes()[0];
  if (!node) throw Error("Default text node missing");
  node.SetText(text);
  for (const [which, charset] of [
    [RES_CHRATR_FONT, E.RTL_TEXTENCODING_ISO_8859_7],
    [RES_CHRATR_CJK_FONT, E.RTL_TEXTENCODING_ISO_8859_2],
    [RES_CHRATR_CTL_FONT, E.RTL_TEXTENCODING_ISO_8859_5],
  ] as const)
    node.SetAttr(
      new SvxFontItem(F.FAMILY_SWISS, "Actual font", "", P.PITCH_VARIABLE, charset, which),
    );
  return { doc, node };
}
it("returns original empty Latin record with supplied paragraph direction and extended Western charset", /** Empty native nodes do not invent a weak-script run. @returns Nothing. */ () => {
  const o = setup("");
  try {
    expect(getPseudoCharRunsForDirection(o.node, D.Horizontal_RL_TB)).toEqual([
      new CharRunEntry(0, S.LATIN, E.RTL_TEXTENCODING_MS_1253, true),
    ]);
    expect(getPseudoCharRunsForDirection(o.node, D.Vertical_RL_TB)).toEqual([
      new CharRunEntry(0, S.LATIN, E.RTL_TEXTENCODING_MS_1253, false),
    ]);
  } finally {
    o.doc.Dispose();
  }
});
it("merges script and BiDi boundaries and retains the first script charset for every later run", /** Later CJK/CTL fonts deliberately do not update the native charset field. @returns Nothing. */ () => {
  const o = setup("A中ع");
  try {
    expect(getPseudoCharRunsForDirection(o.node, D.Horizontal_LR_TB)).toEqual([
      new CharRunEntry(1, S.LATIN, E.RTL_TEXTENCODING_MS_1253, false),
      new CharRunEntry(2, S.ASIAN, E.RTL_TEXTENCODING_MS_1253, false),
      new CharRunEntry(3, S.COMPLEX, E.RTL_TEXTENCODING_MS_1253, true),
    ]);
    o.node.SetText("中Aع");
    expect(
      getPseudoCharRunsForDirection(o.node, D.Horizontal_LR_TB).map(
        /** Inspect the original shared charset field. @param entry - Native record. @returns Charset. */ (
          entry,
        ) => entry.meCharSet,
      ),
    ).toEqual([E.RTL_TEXTENCODING_MS_1250, E.RTL_TEXTENCODING_MS_1250, E.RTL_TEXTENCODING_MS_1250]);
    o.node.SetText("عA中");
    expect(
      getPseudoCharRunsForDirection(o.node, D.Horizontal_RL_TB).map(
        /** Inspect the initial CTL charset retention. @param entry - Native record. @returns Charset. */ (
          entry,
        ) => entry.meCharSet,
      ),
    ).toEqual([E.RTL_TEXTENCODING_MS_1251, E.RTL_TEXTENCODING_MS_1251, E.RTL_TEXTENCODING_MS_1251]);
  } finally {
    o.doc.Dispose();
  }
});
it("retains UTF16 supplementary positions, leading weak segments, trailing punctuation and independently owned results", /** Neither grapheme segmentation nor greedy script reassignment replaces the native APIs. @returns Nothing. */ () => {
  const o = setup("A𠀀B");
  try {
    const first = getPseudoCharRunsForDirection(o.node, D.Horizontal_LR_TB);
    expect(
      first.map(
        /** Pin source UTF16 offsets. @param entry - Native record. @returns End and script. */ (
          entry,
        ) => [entry.mnEndPos, entry.mnScript],
      ),
    ).toEqual([
      [1, S.LATIN],
      [3, S.ASIAN],
      [4, S.LATIN],
    ]);
    (first[0] as CharRunEntry).mnEndPos = 99;
    expect(getPseudoCharRunsForDirection(o.node, D.Horizontal_LR_TB)[0]?.mnEndPos).toBe(1);
    o.node.SetText("  A中 ");
    expect(
      getPseudoCharRunsForDirection(o.node, D.Horizontal_LR_TB).map(
        /** Preserve native weak and trailing segments. @param entry - Native record. @returns End and script. */ (
          entry,
        ) => [entry.mnEndPos, entry.mnScript],
      ),
    ).toEqual([
      [2, S.WEAK],
      [3, S.LATIN],
      [5, S.ASIAN],
    ]);
    o.node.SetText("Aא\u202aב\u202cג");
    expect(getPseudoCharRunsForDirection(o.node, D.Horizontal_LR_TB)).toEqual([
      new CharRunEntry(1, S.LATIN, E.RTL_TEXTENCODING_MS_1253, false),
      new CharRunEntry(2, S.COMPLEX, E.RTL_TEXTENCODING_MS_1253, true),
      new CharRunEntry(4, S.COMPLEX, E.RTL_TEXTENCODING_MS_1253, true),
      new CharRunEntry(6, S.COMPLEX, E.RTL_TEXTENCODING_MS_1253, true),
    ]);
    for (const direction of [D.Horizontal_LR_TB, D.Horizontal_RL_TB]) {
      o.node.SetText("אב 12 A ع\u2066中\u2069 ");
      const runs = getPseudoCharRunsForDirection(o.node, direction);
      expect(runs.at(-1)?.mnEndPos).toBe(o.node.Len());
      expect(
        runs.some(
          /** Genuine RTL direction exists. @param run - Native record. @returns Direction. */ (
            run,
          ) => run.mbRTL,
        ),
      ).toBe(true);
      expect(
        runs.some(
          /** Genuine LTR direction exists. @param run - Native record. @returns Opposite direction. */ (
            run,
          ) => !run.mbRTL,
        ),
      ).toBe(true);
    }
  } finally {
    o.doc.Dispose();
  }
});
it("retains original charset extension maps, unsigned input binding and source erase predicate", /** Native field/value boundaries are tested independently of provider services. @returns Nothing. */ () => {
  for (const [input, output] of [
    [E.RTL_TEXTENCODING_ISO_8859_1, E.RTL_TEXTENCODING_MS_1252],
    [E.RTL_TEXTENCODING_ISO_8859_9, E.RTL_TEXTENCODING_MS_1254],
  ] as const)
    expect(GetExtendedCompatibilityTextEncoding(input)).toBe(output);
  for (const [input, output] of [
    [E.RTL_TEXTENCODING_ISO_8859_5, E.RTL_TEXTENCODING_MS_1251],
    [E.RTL_TEXTENCODING_ISO_8859_7, E.RTL_TEXTENCODING_MS_1253],
    [E.RTL_TEXTENCODING_ISO_8859_2, E.RTL_TEXTENCODING_MS_1250],
    [E.RTL_TEXTENCODING_ISO_8859_15, E.RTL_TEXTENCODING_MS_1252],
  ] as const)
    expect(GetExtendedTextEncoding(input)).toBe(output);
  expect(GetExtendedTextEncoding(E.RTL_TEXTENCODING_ISO_8859_1)).toBe(E.RTL_TEXTENCODING_MS_1252);
  expect(GetExtendedTextEncoding(0)).toBe(0);
  expect(GetExtendedCompatibilityTextEncoding(65536 + E.RTL_TEXTENCODING_MS_1253)).toBe(
    E.RTL_TEXTENCODING_MS_1253,
  );
  const before = new IfBeforeStart(0);
  expect(before.test(new CharRunEntry(-1, S.LATIN, 0, false))).toBe(true);
  expect(before.test(new CharRunEntry(0, S.LATIN, 0, false))).toBe(false);
  expect(new CharRunEntry(1, 65537, 65538, false)).toEqual({
    mnEndPos: 1,
    mnScript: 1,
    meCharSet: 2,
    mbRTL: false,
  });
});
