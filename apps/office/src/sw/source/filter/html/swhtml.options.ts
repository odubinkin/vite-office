/** @fileoverview Original shared Writer HTML paragraph alignment table from swhtml.cxx, without a parser initialization dependency. */
import { SvxAdjust } from "../../../../editeng/inc/svxenum";
/** Original aHTMLPAlignTable includes Netscape middle and character-alignment fallback to Left. */
export const aHTMLPAlignTable: readonly (readonly [string, SvxAdjust])[] = [
  ["left", SvxAdjust.Left],
  ["center", SvxAdjust.Center],
  ["middle", SvxAdjust.Center],
  ["right", SvxAdjust.Right],
  ["justify", SvxAdjust.Block],
  ["char", SvxAdjust.Left],
];
