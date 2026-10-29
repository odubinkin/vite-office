/** @fileoverview Original semantic HTML style ownership and script-suffix views through real Writer parser, pool and CSS maps. */
import { expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwHTMLParser } from "./swhtml";
import { SwCSS1Parser } from "./htmlcss1";
import { Css1ScriptFlags as F, SvxCSS1PropertyInfo } from "./svxcss1.types";
import { HtmlTokenId as T } from "../../../../svtools/inc/htmltokn";
import { SvStream } from "../../../../tools/source/stream/stream";
import { OUStringToOString } from "../../../../sal/rtl/ustring-convert";
import { RTL_TEXTENCODING_UTF8 as UTF8 } from "../../../../sal/inc/rtl/textenc";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { RES_CHRATR_COLOR, RES_CHRATR_FONTSIZE } from "../../../inc/hintids";
import type { SvxColorItem } from "../../../../editeng/inc/colritem";
import type { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";

/** Owns a genuine HTML reader and existing Writer cursor. @param check - Reads actual CSS/document owners. @returns Nothing. */
function withParser(check: (doc: SwDoc, css: SwCSS1Parser) => void): void {
  const doc = new SwDoc(),
    position = new SwPosition(doc.paragraphs[0]!),
    cursor = new SwPaM(position);
  position.Dispose();
  const reader = new SwHTMLParser(doc, cursor, new SvStream(OUStringToOString("", UTF8), UTF8));
  try {
    check(doc, reader.m_pCSS1Parser);
  } finally {
    reader.SourceDispose();
    cursor.Dispose();
    doc.Dispose();
  }
}

it.each([
  [T.SHORTQUOTE_ON, "q"],
  [T.LANGUAGE_ON, "lang"],
  [T.AUTHOR_ON, "au"],
  [T.PERSON_ON, "person"],
  [T.ACRONYM_ON, "acronym"],
  [T.ABBREVIATION_ON, "abbrev"],
  [T.INSERTEDTEXT_ON, "ins"],
  [T.DELETEDTEXT_ON, "del"],
] as const)(
  "materializes original semantic tag %i as document style %s",
  /** Unmapped named HTML styles use native document registration and borrowed identity. @param token - Original tag. @param name - Original style name. @returns Nothing. */ (
    token,
    name,
  ) => {
    withParser(
      /** Checks actual document ownership and reuse. @param doc - Document. @param css - Parser. @returns Nothing. */ (
        doc,
        css,
      ) => {
        const format = css.GetChrFormat(token, "");
        expect(format?.GetName()).toBe(name);
        expect(format?.DerivedFrom()).toBe(doc.GetDfltCharFormat());
        expect(format?.IsAuto()).toBe(false);
        expect(css.GetChrFormat(token, "")).toBe(format);
        expect(doc.FindCharFormatByName(name)).toBe(format);
      },
    );
  },
);

it("creates one class descendant from the real semantic base while preserving its source CSS entry", /** Percent font heights are removed from the cloned character set without mutating the class map. @returns Nothing. */ () => {
  withParser(
    /** Uses original class registration and native pooled properties. @param doc - Document. @param css - Parser. @returns Nothing. */ (
      doc,
      css,
    ) => {
      const items = new SfxItemSet(doc.GetAttrPool(), css.GetWhichMap()),
        info = new SvxCSS1PropertyInfo();
      try {
        css.ParseStyleOption("color: #123456; font-size: 150%", items, info);
        css.InsertClass("sample", items, info);
        const base = css.GetChrFormat(T.STRONG_ON, "")!,
          child = css.GetChrFormat(T.STRONG_ON, "sample-western")!;
        expect(child).not.toBe(base);
        expect(child.GetName()).toBe(base.GetName() + ".sample");
        expect(child.DerivedFrom()).toBe(base);
        expect(child.IsAuto()).toBe(false);
        expect(
          (child.GetAttrSet().Get(RES_CHRATR_COLOR) as SvxColorItem).GetValue().toUInt32(),
        ).toBe(0x123456);
        expect(child.GetAttrSet().GetItemIfSet(RES_CHRATR_FONTSIZE, false)).toBeUndefined();
        expect(
          (
            css.GetClass("sample")!.GetItemSet().Get(RES_CHRATR_FONTSIZE) as SvxFontHeightItem
          ).GetProp(),
        ).toBe(150);
        expect(css.GetChrFormat(T.STRONG_ON, "sample-cjk")).toBe(child);
        expect(css.GetChrFormat(T.STRONG_ON, "unregistered")).toBe(base);
        expect(css.GetChrFormat(T.PARABREAK_ON, "sample")).toBeUndefined();
      } finally {
        items.Dispose();
      }
    },
  );
});

it.each([
  ["cjk", false, "", F.CJK],
  ["western", false, "", F.Western],
  ["ctl", false, "", F.CTL],
  ["cjk", true, "cjk", F.AllMask],
  ["title-western", true, "title", F.Western],
  ["title-CjK", true, "title", F.CJK],
  ["title-ctl", true, "title", F.CTL],
  ["title-other", true, "title-other", F.AllMask],
  ["x", false, "x", F.AllMask],
  ["", false, "", F.AllMask],
  ["x-western-cjk", true, "x-western", F.CJK],
] as const)(
  "retains original script suffix for %s with subclass-only %s",
  /** Only the last ASCII-folded known suffix is stripped. @param value - Class. @param subclassOnly - Native selector. @param name - Preserved class. @param flags - Script flags. @returns Nothing. */ (
    value,
    subclassOnly,
    name,
    flags,
  ) => {
    expect(SwCSS1Parser.GetScriptFromClass(value, subclassOnly)).toEqual([name, flags]);
  },
);

it.each(["a:link", "a:visited"])(
  "applies standalone %s map without a common A entry",
  /** Original optional pool owners are materialized independently and link flags record only actual color declarations. @param tag - Native tag. @returns Nothing. */ (
    tag,
  ) => {
    withParser(
      /** Inserts a real map entry. @param doc - Document. @param css - Parser. @returns Nothing. */ (
        doc,
        css,
      ) => {
        const items = new SfxItemSet(doc.GetAttrPool(), css.GetWhichMap()),
          info = new SvxCSS1PropertyInfo();
        try {
          css.ParseStyleOption("color: #123456", items, info);
          css.InsertTag(tag, items, info);
          css.SetATagStyles();
          expect(css.IsBodyLinkSet()).toBe(tag === "a:link");
          expect(css.IsBodyVLinkSet()).toBe(tag === "a:visited");
          css.SetATagStyles();
          expect(css.GetFontHeight(7)).toBe(720);
        } finally {
          items.Dispose();
        }
      },
    );
  },
);
