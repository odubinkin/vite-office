/** @fileoverview Native delayed TD/TH style cascade consumes actual CSS map entries, pooled paragraph styles and original margin/font/break decisions. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwHTMLParser } from "./swhtml";
import { SvStream } from "../../../../tools/source/stream/stream";
import { RTL_TEXTENCODING_UTF8 as UTF8 } from "../../../../sal/inc/rtl/textenc";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxCSS1PropertyInfo } from "./svxcss1.types";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
import * as H from "../../../inc/hintids";
/** Runs actual parser/CSS/document lifetimes. @param check - Source observations. @returns Nothing. */
function inspect(check: (parser: SwHTMLParser, doc: SwDoc) => void): void {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  const point = new SwPosition(node),
    pam = new SwPaM(point);
  point.Dispose();
  const parser = new SwHTMLParser(doc, pam, new SvStream(new Uint8Array(), UTF8));
  try {
    check(parser, doc);
  } finally {
    parser.SourceDispose();
    pam.Dispose();
    doc.Dispose();
  }
}
/** Inserts a real parsed declaration set through the original public CSS map operation. @param parser - Actual receiver owner. @param tag - Native selector key. @param declaration - Original CSS tokens. @returns Nothing. */
function entry(parser: SwHTMLParser, tag: string, declaration: string): void {
  const css = parser.m_pCSS1Parser,
    set = new SfxItemSet(parser.m_xDoc.GetAttrPool(), css.GetWhichMap()),
    info = new SvxCSS1PropertyInfo();
  try {
    css.ParseStyleOption(declaration, set, info);
    css.InsertTag(tag, set, info);
  } finally {
    set.Dispose();
  }
}
it.each([false, true])(
  "applies the native %s table cascade in tag-then-paragraph order",
  /** Source consumes both exact map keys without rewriting unrelated tags. @param header - TH selector. @returns Nothing. */ (
    header,
  ) => {
    inspect(
      /** Observes actual pooled collection values. @param parser - Receiver. @returns Nothing. */ (
        parser,
      ) => {
        const tag = header ? "th" : "td",
          pool = header ? P.COLL_TABLE_HDLN : P.COLL_TABLE;
        entry(parser, tag, "font-weight:bold; margin-top:3pt; margin-bottom:7pt");
        entry(parser, tag + " p", "font-weight:normal; margin-bottom:11pt");
        const css = parser.m_pCSS1Parser;
        if (header) css.SetTHTagStyles();
        else css.SetTDTagStyles();
        const coll = css.GetTextCollFromPool(pool);
        expect(coll.id).toBe(header ? "table-heading" : "table-contents");
        expect((coll.GetAttrSet().Get(H.RES_CHRATR_WEIGHT) as SvxWeightItem).GetBoolValue()).toBe(
          false,
        );
        expect([coll.GetULSpace().GetUpper(), coll.GetULSpace().GetLower()]).toEqual([60, 220]);
        const consumed = css
          .GetTag(tag + " p")
          ?.GetItemSet()
          .GetItemIfSet(H.RES_UL_SPACE, false);
        assert(consumed instanceof SvxULSpaceItem);
        expect([consumed.GetUpper(), consumed.GetLower()]).toEqual([60, 220]);
      },
    );
  },
);
it("retains one-time completion even when the first call finds no TD entry", /** Adding a real tag later does not invalidate the original source completion flag (WRITER321). @returns Nothing. */ () => {
  inspect(
    /** Uses only original public map and style operations. @param parser - Actual parser. @param doc - Actual graph. @returns Nothing. */ (
      parser,
      doc,
    ) => {
      const css = parser.m_pCSS1Parser;
      expect(
        doc
          .GetTextFormatColls()
          .some(
            /** Matches actual source metadata. @param coll - Collection. @returns Whether table body. */ (
              coll,
            ) => coll.id === "table-contents",
          ),
      ).toBe(false);
      css.SetTDTagStyles();
      expect(
        doc
          .GetTextFormatColls()
          .some(
            /** Matches actual source metadata. @param coll - Collection. @returns Whether table body. */ (
              coll,
            ) => coll.id === "table-contents",
          ),
      ).toBe(false);
      entry(parser, "td", "font-weight:bold");
      css.SetTDTagStyles();
      expect(
        (
          css
            .GetTextCollFromPool(P.COLL_TABLE)
            .GetAttrSet()
            .Get(H.RES_CHRATR_WEIGHT) as SvxWeightItem
        ).GetBoolValue(),
      ).toBe(false);
    },
  );
});
it("does not reapply consumed tag entries after the first table-style cascade", /** Existing map contents can change independently of the source completion guard. @returns Nothing. */ () => {
  inspect(
    /** Mutates declarations through native parsing/map insertion. @param parser - Actual receiver. @returns Nothing. */ (
      parser,
    ) => {
      const css = parser.m_pCSS1Parser;
      entry(parser, "th", "font-weight:normal");
      css.SetTHTagStyles();
      entry(parser, "th", "font-weight:bold");
      css.SetTHTagStyles();
      expect(
        (
          css
            .GetTextCollFromPool(P.COLL_TABLE_HDLN)
            .GetAttrSet()
            .Get(H.RES_CHRATR_WEIGHT) as SvxWeightItem
        ).GetBoolValue(),
      ).toBe(false);
    },
  );
});
it("drops proportional font heights from all three consumed native script slots", /** Real pooled items reach the original unsupported-percentage branch; no effective browser font projection is used. @returns Nothing. */ () => {
  inspect(
    /** Uses original map insertion for the represented item values. @param parser - Actual receiver. @param doc - Native pool. @returns Nothing. */ (
      parser,
      doc,
    ) => {
      const css = parser.m_pCSS1Parser,
        set = new SfxItemSet(doc.GetAttrPool(), css.GetWhichMap());
      try {
        for (const which of [
          H.RES_CHRATR_FONTSIZE,
          H.RES_CHRATR_CJK_FONTSIZE,
          H.RES_CHRATR_CTL_FONTSIZE,
        ])
          set.Put(new SvxFontHeightItem(500, 150, which));
        css.InsertTag("td", set, new SvxCSS1PropertyInfo());
        css.SetTDTagStyles();
        for (const which of [
          H.RES_CHRATR_FONTSIZE,
          H.RES_CHRATR_CJK_FONTSIZE,
          H.RES_CHRATR_CTL_FONTSIZE,
        ]) {
          expect(css.GetTag("td")?.GetItemSet().GetItemIfSet(which, false)).toBeUndefined();
          expect(
            css.GetTextCollFromPool(P.COLL_TABLE).GetAttrSet().GetItemIfSet(which, false),
          ).toBeUndefined();
        }
      } finally {
        set.Dispose();
      }
    },
  );
});
it("runs delayed table styles from the genuine terminal HTML parser path", /** No consumer method or private parser state is replaced to force terminal publication. @returns Nothing. */ () => {
  inspect(
    /** Calls the actual empty byte stream pipeline with real tag entries. @param parser - Actual importer. @param doc - Actual graph. @returns Nothing. */ (
      parser,
      doc,
    ) => {
      entry(parser, "td", "font-weight:bold");
      entry(parser, "th p", "font-weight:normal");
      parser.CallParser();
      expect(
        (
          doc
            .GetTextFormatColl("table-contents")
            .GetAttrSet()
            .Get(H.RES_CHRATR_WEIGHT) as SvxWeightItem
        ).GetBoolValue(),
      ).toBe(true);
      expect(
        (
          doc
            .GetTextFormatColl("table-heading")
            .GetAttrSet()
            .Get(H.RES_CHRATR_WEIGHT) as SvxWeightItem
        ).GetBoolValue(),
      ).toBe(false);
    },
  );
});
