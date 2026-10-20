/** @fileoverview Plain-cell font-family painting from the actual three-script items and native UTF16 run classification;device/rich/wrapped layout remains unported. */
import { SvxCrossedOutItem } from "../../../editeng/inc/crossedoutitem";
import type { ScPatternAttr } from "../../inc/patattr";
import { SvxOverlineItem } from "../../../editeng/source/items/textitem";
import { FontLineStyle, FontStrikeout } from "../../../tools/inc/fontenum";
import type { SvxFontItem } from "../../../editeng/inc/fontitem";
import { BreakIteratorImpl } from "../../../i18npool/source/breakiterator/breakiteratorImpl";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { getConfiguredSystemUILanguage } from "../../../i18nlangtag/source/isolang/mslangid";
import { getScriptType, ScriptType } from "../../../i18nlangtag/source/isolang/mslangid.script";
import { browserFontFamily } from "../../../vcl/browser/font-family";
import { getFontFamilyGeneric } from "../../../xmloff/source/style/fonthdl";
import type { SvxFontHeightItem } from "../../../editeng/inc/fhgtitem";
const breakIterator = new BreakIteratorImpl();
/** Paints original script font values without storing text or attributes in React state. @param props - Display text and borrowed pattern. @returns Script-specific text spans. */
export function ScCellText({
  text,
  pattern,
}: {
  readonly text: string;
  readonly pattern: ScPatternAttr;
}): React.JSX.Element {
  const strikeout = pattern.GetItem(106) as SvxCrossedOutItem,
    overline = pattern.GetItem(105) as SvxOverlineItem,
    lineColor = overline.GetColor(),
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
      const font = pattern.GetItem(which) as SvxFontItem;
      runs.push(
        <span
          key={pos}
          style={{
            textDecorationLine: strikeout.GetBoolValue() ? "line-through" : "none",
            textDecorationStyle:
              strikeout.GetStrikeout() === FontStrikeout.STRIKEOUT_DOUBLE ? "double" : "solid",
          }}
        >
          <span
            style={{
              textDecorationLine: lineStyle === FontLineStyle.LINESTYLE_NONE ? "none" : "overline",
              textDecorationStyle:
                lineStyle === FontLineStyle.LINESTYLE_DOUBLE ? "double" : "solid",
              textDecorationColor:
                lineColor.GetAlpha() === 255
                  ? `rgb(${lineColor.GetRed()}, ${lineColor.GetGreen()}, ${lineColor.GetBlue()})`
                  : "currentColor",
              fontFamily: browserFontFamily(
                font.GetFamilyName(),
                getFontFamilyGeneric(font.GetFamily()),
              ),
              fontSize: `${(pattern.GetItem(effective === ScriptType.ASIAN ? 112 : effective === ScriptType.COMPLEX ? 117 : 101) as SvxFontHeightItem).GetHeight() / 20}pt`,
            }}
          >
            {text.slice(pos, end)}
          </span>
        </span>,
      );
      pos = end;
    }
  } finally {
    string.dispose();
  }
  return <>{runs}</>;
}
