/** @fileoverview Resolves inline Writer frames and their graphics for browser text layout. */
import type { SwTextNode } from "../../source/core/txtnode/ndtxt";

/** Visual form of an as-character fly occupying one native text position. */
export interface WriterInlineGraphicProjection {
  readonly image: import("../../../vcl/source/gdi/graph").Graphic;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly left: number;
  readonly right: number;
  readonly upper: number;
  readonly lower: number;
}

/** Projects a graphic's native point and frame attributes as a single device portion. @param node - Anchor paragraph. @param start - Native UTF16 position. @returns Inline image or absence. */
export function projectInlineGraphic(
  node: SwTextNode,
  start: number,
): WriterInlineGraphicProjection | undefined {
  const format = node.GetpSwpHints()?.GetTextAttrForCharAt(start)?.GetAttr().GetFrameFormat();
  const section = format?.GetContent().GetContentIdx()?.GetNode();
  if (!format || !section?.IsStartNode()) return undefined;
  const graphic = node
    .GetNodes()
    .at(section.GetIndex() + 1)
    .GetGrfNode();
  if (!graphic) return undefined;
  const size = format.GetFrameSize();
  const horizontal = format.GetLRSpace();
  const vertical = format.GetULSpace();
  return Object.freeze({
    image: graphic.GetGraphic(),
    name: format.GetName(),
    width: size.GetWidth(),
    height: size.GetHeight(),
    left: horizontal.ResolveLeft(),
    right: horizontal.ResolveRight(),
    upper: vertical.GetUpper(),
    lower: vertical.GetLower(),
  });
}
