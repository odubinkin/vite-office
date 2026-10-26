/** @fileoverview Source MoveProperties family order, language association, mode/state lifetime and actual native item emission. */
import { assert, expect, it } from "vitest";
import {
  RtfAssociatedProperties,
  GetCharacterPropertiesMode as M,
} from "./rtfattributeoutput.assoc";
import { RtfAttributeOutput } from "./rtfattributeoutput";
import { RtfExport } from "./rtfexport";
import { SwDoc } from "../../core/doc/doc";
import { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SvxPostureItem } from "../../../../editeng/inc/postitem";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { SvxUnderlineItem } from "../../../../editeng/source/items/textitem";
import { SvxWordLineModeItem } from "../../../../editeng/inc/wrlmitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import {
  FontItalic,
  FontWeight,
  FontLineStyle,
  FontFamily,
  FontPitch,
} from "../../../../tools/inc/fontenum";
import { SwFormatCharFormat } from "../../core/txtnode/fmtatr2";
import * as H from "../../../inc/hintids";
import * as S from "../../../../offapi/com/sun/star/i18n/ScriptType";
/** Actual sparse native set. @param doc - Pool owner. @returns Native set. */
function items(doc: SwDoc): SfxItemSet {
  return new SfxItemSet(doc.GetAttrPool(), H.WRITER_CHARACTER_WHICH_RANGES);
}
/** Static source outcomes for Western/CJK/CTL language membership masks. No writer helper produces expected controls. */
const fixtures = [
  [0, "", "\\loch\\hich\\dbch", "\\ltrch\\rtlch"],
  [1, "\\lang1033", "\\loch\\alang1033\\hich\\alang1033\\dbch", "\\ltrch\\alang1033\\rtlch"],
  [
    2,
    "\\hich\\dbch\\langfe1041\\loch",
    "\\loch\\hich\\dbch\\langfe1041",
    "\\ltrch\\hich\\dbch\\langfe1041\\loch\\rtlch",
  ],
  [
    3,
    "\\hich\\alang1033\\dbch\\langfe1041\\loch\\lang1033",
    "\\loch\\alang1033\\hich\\alang1033\\dbch\\langfe1041",
    "\\ltrch\\hich\\alang1033\\dbch\\langfe1041\\loch\\alang1033\\rtlch",
  ],
  [
    4,
    "\\rtlch\\alang1025\\ltrch",
    "\\rtlch\\alang1025\\ltrch\\loch\\hich\\dbch",
    "\\ltrch\\rtlch\\lang1025",
  ],
  [
    5,
    "\\rtlch\\alang1025\\ltrch\\lang1033",
    "\\rtlch\\alang1025\\ltrch\\loch\\alang1033\\hich\\alang1033\\dbch",
    "\\ltrch\\alang1033\\rtlch\\lang1025",
  ],
  [
    6,
    "\\rtlch\\alang1025\\ltrch\\hich\\dbch\\langfe1041\\loch",
    "\\rtlch\\alang1025\\ltrch\\loch\\hich\\dbch\\langfe1041",
    "\\ltrch\\hich\\dbch\\langfe1041\\loch\\rtlch\\lang1025",
  ],
  [
    7,
    "\\rtlch\\alang1025\\ltrch\\hich\\alang1033\\dbch\\langfe1041\\loch\\lang1033",
    "\\rtlch\\alang1025\\ltrch\\loch\\alang1033\\hich\\alang1033\\dbch\\langfe1041",
    "\\ltrch\\hich\\alang1033\\dbch\\langfe1041\\loch\\alang1033\\rtlch\\lang1025",
  ],
] as const;
it.each(fixtures)(
  "preserves all source mode orders for membership %s",
  /** Checks literal original group results and one-shot state behavior. @param mask - Actual item membership. @param western - Style/Latin/non-RTL complex result. @param asian - Asian run. @param rtl - RTL run. @returns Nothing. */ (
    mask,
    western,
    asian,
    rtl,
  ) => {
    const doc = new SwDoc();
    try {
      const set = items(doc);
      for (const [bit, which, value] of [
        [4, H.RES_CHRATR_CTL_LANGUAGE, 1025],
        [2, H.RES_CHRATR_CJK_LANGUAGE, 1041],
        [1, H.RES_CHRATR_LANGUAGE, 1033],
      ] as const)
        if (mask & bit) set.Put(new SvxLanguageItem(value, which));
      const owner = new RtfAssociatedProperties(/** Unused font sink. @returns Slot. */ () => "");
      expect(owner.MoveProperties(set, M.StyleDefinition)).toBe(western);
      expect(owner.MoveProperties(set, M.ForRun)).toBe(western);
      owner.RTLAndCJKState(false, S.ASIAN);
      // StyleDefinition does not consume the run's pending state.
      expect(owner.MoveProperties(set, M.StyleDefinition)).toBe(western);
      expect(owner.MoveProperties(set, M.ForRun)).toBe(asian);
      expect(owner.MoveProperties(set, M.ForRun)).toBe(western);
      owner.RTLAndCJKState(true, S.LATIN);
      expect(owner.MoveProperties(set, M.ForRun)).toBe(rtl);
      owner.RTLAndCJKState(false, S.COMPLEX);
      // Original non-RTL COMPLEX path deliberately selects Western, per its source FIXME.
      expect(owner.MoveProperties(set, M.ForRun)).toBe(western);
      expect(set.Count()).toBe((mask & 1 ? 1 : 0) + (mask & 2 ? 1 : 0) + (mask & 4 ? 1 : 0));
    } finally {
      doc.Dispose();
    }
  },
);
it("does not accidentally pull family items from the formatting parent", /** Native group traversal is shallow, unlike the ancillary word mode lookup. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const parent = items(doc),
      set = items(doc);
    parent.Put(new SvxLanguageItem(1033, H.RES_CHRATR_LANGUAGE));
    set.SetParent(parent);
    expect(
      new RtfAssociatedProperties(/** Unused font sink. @returns Slot. */ () => "").MoveProperties(
        set,
        M.StyleDefinition,
      ),
    ).toBe("");
  } finally {
    doc.Dispose();
  }
});
it("uses fixed native item order, exact weight reduction and unsigned language values", /** Reversed Put order must not determine source group order. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const set = items(doc);
    set.Put(new SvxWeightItem(FontWeight.WEIGHT_SEMIBOLD, H.RES_CHRATR_WEIGHT));
    set.Put(new SvxUnderlineItem(FontLineStyle.LINESTYLE_SINGLE, H.RES_CHRATR_UNDERLINE));
    set.Put(new SvxWordLineModeItem(true, H.RES_CHRATR_WORDLINEMODE));
    set.Put(new SvxPostureItem(FontItalic.ITALIC_OBLIQUE, H.RES_CHRATR_POSTURE));
    set.Put(new SvxLanguageItem(0xffff, H.RES_CHRATR_LANGUAGE));
    set.Put(new SvxFontHeightItem(245, 100, H.RES_CHRATR_FONTSIZE));
    set.Put(
      new SvxFontItem(
        FontFamily.FAMILY_SWISS,
        "Native",
        "",
        FontPitch.PITCH_VARIABLE,
        0,
        H.RES_CHRATR_FONT,
      ),
    );
    const owner = new RtfAssociatedProperties(
      /** Fixed actual table slot. @param family - Value. @returns Slot. */ (family) => {
        expect(family.GetFamilyName()).toBe("Native");
        return "\\f7";
      },
    );
    expect(owner.MoveProperties(set, M.StyleDefinition)).toBe("\\f7\\fs24\\lang65535\\i\\ulw\\b0");
  } finally {
    doc.Dispose();
  }
});
it("exports named-style CJK/CTL fonts and languages through the actual native hint iterator", /** Tests font registration before serialization and exact named style value precedence. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  try {
    node.SetText("Native");
    const named = doc.MakeCharFormat("Script values", doc.GetDfltCharFormat());
    const set = items(doc);
    set.Put(new SvxLanguageItem(1033, H.RES_CHRATR_LANGUAGE));
    set.Put(new SvxLanguageItem(1041, H.RES_CHRATR_CJK_LANGUAGE));
    set.Put(new SvxLanguageItem(1025, H.RES_CHRATR_CTL_LANGUAGE));
    set.Put(
      new SvxFontItem(
        FontFamily.FAMILY_SWISS,
        "Asian Script Font",
        "",
        FontPitch.PITCH_VARIABLE,
        0,
        H.RES_CHRATR_CJK_FONT,
      ),
    );
    set.Put(
      new SvxFontItem(
        FontFamily.FAMILY_ROMAN,
        "Complex Script Font",
        "",
        FontPitch.PITCH_VARIABLE,
        0,
        H.RES_CHRATR_CTL_FONT,
      ),
    );
    named.SetFormatAttrSet(set);
    node.InsertItem(new SwFormatCharFormat(named), 0, node.Len());
    const rtf = new TextDecoder().decode(new RtfExport().ExportDocument(doc));
    expect(rtf).toContain("Asian Script Font;");
    expect(rtf).toContain("Complex Script Font;");
    expect(rtf).toContain(
      "\\rtlch\\af1\\alang1025\\ltrch\\hich\\alang1033\\dbch\\af0\\langfe1041\\loch\\lang1033 Native",
    );
    const output = new RtfAttributeOutput(
      /** Current font sink. @returns Slot. */ () => 0,
      /** Current color sink. @returns Slot. */ () => 0,
      new RtfExport(),
    );
    output.RTLAndCJKState(true, S.COMPLEX);
    expect(output.WriteNativeCharacter(set, M.ForRun).endsWith("\\rtlch\\f0\\lang1025")).toBe(true);
  } finally {
    doc.Dispose();
  }
});

it("borrows word-line mode from the ancillary parent while excluding its language family", /** Native family traversal stays shallow while underline's word-mode lookup searches parents. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const parent = items(doc),
      set = items(doc);
    parent.Put(new SvxLanguageItem(1033, H.RES_CHRATR_LANGUAGE));
    parent.Put(new SvxWordLineModeItem(true, H.RES_CHRATR_WORDLINEMODE));
    set.SetParent(parent);
    set.Put(new SvxUnderlineItem(FontLineStyle.LINESTYLE_SINGLE, H.RES_CHRATR_UNDERLINE));
    const owner = new RtfAssociatedProperties(/** Unused font sink. @returns Slot. */ () => "");
    expect(owner.MoveProperties(set, M.StyleDefinition)).toBe("\\ulw");
    owner.RTLAndCJKState(false, S.ASIAN);
    expect(owner.MoveProperties(set, M.ForRun)).toBe("\\loch\\aulw\\hich\\aulw\\dbch");
  } finally {
    doc.Dispose();
  }
});
