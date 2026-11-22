/** @fileoverview Browser projection of Writer paragraph border distances, lines, and shadows. */
import type { CSSProperties } from "react";
import { SvxBoxItem, SvxBoxItemLine as Edge } from "../../../editeng/source/items/frmitems";
import { SvxBreak, SvxShadowLocation } from "../../../editeng/inc/svxenum";
import type { SvxShadowItem } from "../../../editeng/source/items/frmitems.shadow";
import type { SfxBoolItem } from "../../../svl/inc/eitem";
import type { SfxInt16Item } from "../../../svl/inc/intitem";
import {
  RES_BOX,
  RES_BREAK,
  RES_FRAMEDIR,
  RES_PAGEDESC,
  RES_PARATR_CONNECT_BORDER,
  RES_SHADOW,
} from "../../inc/hintids";
import { SwTextNode } from "../../source/core/txtnode/ndtxt";
import { exportBorderShorthand } from "../../source/filter/xml/xmlexpit";

/** Projects Writer's adjacent-paragraph comparison at browser paragraph boundaries. @param previous - Preceding node. @param next - Following node. @returns Whether the outlines continue across the shared boundary. */
function joinParagraphBorders(previous: unknown, next: unknown): boolean {
  if (!(previous instanceof SwTextNode) || !(next instanceof SwTextNode)) return false;
  const previousBreak = (previous.GetAttr(RES_BREAK) as SfxInt16Item).GetValue();
  const nextBreak = (next.GetAttr(RES_BREAK) as SfxInt16Item).GetValue();
  if (
    previousBreak === SvxBreak.PageAfter ||
    previousBreak === SvxBreak.PageBoth ||
    previousBreak === SvxBreak.ColumnAfter ||
    previousBreak === SvxBreak.ColumnBoth ||
    nextBreak === SvxBreak.PageBefore ||
    nextBreak === SvxBreak.PageBoth ||
    nextBreak === SvxBreak.ColumnBefore ||
    nextBreak === SvxBreak.ColumnBoth ||
    next.GetpSwAttrSet()?.GetItemIfSet(RES_PAGEDESC, false) !== undefined ||
    !(previous.GetAttr(RES_PARATR_CONNECT_BORDER) as SfxBoolItem).GetValue() ||
    !previous.GetAttr(RES_SHADOW).equals(next.GetAttr(RES_SHADOW)) ||
    !previous.GetAttr(RES_FRAMEDIR).equals(next.GetAttr(RES_FRAMEDIR)) ||
    previous.GetParagraphTextLeftMargin() !== next.GetParagraphTextLeftMargin() ||
    previous.GetParagraphRightMargin() !== next.GetParagraphRightMargin()
  )
    return false;
  const before = previous.GetAttr(RES_BOX) as SvxBoxItem;
  const after = next.GetAttr(RES_BOX) as SvxBoxItem;
  return ([Edge.TOP, Edge.BOTTOM, Edge.LEFT, Edge.RIGHT] as const).every(
    /** Compares native line and lateral spacing for each edge. @param edge - Physical side. @returns Match. */
    (edge) => {
      const a = before.GetLine(edge),
        b = after.GetLine(edge);
      const sameLine = a === undefined ? b === undefined : b !== undefined && a.equals(b);
      return sameLine && (edge < Edge.LEFT || before.GetDistance(edge) === after.GetDistance(edge));
    },
  );
}

/** Formats the physical shadow without changing native positioning or size. @param shadow - Shadow item. @returns CSS shadow or no shadow. */
function paragraphShadow(shadow: SvxShadowItem): string | undefined {
  const location = shadow.GetLocation();
  if (location === SvxShadowLocation.NONE) return undefined;
  const size = shadow.GetWidth() / 20;
  const x =
    location === SvxShadowLocation.TopLeft || location === SvxShadowLocation.BottomLeft
      ? -size
      : size;
  const y =
    location === SvxShadowLocation.TopLeft || location === SvxShadowLocation.TopRight
      ? -size
      : size;
  const color = shadow.GetColor();
  return `${x}pt ${y}pt rgba(${color.GetRed()}, ${color.GetGreen()}, ${color.GetBlue()}, ${color.GetAlpha() / 255})`;
}

/** Projects effective paragraph item values, including inherited borders. @param node - Native paragraph. @returns CSS box properties when any are visible. */
export function projectWriterParagraphBorders(node: SwTextNode): CSSProperties | undefined {
  const box = node.GetAttr(RES_BOX) as SvxBoxItem;
  const shadow = paragraphShadow(node.GetAttr(RES_SHADOW) as SvxShadowItem);
  if (
    !box.GetTop() &&
    !box.GetBottom() &&
    !box.GetLeft() &&
    !box.GetRight() &&
    [Edge.TOP, Edge.BOTTOM, Edge.LEFT, Edge.RIGHT].every(
      /** Checks explicit no-line padding. @param edge - Physical side. @returns Whether its distance is zero. */
      (edge) => box.GetDistance(edge) === 0,
    ) &&
    shadow === undefined
  )
    return undefined;
  const nodes = node.GetNodes().entries(),
    index = node.GetIndex();
  const joinPrevious =
    (!!box.GetBottom() || !!box.GetLeft() || !!box.GetRight()) &&
    joinParagraphBorders(nodes[index - 1], node);
  const joinNext =
    (!!box.GetTop() || !!box.GetLeft() || !!box.GetRight()) &&
    joinParagraphBorders(node, nodes[index + 1]);
  return {
    ...(joinPrevious
      ? {}
      : {
          borderTop: exportBorderShorthand(box.GetTop()),
          paddingTop: `${box.GetDistance(Edge.TOP) / 20}pt`,
        }),
    ...(joinNext
      ? {}
      : {
          borderBottom: exportBorderShorthand(box.GetBottom()),
          paddingBottom: `${box.GetDistance(Edge.BOTTOM) / 20}pt`,
        }),
    borderLeft: exportBorderShorthand(box.GetLeft()),
    borderRight: exportBorderShorthand(box.GetRight()),
    paddingLeft: `${box.GetDistance(Edge.LEFT) / 20}pt`,
    paddingRight: `${box.GetDistance(Edge.RIGHT) / 20}pt`,
    ...(shadow === undefined ? {} : { boxShadow: shadow }),
  };
}
