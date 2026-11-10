/** @fileoverview Native CSS1 border/padding declaration handlers from svxcss1.cxx, retaining source nontransactional shorthand and narrowing. */
import { CSS1Token as T, type ConstCSS1Expression } from "./parcss1.h";
import { cssAsciiLower } from "./svxcss1.properties";
import type { SvxCSS1PropertyInfo } from "./svxcss1.types";
import { Color } from "../../../../tools/inc/color";
import { SvxBoxItemLine as E } from "../../../../editeng/source/items/frmitems";
import {
  CSS1BorderStyle as B,
  SVX_CSS1_BORDERINFO_WIDTH as WIDTH,
  SVX_CSS1_BORDERINFO_COLOR as COLOR,
  SVX_CSS1_BORDERINFO_STYLE as STYLE,
} from "./svxcss1.border-info";
const widths = ["thin", "medium", "thick"];
const styles = [
  "none",
  "solid",
  "double",
  "dotted",
  "dashed",
  "groove",
  "ridge",
  "inset",
  "outset",
];
const sides = new Map<string, E>([
  ["top", E.TOP],
  ["bottom", E.BOTTOM],
  ["left", E.LEFT],
  ["right", E.RIGHT],
]);
const distances = [
  "m_nTopBorderDistance",
  "m_nBottomBorderDistance",
  "m_nLeftBorderDistance",
  "m_nRightBorderDistance",
] as const;
/** Original pixel-width admission before native PixelToTwip. @param expression - Native expression. @returns Narrowed twips or absent. */
function pixelWidth(expression: ConstCSS1Expression): number | undefined {
  const value = expression.GetNumber();
  if (value < 2147483647 / 2 && value > -2147483648 / 2) return (Math.trunc(value) * 15) & 0xffff;
  return undefined;
}
/** Original ParseCSS1_padding_xxx, including saturation and unsupported percentage admission. @param expression - Value. @param info - Owner. @param side - Edge. @returns Whether assigned. */
function padding(expression: ConstCSS1Expression, info: SvxCSS1PropertyInfo, side: E): boolean {
  let value: number | undefined;
  if (expression.GetType() === T.LENGTH)
    value = Math.max(0, Math.min(65534, expression.GetSLength()));
  else if (expression.GetType() === T.PIXLENGTH) {
    const number = expression.GetNumber();
    if (number < 2147483647 / 2 && number > -2147483648 / 2)
      value = Math.min(65534, Math.max(0, Math.trunc(number)) * 15);
  }
  if (value === undefined) return false;
  const field = distances[side];
  if (field !== undefined) info[field] = value;
  return true;
}
/** Original ParseCSS1_border_xxx retains an earlier color when shorthand contains no accepted color. @param expression - Chain. @param info - Pending values. @param side - Selected edge. @param all - All edges. @returns Nothing. */
function border(
  expression: ConstCSS1Expression,
  info: SvxCSS1PropertyInfo,
  side: E,
  all: boolean,
): void {
  let absolute = 0xffff,
    named = 1,
    style = B.NONE,
    colorSet = false;
  const color = new Color();
  for (
    let value: ConstCSS1Expression | undefined = expression;
    value && !value.GetOp();
    value = value.GetNext()
  ) {
    switch (value.GetType()) {
      case T.RGB:
      case T.HEXCOLOR:
        if (value.GetColor(color)) colorSet = true;
        break;
      case T.IDENT: {
        const name = cssAsciiLower(value.GetString()),
          width = widths.indexOf(name),
          kind = styles.indexOf(name);
        if (width >= 0) named = width;
        else if (kind >= 0) style = kind;
        else if (value.GetColor(color)) colorSet = true;
        break;
      }
      case T.LENGTH:
        absolute = value.GetULength() & 0xffff;
        break;
      case T.PIXLENGTH: {
        const number = value.GetNumber();
        absolute = number > 1 && number < 2147483647 / 2 ? (Math.trunc(number) * 15) & 0xffff : 1;
        break;
      }
    }
  }
  for (let edge = 0; edge < 4; edge++)
    if (all || edge === side) {
      const pending = info.GetBorderInfo(edge);
      pending.eStyle = style;
      pending.nAbsWidth = absolute;
      pending.nNamedWidth = named;
      if (colorSet) pending.aColor.assign(color);
    }
}
/** Original ParseCSS1_border_xxx_width writes the medium named default even for an unrecognized value. @param expression - Value. @param info - State. @param side - Side. @returns Nothing. */
function borderWidth(expression: ConstCSS1Expression, info: SvxCSS1PropertyInfo, side: E): void {
  let absolute = 0xffff,
    named = 1;
  if (expression.GetType() === T.IDENT) {
    const index = widths.indexOf(cssAsciiLower(expression.GetString()));
    if (index >= 0) named = index;
  } else if (expression.GetType() === T.LENGTH) absolute = expression.GetULength() & 0xffff;
  else if (expression.GetType() === T.PIXLENGTH) absolute = pixelWidth(expression) ?? absolute;
  const pending = info.GetBorderInfo(side);
  pending.nAbsWidth = absolute;
  pending.nNamedWidth = named;
}
/** Dispatches exactly the border/padding names registered by the native CSS1 property table. @param property - Folded name. @param expression - Native chain. @param info - Original property owner. @returns Whether recognized. */
export function ParseCSS1BorderProperty(
  property: string,
  expression: ConstCSS1Expression,
  info: SvxCSS1PropertyInfo,
): boolean {
  if (property === "border") {
    border(expression, info, E.TOP, true);
    return true;
  }
  for (const [name, side] of sides) {
    if (property === "border-" + name) {
      border(expression, info, side, false);
      return true;
    }
    if (property === "border-" + name + "-width") {
      borderWidth(expression, info, side);
      return true;
    }
    if (property === "padding-" + name) {
      padding(expression, info, side);
      return true;
    }
  }
  if (!["padding", "border-width", "border-color", "border-style"].includes(property)) return false;
  let count = 0;
  for (
    let value: ConstCSS1Expression | undefined = expression;
    count < 4 && value && !value.GetOp();
    value = value.GetNext(), count++
  ) {
    const side = count === 0 || count === 2 ? E.BOTTOM : E.LEFT;
    if (property === "padding") {
      if (padding(value, info, side)) {
        if (count === 0)
          info.m_nLeftBorderDistance = info.m_nTopBorderDistance = info.m_nBottomBorderDistance;
        if (count <= 1) info.m_nRightBorderDistance = info.m_nLeftBorderDistance;
      }
    } else if (property === "border-width") {
      borderWidth(value, info, side);
      info.CopyBorderInfo(count, WIDTH);
    } else if (property === "border-style") {
      const kind = styles.indexOf(cssAsciiLower(value.GetString()));
      if (value.GetType() === T.IDENT && kind >= 0) info.GetBorderInfo(side).eStyle = kind;
      info.CopyBorderInfo(count, STYLE);
    } else {
      const color = new Color();
      if ([T.RGB, T.HEXCOLOR, T.IDENT].includes(value.GetType()) && value.GetColor(color))
        info.GetBorderInfo(side).aColor.assign(color);
      info.CopyBorderInfo(count, COLOR);
    }
  }
  return true;
}
