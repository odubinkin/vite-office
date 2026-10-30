/** @fileoverview Actual RTF associated controls select native script items, preserve decoding, defaults and document ownership. */
import { afterEach, assert, expect, it } from "vitest";
import { RtfDocumentImpl } from "./rtfdocumentimpl";
import { RtfExport } from "../../filter/ww8/rtfexport";
import type { SwDoc } from "../../core/doc/doc";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { SvxPostureItem } from "../../../../editeng/inc/postitem";
import { FontWeight, FontItalic } from "../../../../tools/inc/fontenum";
import * as H from "../../../inc/hintids";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
const documents: SwDoc[] = [];
afterEach(
  /** Disposes actual document owners. @returns Nothing. */ () => {
    for (const doc of documents.splice(0)) doc.Dispose();
  },
);
/** Imports literal RTF with actual font table entries. @param content - Body controls. @returns Owned document. */
function read(content: string): SwDoc {
  const doc = new RtfDocumentImpl().ResolveBytes(
    new TextEncoder().encode(
      String.raw`{\rtf1\ansi\ansicpg1252\deff0{\fonttbl{\f0\fcharset0 Western;}{\f1\fcharset204 Cyrillic;}{\f2\fcharset128 Asian;}{\f3\fcharset178 Complex;}}` +
        content +
        "}",
    ),
  );
  documents.push(doc);
  return doc;
}
/** Queries a visible character range, independently of the insertion caret's left-boundary inheritance. @param node - Actual text node. @param offset - Character index. @returns Owned native item set. */
function characterItems(node: SwTextNode, offset: number): SfxItemSet {
  const set = new SfxItemSet(node.GetDoc().GetAttrPool(), H.WRITER_CHARACTER_WHICH_RANGES);
  node.GetParaAttr(set, offset, offset + 1);
  return set;
}
/** Reads actual native font family at a visible position. @param doc - Document. @param which - Script item. @param offset - Character position. @returns Family. */
function family(doc: SwDoc, which: number, offset = 0): string {
  const node = doc.paragraphs[0];
  assert(node);
  const set = characterItems(node, offset);
  try {
    const item = set.Get(which);
    assert(item instanceof SvxFontItem);
    return item.GetFamilyName();
  } finally {
    set.Dispose();
  }
}
/** Original native run types and separate font-versus-size/toggle decisions, including HICH's asymmetric choice. */
const runs = [
  ["", H.RES_CHRATR_FONT, false],
  [String.raw`\loch`, H.RES_CHRATR_FONT, false],
  [String.raw`\hich`, H.RES_CHRATR_FONT, true],
  [String.raw`\dbch`, H.RES_CHRATR_CJK_FONT, false],
  [String.raw`\ltrch`, H.RES_CHRATR_FONT, false],
  [String.raw`\ltrch\rtlch`, H.RES_CHRATR_CTL_FONT, true],
  [String.raw`\rtlch`, H.RES_CHRATR_CTL_FONT, true],
  [String.raw`\rtlch\ltrch`, H.RES_CHRATR_FONT, false],
] as const;
for (const [run, which, complex] of runs) {
  for (const control of ["f", "af"])
    it(`routes ${run} ${control} to native font ${which}`, /** Source F and AF share the script selector; AF does not imply CTL. @returns Nothing. */ () => {
      const doc = read(run + "\\" + control + "1 x");
      expect(family(doc, which)).toBe("Cyrillic");
      if (which !== H.RES_CHRATR_FONT) expect(family(doc, H.RES_CHRATR_FONT)).toBe("Western");
    });
  for (const control of ["fs", "afs"])
    it(`routes ${run} ${control} to ${complex ? "complex" : "western/asian"} size`, /** Source DBCH uses ordinary sz while HICH uses szCs. @returns Nothing. */ () => {
      const doc = read(run + "\\" + control + "34 x"),
        node = doc.paragraphs[0];
      assert(node);
      const set = characterItems(node, 0);
      try {
        const height = set.Get(complex ? H.RES_CHRATR_CTL_FONTSIZE : H.RES_CHRATR_FONTSIZE);
        assert(height instanceof SvxFontHeightItem);
        expect(height.GetHeight()).toBe(340);
        if (!complex) {
          const asian = set.Get(H.RES_CHRATR_CJK_FONTSIZE);
          assert(asian instanceof SvxFontHeightItem);
          expect(asian.GetHeight()).toBe(340);
        }
      } finally {
        set.Dispose();
      }
    });
  for (const [bold, italic] of [
    ["b", "i"],
    ["ab", "ai"],
  ])
    it(`routes ${run} ${bold}/${italic} to native script toggles`, /** Associated prefixes retain the same run-type decision. Explicit zero must overwrite one. @returns Nothing. */ () => {
      const doc = read(run + "\\" + bold + "\\" + italic + " X\\" + bold + "0\\" + italic + "0 Y"),
        node = doc.paragraphs[0];
      assert(node);
      for (const [offset, on] of [
        [0, true],
        [1, false],
      ] as const) {
        const set = characterItems(node, offset);
        try {
          const weight = set.Get(complex ? H.RES_CHRATR_CTL_WEIGHT : H.RES_CHRATR_WEIGHT),
            posture = set.Get(complex ? H.RES_CHRATR_CTL_POSTURE : H.RES_CHRATR_POSTURE);
          assert(weight instanceof SvxWeightItem);
          assert(posture instanceof SvxPostureItem);
          expect(weight.GetWeight()).toBe(on ? FontWeight.WEIGHT_BOLD : FontWeight.WEIGHT_NORMAL);
          expect(posture.GetPosture()).toBe(on ? FontItalic.ITALIC_NORMAL : FontItalic.ITALIC_NONE);
        } finally {
          set.Dispose();
        }
      }
    });
}
it("seeds the default font across saved groups and restores it with plain", /** First text in a child group initializes the outer state without replacing an explicit font. @returns Nothing. */ () => {
  const doc = read(String.raw`{\f1 B}A{\f2 C\plain D}E`);
  expect(doc.paragraphs[0]?.GetText()).toBe("BACDE");
  expect(
    [0, 1, 2, 3, 4].map(
      /** Reads actual visible font. @param offset - Position. @returns Family. */ (offset) =>
        family(doc, H.RES_CHRATR_FONT, offset),
    ),
  ).toEqual(["Cyrillic", "Western", "Asian", "Western", "Western"]);
});
it("keeps AF out of byte decoding and restores F encoding at group close", /** Hex E9 is Cyrillic й in1251 and é in1252; only F changes current encoding. @returns Nothing. */ () => {
  const doc = read(String.raw`\f0\hich\af1\'e9{\f1\'e9}\'e9`);
  expect(doc.paragraphs[0]?.GetText()).toBe("éйé");
});
it("uses native missing size defaults for both ordinary and associated controls", /** FS/AFS bare defaults are24 half-points in the pinned tokenizer. @returns Nothing. */ () => {
  const doc = read(String.raw`\fs X\hich\afs Y`),
    node = doc.paragraphs[0];
  assert(node);
  const set = characterItems(node, 1);
  try {
    const size = set.Get(H.RES_CHRATR_CTL_FONTSIZE);
    assert(size instanceof SvxFontHeightItem);
    expect(size.GetHeight()).toBe(240);
  } finally {
    set.Dispose();
  }
});
it("retains three font slots through actual styles, marker, Worker and mixed-script RTF export", /** Full native owners exercise the associated producer and consumer together. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\stylesheet{\s1\loch\f1\dbch\af2\rtlch\af3 Scripted;}}\s1\loch\f1\dbch\af2\rtlch\af3 A\u20013?\u1593?\par`,
  );
  for (const current of [doc, decodeWriterDocument(structuredClone(encodeWriterDocument(doc)))]) {
    if (current !== doc) documents.push(current);
    const restored = new RtfDocumentImpl().ResolveBytes(RtfExport.WriteDocument(current));
    documents.push(restored);
    expect(restored.paragraphs[0]?.GetText()).toBe("A中ع");
    expect(family(restored, H.RES_CHRATR_FONT, 0)).toBe("Cyrillic");
    expect(family(restored, H.RES_CHRATR_CJK_FONT, 1)).toBe("Asian");
    expect(family(restored, H.RES_CHRATR_CTL_FONT, 2)).toBe("Complex");
  }
});

for (const keyword of ["f", "af"])
  it(`uses the native missing ${keyword} default in an ungrouped font table`, /** Numeric value controls default to zero even after a different table index. @returns Nothing. */ () => {
    const doc = new RtfDocumentImpl().ResolveBytes(
      new TextEncoder().encode(
        String.raw`{\rtf1\deff0{\fonttbl\f5 Other;` +
          String.fromCharCode(92) +
          keyword +
          String.raw` BareDefault;}\f0 X}`,
      ),
    );
    documents.push(doc);
    expect(family(doc, H.RES_CHRATR_FONT)).toBe("BareDefault");
  });
