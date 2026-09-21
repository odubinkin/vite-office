/**
 * @fileoverview Source-derived paragraph-style defaults from pinned LibreOffice
 * `sw/source/core/doc/DocumentStylePoolManager.cxx`.
 */

import {
  SvxAdjust,
  SvxAdjustItem,
  SvxFirstLineIndentItem,
  SvxLineSpacingItem,
  SvxRightMarginItem,
  SvxTextLeftMarginItem,
  SvxULSpaceItem,
} from "../../../../editeng/source/items/paraitem";
import {
  FontItalic,
  FontWeight,
  SvxFontHeightItem,
  SvxFontItem,
  SvxPostureItem,
  SvxWeightItem,
} from "../../../../editeng/source/items/textitem";
import {
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CJK_POSTURE,
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_CTL_FONTSIZE,
  RES_CHRATR_CTL_POSTURE,
  RES_CHRATR_CTL_WEIGHT,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_POSTURE,
  RES_CHRATR_WEIGHT,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_ADJUST,
  RES_PARATR_LINESPACING,
  RES_UL_SPACE,
} from "../../../inc/hintids";
import { getDefaultFontSelection, getWriterDefaultFontLanguage } from "./default-font";
import type { SwTextFormatColl } from "./fmtcol";

/** Direct item values created by one upstream pool-style switch branch. */
export interface WriterParagraphStyleDefaults {
  readonly adjust?: SvxAdjust;
  readonly bold?: true;
  readonly firstLineTwips?: number;
  readonly fontRole?: "fixed" | "heading" | "text";
  readonly fontSizeTwips?: number;
  readonly italic?: true;
  readonly lineHeightPercent?: number;
  readonly lowerTwips?: number;
  readonly rightTwips?: number;
  readonly textLeftTwips?: number;
  readonly upperTwips?: number;
}

const headingSizes = [18, 16, 14, 13, 12, 12, 10, 10, 9, 9].map(
  /** Converts points to twips. @param points - Font size. @returns Twips. */ (points) =>
    points * 20,
);
const headingSpacing = [
  [12, 6],
  [10, 6],
  [7, 6],
  [6, 6],
  [6, 3],
  [3, 3],
  [3, 3],
  [3, 3],
  [3, 3],
  [3, 3],
] as const;

/** Returns the direct defaults implemented for one built-in paragraph style. @param id - Pool style identity. @returns Immutable source-derived values. */
export function getWriterParagraphStyleDefaults(id: string): WriterParagraphStyleDefaults {
  const heading = /^heading-(10|[1-9])$/.exec(id);
  if (heading !== null) {
    const level = Number(heading[1]) - 1;
    const spacing = headingSpacing[level] as readonly [number, number];
    return {
      bold: true,
      fontSizeTwips: headingSizes[level] as number,
      ...([3, 5, 7].includes(level) ? { italic: true as const } : {}),
      lowerTwips: spacing[1] * 20,
      upperTwips: spacing[0] * 20,
    };
  }
  if (id === "table-heading") return { adjust: SvxAdjust.Center, bold: true };
  if (id.endsWith("-heading") || id === "index-heading")
    return { bold: true, fontSizeTwips: 16 * 20 };
  switch (id) {
    case "text-body":
      return { lineHeightPercent: 115, lowerTwips: 7 * 20 };
    case "first-line-indent":
      return { firstLineTwips: 283 };
    case "hanging-indent":
      return { firstLineTwips: -283, textLeftTwips: 567 };
    case "text-body-indent":
      return { textLeftTwips: 283 };
    case "marginalia":
      return { textLeftTwips: 2268 };
    case "heading":
      return {
        fontRole: "heading",
        fontSizeTwips: 14 * 20,
        lowerTwips: 6 * 20,
        upperTwips: 12 * 20,
      };
    case "caption":
      return { fontSizeTwips: 10 * 20, italic: true, lowerTwips: 6 * 20, upperTwips: 6 * 20 };
    case "footnote":
    case "endnote":
      return { firstLineTwips: -340, fontSizeTwips: 10 * 20, textLeftTwips: 340 };
    case "comment":
      return { fontSizeTwips: 10 * 20 };
    case "header-right":
    case "footer-right":
      return { adjust: SvxAdjust.Right };
    case "title":
      return { adjust: SvxAdjust.Center, bold: true, fontSizeTwips: 28 * 20 };
    case "subtitle":
      return {
        adjust: SvxAdjust.Center,
        fontSizeTwips: 18 * 20,
        lowerTwips: 6 * 20,
        upperTwips: 3 * 20,
      };
    case "appendix":
      return { adjust: SvxAdjust.Center, bold: true, fontSizeTwips: 16 * 20 };
    case "quotations":
      return { lowerTwips: 283, rightTwips: 567, textLeftTwips: 567 };
    case "preformatted-text":
      return { fontRole: "fixed", fontSizeTwips: 10 * 20 };
    default:
      return {};
  }
}

/** Applies the direct defaults for one newly materialized pool style. @param collection - Target style. @returns Nothing. */
export function applyWriterParagraphStyleDefaults(collection: SwTextFormatColl): void {
  const defaults = getWriterParagraphStyleDefaults(collection.id);
  if (defaults.adjust !== undefined)
    collection.SetFormatAttr(new SvxAdjustItem(defaults.adjust, RES_PARATR_ADJUST));
  if (defaults.firstLineTwips !== undefined)
    collection.SetFormatAttr(
      new SvxFirstLineIndentItem(defaults.firstLineTwips, RES_MARGIN_FIRSTLINE),
    );
  if (defaults.textLeftTwips !== undefined)
    collection.SetFormatAttr(
      new SvxTextLeftMarginItem(defaults.textLeftTwips, RES_MARGIN_TEXTLEFT),
    );
  if (defaults.rightTwips !== undefined)
    collection.SetFormatAttr(new SvxRightMarginItem(defaults.rightTwips, RES_MARGIN_RIGHT));
  if (defaults.upperTwips !== undefined || defaults.lowerTwips !== undefined)
    collection.SetFormatAttr(
      new SvxULSpaceItem(
        defaults.upperTwips ?? 0,
        /* v8 ignore next -- Every implemented upper-spacing branch also defines lower spacing. */
        defaults.lowerTwips ?? 0,
        RES_UL_SPACE,
      ),
    );
  if (defaults.lineHeightPercent !== undefined)
    collection.SetFormatAttr(
      new SvxLineSpacingItem(defaults.lineHeightPercent, RES_PARATR_LINESPACING),
    );
  for (const which of [RES_CHRATR_WEIGHT, RES_CHRATR_CJK_WEIGHT, RES_CHRATR_CTL_WEIGHT])
    if (defaults.bold !== undefined)
      collection.SetFormatAttr(new SvxWeightItem(FontWeight.BOLD, which));
  for (const which of [RES_CHRATR_POSTURE, RES_CHRATR_CJK_POSTURE, RES_CHRATR_CTL_POSTURE])
    if (defaults.italic !== undefined)
      collection.SetFormatAttr(new SvxPostureItem(FontItalic.NORMAL, which));
  for (const which of [RES_CHRATR_FONTSIZE, RES_CHRATR_CJK_FONTSIZE, RES_CHRATR_CTL_FONTSIZE])
    if (defaults.fontSizeTwips !== undefined)
      collection.SetFormatAttr(new SvxFontHeightItem(defaults.fontSizeTwips, which));
  if (defaults.fontRole !== undefined) applyScriptFonts(collection, defaults.fontRole);
}

/** Resolves requested Writer font roles separately for all script slots. @param collection - Target style. @param role - Upstream font role. @returns Nothing. */
function applyScriptFonts(collection: SwTextFormatColl, role: "fixed" | "heading" | "text"): void {
  const document = collection.GetAttrSet().GetDoc();
  const requests = [
    [RES_CHRATR_FONT, "western"],
    [RES_CHRATR_CJK_FONT, "cjk"],
    [RES_CHRATR_CTL_FONT, "ctl"],
  ] as const;
  for (const [which, script] of requests) {
    const selection = getDefaultFontSelection(
      document.GetDefaultFontDevice(),
      role,
      getWriterDefaultFontLanguage(document.GetLocale(), script),
      script,
    );
    collection.SetFormatAttr(
      new SvxFontItem(selection.requestedFamily, which, selection.resolvedFamily),
    );
  }
}
