/** @fileoverview Native DOCX page border output and its shared border-line serialization. */
import {
  ConvertBorderWidthToWord,
  SvxBorderLineStyle as Style,
  type SvxBorderLine,
} from "../../../../editeng/source/items/borderline";
import {
  BorderDistancesToWord,
  SvxBoxItemLine as Edge,
  type WordPageMargins,
} from "../../../../editeng/source/items/frmitems";
import type { SvxShadowItem } from "../../../../editeng/source/items/frmitems.shadow";
import { SvxShadowLocation as Shadow } from "../../../../editeng/inc/svxenum";
import { ConvertColorOU } from "../../../../filter/source/msfilter/util";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { FSNS, FastSerializerHelper } from "../../../../sax/inc/fshelper";
import { RES_SHADOW } from "../../../inc/hintids";
import type { SwFrameFormat } from "../../core/layout/atrfrm";
import { text } from "../../core/unocore/unocrsrhelper";
import { lclAddThemeColorAttributes } from "./docxattributeoutput";

const w = token("w");
const order = [
  [Edge.TOP, "top"],
  [Edge.LEFT, "left"],
  [Edge.BOTTOM, "bottom"],
  [Edge.RIGHT, "right"],
] as const;

const wordBorderStyles = new Map<Style, string>([
  [Style.SOLID, "single"],
  [Style.DOTTED, "dotted"],
  [Style.DASHED, "dashed"],
  [Style.DOUBLE, "double"],
  [Style.DOUBLE_THIN, "double"],
  [Style.THINTHICK_SMALLGAP, "thinThickSmallGap"],
  [Style.THINTHICK_MEDIUMGAP, "thinThickMediumGap"],
  [Style.THINTHICK_LARGEGAP, "thinThickLargeGap"],
  [Style.THICKTHIN_SMALLGAP, "thickThinSmallGap"],
  [Style.THICKTHIN_MEDIUMGAP, "thickThinMediumGap"],
  [Style.THICKTHIN_LARGEGAP, "thickThinLargeGap"],
  [Style.EMBOSSED, "threeDEmboss"],
  [Style.ENGRAVED, "threeDEngrave"],
  [Style.OUTSET, "outset"],
  [Style.INSET, "inset"],
  [Style.FINE_DASHED, "dashSmallGap"],
  [Style.DASH_DOT, "dotDash"],
  [Style.DASH_DOT_DOT, "dotDotDash"],
]);
const shadowEdges = new Map<Shadow, readonly Edge[]>([
  [Shadow.TopLeft, [Edge.TOP, Edge.LEFT]],
  [Shadow.TopRight, [Edge.TOP, Edge.RIGHT]],
  [Shadow.BottomLeft, [Edge.LEFT, Edge.BOTTOM]],
  [Shadow.BottomRight, [Edge.TOP, Edge.LEFT, Edge.BOTTOM, Edge.RIGHT]],
]);

/** Writes the lines and fixed native display selection for a Word section. @param serializer - Section XML serializer. @param format - Actual page frame. @param margins - Word page margins. @returns Nothing. */
export function SectionPageBorders(
  serializer: FastSerializerHelper,
  format: SwFrameFormat,
  margins: WordPageMargins,
): void {
  const box = format.GetBox();
  if (!box.GetTop() && !box.GetLeft() && !box.GetBottom() && !box.GetRight()) return;

  const actualMargins: [number, number, number, number] = [...margins];
  const gutterAtTop = format.GetDoc().GetDocumentSettingManager().get("GUTTER_AT_TOP");
  const gutterSide = gutterAtTop ? Edge.TOP : Edge.LEFT;
  actualMargins[gutterSide] += format.GetLRSpace().GetGutterMargin();
  const { fromEdge, distances } = BorderDistancesToWord(box, actualMargins);
  const shadow = format.GetAttrSet().Get(RES_SHADOW) as SvxShadowItem;
  const shadowed = shadowEdges.get(shadow.GetLocation());
  serializer.startElementNS(
    w,
    token("pgBorders"),
    FSNS(w, token("display")),
    "allPages",
    FSNS(w, token("offsetFrom")),
    fromEdge ? "page" : "text",
  );
  for (const [edge, name] of order)
    impl_borderLine(
      serializer,
      name,
      box.GetLine(edge),
      distances[edge] as number,
      shadowed?.includes(edge) ?? false,
    );
  serializer.endElementNS(w, token("pgBorders"));
}

/** Writes the original Word size, spacing, color and shadow of one nonempty border line. @param serializer - Section XML serializer. @param name - Physical edge. @param line - Actual border line. @param distance - Selected offset in twips. @param shadow - Whether Word applies shadow on this side. @returns Nothing. */
function impl_borderLine(
  serializer: FastSerializerHelper,
  name: string,
  line: SvxBorderLine | undefined,
  distance: number,
  shadow: boolean,
): void {
  if (!line || line.isEmpty()) return;
  const attributes = FastSerializerHelper.createAttrList();
  const color = ConvertColorOU(line.GetColor());
  try {
    const style = line.GetBorderLineStyle();
    const width = Math.trunc(ConvertBorderWidthToWord(style, line.GetWidth()) / 2.5);
    const list = attributes.get();
    list?.add(FSNS(w, token("val")), wordBorderStyles.get(style) ?? "nil");
    list?.add(FSNS(w, token("sz")), String(Math.min(96, Math.max(2, width))));
    list?.add(FSNS(w, token("space")), String(Math.round(distance / 20)));
    list?.add(FSNS(w, token("color")), text(color));
    lclAddThemeColorAttributes(attributes, line.getComplexColor());
    if (shadow) list?.add(FSNS(w, token("shadow")), "1");
    serializer.singleElementNS(w, token(name), attributes);
  } finally {
    color.dispose();
    attributes.dispose();
  }
}
