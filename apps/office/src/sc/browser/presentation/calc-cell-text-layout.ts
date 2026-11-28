/** @fileoverview Browser typography and writing modes for native Calc cell text output. */
import type { CSSProperties } from "react";
import { ComplexColor } from "../../../docmodel/inc/color/ComplexColor";
import { SvxContourItem } from "../../../editeng/inc/contouritem";
import { SvxFontHeightItem } from "../../../editeng/inc/fhgtitem";
import type { SvxFontItem } from "../../../editeng/inc/fontitem";
import type {
  SvxCharReliefItem,
  SvxPostureItem,
  SvxShadowedItem,
  SvxUnderlineItem,
  SvxWeightItem,
  SvxWordLineModeItem,
} from "../../../editeng/source/items/textitem";
import type { SfxItemSet } from "../../../svl/source/items/itemset";
import { COL_AUTO, COL_BLACK, COL_WHITE } from "../../../tools/inc/color";
import { FontLineStyle } from "../../../tools/inc/fontenum";
import { browserColor } from "../../../vcl/browser/color";
import { ScPatternAttr } from "../../inc/patattr";
import { ATTR_FONT_HEIGHT } from "../../inc/scitems";
import { ScAutoFontColorMode } from "../../source/core/data/patattr";
import { SvxCellOrientation } from "../../../editeng/inc/svxenum";
import { SvxRotateMode } from "../../../svx/inc/rotmodit";
import type { ScCellTextLayout } from "../../source/ui/view/output2";

const rotationOrigins = {
  [SvxRotateMode.SVX_ROTATE_MODE_STANDARD]: "50% 50%",
  [SvxRotateMode.SVX_ROTATE_MODE_TOP]: "50% 0%",
  [SvxRotateMode.SVX_ROTATE_MODE_CENTER]: "50% 50%",
  [SvxRotateMode.SVX_ROTATE_MODE_BOTTOM]: "50% 100%",
} as const;

/** Projects the effective native output mode onto the text box, independently of the sheet cell decorations. @param layout - Source cell text layout decisions. @param horizontal - Effective grid text alignment. @returns CSS text layout. */
export function calcCellTextLayoutStyle(
  layout: ScCellTextLayout,
  horizontal: CSSProperties["textAlign"],
): CSSProperties {
  const style: CSSProperties = {
    whiteSpace: layout.lineBreak ? "pre-wrap" : "pre",
    overflowWrap: layout.lineBreak ? "anywhere" : undefined,
    hyphens: layout.hyphenate ? "auto" : undefined,
  };
  if (layout.orientation !== SvxCellOrientation.Standard) {
    const stacked = layout.orientation === SvxCellOrientation.Stacked;
    const alignSelf = horizontal === "center" ? "center" : horizontal === "right" ? "end" : "start";
    return {
      ...style,
      width: "max-content",
      maxWidth: "100%",
      maxHeight: "100%",
      alignSelf,
      writingMode: stacked && !layout.asianVertical ? "vertical-lr" : "vertical-rl",
      textOrientation: stacked ? (layout.asianVertical ? "mixed" : "upright") : "sideways",
      transform: layout.orientation === SvxCellOrientation.BottomUp ? "rotate(180deg)" : undefined,
    };
  }
  if (layout.rotation !== 0) {
    style.transform = `rotate(${-layout.rotation / 100}deg)`;
    style.transformOrigin = rotationOrigins[layout.reference];
  }
  return style;
}

/** Projects one actual source cell's typography identically for paint and the independent edit view. @param pattern - Actual native cell attributes. @param conditional - Matching conditional style. @returns Read-only render projection. */
export function cellTypography(pattern: ScPatternAttr, conditional?: SfxItemSet) {
  const weight = (pattern.GetItem(102, conditional) as SvxWeightItem).GetWeight();
  const posture = (pattern.GetItem(103, conditional) as SvxPostureItem).GetPosture();
  const outlined = (pattern.GetItem(107, conditional) as SvxContourItem).GetValue(),
    shadowed = (pattern.GetItem(108, conditional) as SvxShadowedItem).GetValue(),
    relief = (pattern.GetItem(124, conditional) as SvxCharReliefItem).GetValue(),
    special = outlined || shadowed || relief !== 0;
  const lineItem = pattern.GetItem(104, conditional) as SvxUnderlineItem;
  const underline = (pattern.GetItem(123, conditional) as SvxWordLineModeItem).GetValue()
      ? FontLineStyle.LINESTYLE_NONE
      : lineItem.GetLineStyle(),
    lineColor = lineItem.GetColor();
  const fontColor = new ComplexColor();
  ScPatternAttr.fillColor(
    fontColor,
    pattern.GetItemSet(),
    ScAutoFontColorMode.Display,
    conditional,
    undefined,
    COL_WHITE,
    COL_BLACK,
    {
      isKitActive: false,
      hasCurrentView: true,
      currentCalcViewDocumentColor: undefined,
      documentColor: COL_WHITE,
      systemTextColor: COL_BLACK,
      rawSystemTextColor: COL_AUTO,
    },
  );
  const style: CSSProperties = {
    color: browserColor(fontColor.getFinalColor()),
    fontFamily: (pattern.GetItem(100, conditional) as SvxFontItem).GetFamilyName(),
    fontWeight: [400, 100, 200, 300, 350, 400, 500, 600, 700, 800, 900][weight],
    fontStyle: ["normal", "oblique", "italic"][posture],
    textDecorationColor:
      lineColor.GetAlpha() === 255
        ? `rgb(${lineColor.GetRed()}, ${lineColor.GetGreen()}, ${lineColor.GetBlue()})`
        : "currentColor",
    textDecorationStyle: underline === FontLineStyle.LINESTYLE_DOUBLE ? "double" : "solid",
    textDecorationLine:
      special || underline === FontLineStyle.LINESTYLE_NONE ? "none" : "underline",
    fontSize: `${(pattern.GetItem(ATTR_FONT_HEIGHT, conditional) as SvxFontHeightItem).GetHeight() / 20}pt`,
    lineHeight: "normal",
  };
  return { style, outlined, shadowed, relief, underline, lineColor, fontColor };
}
