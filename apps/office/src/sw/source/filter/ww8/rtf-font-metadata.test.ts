/** @fileoverview Pinned RTF font metadata losses: family flags are not forwarded, pitch is ignored and charset belongs to decoding rather than document font items. */
import { assert, expect, it } from "vitest";
import { RtfDocumentImpl } from "../../writerfilter/rtftok/rtfdocumentimpl";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import * as H from "../../../inc/hintids";
/** Actual script font selectors in the consumed RTF reader. */
const scripts = [
  ["loch", H.RES_CHRATR_FONT],
  ["dbch", H.RES_CHRATR_CJK_FONT],
  ["rtlch", H.RES_CHRATR_CTL_FONT],
] as const;
/** Imports a real table and compares all represented native metadata fields to the original script default. @param metadata - Original RTF font table controls. @param selector - Native script selector. @param which - Actual font identity. @returns Nothing. */
function check(metadata: string, selector: string, which: number): void {
  const content =
    String.raw`{\rtf1\ansi{\fonttbl{\f0` +
    metadata +
    String.raw` MetadataFont;}}` +
    "\\" +
    selector +
    String.raw`\f0 x\par}`;
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(content));
  try {
    const node = doc.paragraphs[0];
    assert(node);
    const set = new SfxItemSet(doc.GetAttrPool(), H.WRITER_CHARACTER_WHICH_RANGES);
    try {
      node.GetParaAttr(set, 0, node.Len());
      const selected = set.Get(which),
        fallback = doc.GetAttrPool().GetUserOrPoolDefaultItem(which);
      assert(selected instanceof SvxFontItem);
      assert(fallback instanceof SvxFontItem);
      expect(selected.GetFamilyName()).toBe("MetadataFont");
      expect(selected.GetFamily()).toBe(fallback.GetFamily());
      expect(selected.GetPitch()).toBe(fallback.GetPitch());
      expect(selected.GetCharSet()).toBe(fallback.GetCharSet());
      expect(selected.GetStyleName()).toBe(fallback.GetStyleName());
    } finally {
      set.Dispose();
    }
  } finally {
    doc.Dispose();
  }
}
for (const [selector, which] of scripts) {
  for (const family of [
    "fnil",
    "froman",
    "fswiss",
    "fmodern",
    "fscript",
    "fdecor",
    "ftech",
    "fbidi",
  ])
    it(`preserves upstream ignored ${family} metadata in ${selector}`, /** Native dispatchFlag intentionally breaks without emitting CT_Font_family. @returns Nothing. */ () =>
      check("\\" + family, selector, which));
  for (const pitch of [0, 1, 2])
    it(`preserves upstream ignored pitch ${pitch} in ${selector}`, /** FPRQ emits CT_Font_pitch but FontTable's pitch handler performs no assignment. @returns Nothing. */ () =>
      check("\\fprq" + pitch, selector, which));
  for (const charset of [
    0, 1, 2, 77, 128, 129, 134, 136, 161, 162, 163, 177, 178, 186, 204, 222, 238, 255,
  ])
    it(`retains decoder-only charset ${charset} in ${selector}`, /** RTF FCHARSET deliberately sends no FontTable charset attribute, unlike the OOXML path. @returns Nothing. */ () =>
      check("\\fcharset" + charset, selector, which));
}
