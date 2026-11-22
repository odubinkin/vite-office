/** @fileoverview Plain-cell font-family painting from the actual three-script items and native UTF16 run classification;device/rich/wrapped layout remains unported. */
import { COL_BLACK } from "../../../tools/inc/color";
import { SvxCharReliefItem } from "../../../editeng/source/items/textitem";

import { SvxCrossedOutItem } from "../../../editeng/inc/crossedoutitem";
import type { SfxItemSet } from "../../../svl/source/items/itemset";
import type { ScPatternAttr } from "../../inc/patattr";
import { SvxOverlineItem } from "../../../editeng/source/items/textitem";
import { FontEmphasisMark, FontLineStyle, FontStrikeout } from "../../../tools/inc/fontenum";
import {
  SvxWeightItem,
  SvxPostureItem,
  SvxUnderlineItem,
  SvxWordLineModeItem,
} from "../../../editeng/source/items/textitem";
import { SvxEmphasisMarkItem } from "../../../editeng/source/items/textitem.effects";
import { ATTR_FONT_EMPHASISMARK, ATTR_FONT_WORDLINE, ATTR_FONT_UNDERLINE } from "../../inc/scitems";
import type { SvxFontItem } from "../../../editeng/inc/fontitem";
import { BreakIteratorImpl } from "../../../i18npool/source/breakiterator/breakiteratorImpl";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { getConfiguredSystemUILanguage } from "../../../i18nlangtag/source/isolang/mslangid";
import { getScriptType, ScriptType } from "../../../i18nlangtag/source/isolang/mslangid.script";
import { browserFontFamily } from "../../../vcl/browser/font-family";
import { getFontFamilyGeneric } from "../../../xmloff/source/style/fonthdl";
import type { SvxFontHeightItem } from "../../../editeng/inc/fhgtitem";
const breakIterator = new BreakIteratorImpl();
/** Paints original script font values without storing text or attributes in React state. @param props - Display text, borrowed pattern and active conditional style. @returns Script-specific text spans. */
export function ScCellText({
  text,
  pattern,
  conditional,
}: {
  readonly text: string;
  readonly pattern: ScPatternAttr;
  readonly conditional?: SfxItemSet | undefined;
}): React.JSX.Element {
  const strikeout = pattern.GetItem(106, conditional) as SvxCrossedOutItem,
    overline = pattern.GetItem(105, conditional) as SvxOverlineItem,
    lineColor = overline.GetColor(),
    wordMode = (pattern.GetItem(ATTR_FONT_WORDLINE, conditional) as SvxWordLineModeItem).GetValue(),
    underline = pattern.GetItem(ATTR_FONT_UNDERLINE, conditional) as SvxUnderlineItem,
    mark = (
      pattern.GetItem(ATTR_FONT_EMPHASISMARK, conditional) as SvxEmphasisMarkItem
    ).GetEmphasisMark(),
    markStyle = [undefined, "filled dot", "open circle", "filled circle", "filled sesame"][
      mark & FontEmphasisMark.Style
    ],
    lineStyle = overline.GetLineStyle(),
    string = unicode(text),
    runs: React.JSX.Element[] = [];
  try {
    const units = string.getStr().subarray(0, string.getLength());
    for (let pos = 0; pos < units.length;) {
      const script = breakIterator.getScriptType(units, pos);
      const end = breakIterator.endOfScript(units, pos, script);
      const effective =
        script === ScriptType.WEAK ? getScriptType(getConfiguredSystemUILanguage()) : script;
      const which =
        effective === ScriptType.ASIAN ? 111 : effective === ScriptType.COMPLEX ? 116 : 100;
      const font = pattern.GetItem(which, conditional) as SvxFontItem;
      const weight = (pattern.GetItem(which + 2, conditional) as SvxWeightItem).GetWeight();
      const posture = (pattern.GetItem(which + 3, conditional) as SvxPostureItem).GetPosture();
      const source = text.slice(pos, end);
      const segments = wordMode ? (source.match(/\s+|\S+/gu) ?? []) : [source];
      let start = pos;
      for (const segment of segments) {
        const decorated = !wordMode || /\S/u.test(segment);
        runs.push(
          <span
            key={start}
            style={{
              textDecorationLine: decorated && strikeout.GetBoolValue() ? "line-through" : "none",
              textDecorationStyle:
                strikeout.GetStrikeout() === FontStrikeout.STRIKEOUT_DOUBLE ? "double" : "solid",
            }}
          >
            <span
              style={{
                textDecorationLine:
                  !decorated || lineStyle === FontLineStyle.LINESTYLE_NONE ? "none" : "overline",
                textDecorationStyle:
                  lineStyle === FontLineStyle.LINESTYLE_DOUBLE ? "double" : "solid",
                textDecorationColor:
                  (pattern.GetItem(124, conditional) as SvxCharReliefItem).GetValue() !== 0 &&
                  lineColor.equals(COL_BLACK)
                    ? "white"
                    : lineColor.GetAlpha() === 255
                      ? `rgb(${lineColor.GetRed()}, ${lineColor.GetGreen()}, ${lineColor.GetBlue()})`
                      : "currentColor",
                fontWeight: [400, 100, 200, 300, 350, 400, 500, 600, 700, 800, 900][weight],
                fontStyle: ["normal", "oblique", "italic"][posture],
                textEmphasisStyle: markStyle,
                textEmphasisPosition: markStyle
                  ? mark & FontEmphasisMark.PosBelow
                    ? "under right"
                    : "over right"
                  : undefined,
                fontFamily: browserFontFamily(
                  font.GetFamilyName(),
                  getFontFamilyGeneric(font.GetFamily()),
                ),
                fontSize: `${(pattern.GetItem(effective === ScriptType.ASIAN ? 112 : effective === ScriptType.COMPLEX ? 117 : 101, conditional) as SvxFontHeightItem).GetHeight() / 20}pt`,
              }}
            >
              {wordMode && decorated && underline.GetBoolValue() ? (
                <span
                  style={{
                    textDecorationLine: "underline",
                    textDecorationStyle:
                      underline.GetLineStyle() === FontLineStyle.LINESTYLE_DOUBLE
                        ? "double"
                        : "solid",
                    textDecorationColor:
                      underline.GetColor().GetAlpha() === 255
                        ? "#" +
                          (underline.GetColor().toUInt32() & 0xffffff).toString(16).padStart(6, "0")
                        : "currentColor",
                  }}
                >
                  {segment}
                </span>
              ) : (
                segment
              )}
            </span>
          </span>,
        );
        start += segment.length;
      }
      pos = end;
    }
  } finally {
    string.dispose();
  }
  return <>{runs}</>;
}
