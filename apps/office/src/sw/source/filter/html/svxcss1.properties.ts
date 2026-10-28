/** @fileoverview Consumed native CSS1 character and adjustment handlers from svxcss1.cxx, operating on actual expression and pooled-item owners. */
import { CSS1Expression, CSS1Token as T, type ConstCSS1Expression } from "./parcss1.h";
import { aItemIds, type SvxCSS1Parser } from "./svxcss1";
import type { SvxCSS1PropertyInfo } from "./svxcss1.types";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import { SvxLineSpaceRule, SvxInterLineSpaceRule } from "../../../../editeng/inc/svxenum";
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
import { toTwips, Length } from "../../../../o3tl/inc/unit_conversion";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { SvxPostureItem } from "../../../../editeng/inc/postitem";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SvxCaseMapItem } from "../../../../editeng/inc/cmapitem";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SvxUnderlineItem, SvxOverlineItem } from "../../../../editeng/inc/udlnitem";
import { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import { SvxBlinkItem } from "../../../../editeng/inc/blinkitem";
import { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import {
  FontWeight as W,
  FontItalic as I,
  FontLineStyle as L,
  FontStrikeout as S,
} from "../../../../tools/inc/fontenum";
import { SvxCaseMap as C, SvxAdjust as A } from "../../../../editeng/inc/svxenum";
import { ParseCSS1ParagraphProperty } from "./svxcss1.paragraph";
import { Color } from "../../../../tools/inc/color";
/** Original ASCII case folding; no Unicode/browser normalization is added. @param value - Native string. @returns Folded string. */
export function cssAsciiLower(value: string): string {
  return value.replace(
    /[A-Z]/g,
    /** Folds one ASCII unit. @param unit - Unit. @returns Lowercase unit. */ (unit) =>
      String.fromCharCode(unit.charCodeAt(0) + 32),
  );
}
/** Copies an actual item to the native set, then destroys the original temporary. @param set - Actual target. @param item - Owned temporary. @returns Nothing. */
function put(set: SfxItemSet, item: SfxPoolItem): void {
  try {
    if (item.Which()) set.Put(item);
  } finally {
    item.Dispose();
  }
}
/** Original repeated script-Which application clones the same actual item. @param set - Actual target. @param item - Owned temporary. @param ids - Script identities. @returns Nothing. */
function scripts(set: SfxItemSet, item: SfxPoolItem, ids: readonly number[]): void {
  try {
    for (const id of ids) {
      item.SetWhich(id);
      if (id) set.Put(item);
    }
  } finally {
    item.Dispose();
  }
}
const weight = new Map<string, W>([
  ["extra-light", W.WEIGHT_NORMAL],
  ["light", W.WEIGHT_NORMAL],
  ["demi-light", W.WEIGHT_NORMAL],
  ["medium", W.WEIGHT_NORMAL],
  ["normal", W.WEIGHT_NORMAL],
  ["demi-bold", W.WEIGHT_NORMAL],
  ["bold", W.WEIGHT_BOLD],
  ["extra-bold", W.WEIGHT_BOLD],
  ["bolder", W.WEIGHT_BOLD],
  ["lighter", W.WEIGHT_NORMAL],
]);
const posture = new Map<string, I>([
  ["normal", I.ITALIC_NONE],
  ["italic", I.ITALIC_NORMAL],
  ["oblique", I.ITALIC_NORMAL],
]);
/** Consumed native no-DocShell font-family path; device metrics are absent in the current Markdown insertion caller. No host font-name normalization is added. @param expression - Borrowed chain. @param set - Actual set. @param parser - Native parser. @returns Nothing. */
function fontFamily(expression: ConstCSS1Expression, set: SfxItemSet, parser: SvxCSS1Parser): void {
  let current: ConstCSS1Expression | undefined = expression,
    first = true,
    name = "";
  while (current && (first || current.GetOp() === 44 || !current.GetOp())) {
    const type = current.GetType();
    if (type === T.IDENT || type === T.STRING) {
      let ident = current.GetString();
      if (type === T.IDENT) {
        let next = current.GetNext();
        while (next && !next.GetOp() && next.GetType() === T.IDENT) {
          ident += " " + next.GetString();
          current = next;
          next = current.GetNext();
        }
      }
      if (ident) {
        if (!first) name += ";";
        name += ident;
      }
    }
    current = current.GetNext();
    first = false;
  }
  if (name && !parser.IsIgnoreFontFamily())
    scripts(
      set,
      new SvxFontItem(
        FontFamily.FAMILY_DONTKNOW,
        name,
        "",
        FontPitch.PITCH_DONTKNOW,
        parser.GetDfltEncoding(),
        aItemIds.nFont,
      ),
      [aItemIds.nFont, aItemIds.nFontCJK, aItemIds.nFontCTL],
    );
}
/** Original font shorthand order and partial-write semantics, including default resets before checking later family syntax. @param expression - Borrowed chain. @param set - Native set. @param info - Actual flags. @param parser - Native parser. @returns Nothing. */
function font(
  expression: ConstCSS1Expression,
  set: SfxItemSet,
  info: SvxCSS1PropertyInfo,
  parser: SvxCSS1Parser,
): void {
  let current: ConstCSS1Expression | undefined = expression,
    italic = I.ITALIC_NONE,
    mode = C.NotMapped,
    bold = W.WEIGHT_NORMAL;
  while (current && !current.GetOp() && [T.IDENT, T.STRING, T.NUMBER].includes(current.GetType())) {
    if (current.GetType() === T.NUMBER)
      bold = (Math.trunc(current.GetNumber()) & 0xffff) > 400 ? W.WEIGHT_BOLD : W.WEIGHT_NORMAL;
    else {
      const value = cssAsciiLower(current.GetString()),
        slant = posture.get(value);
      if (slant !== undefined) italic = slant;
      else if (value === "normal" || value === "small-caps")
        mode = value === "normal" ? C.NotMapped : C.SmallCaps;
      else bold = weight.get(value) ?? bold;
    }
    current = current.GetNext();
  }
  if (!current || current.GetOp()) return;
  scripts(set, new SvxPostureItem(italic, aItemIds.nPosture), [
    aItemIds.nPosture,
    aItemIds.nPostureCJK,
    aItemIds.nPostureCTL,
  ]);
  put(set, new SvxCaseMapItem(mode, aItemIds.nCaseMap));
  scripts(set, new SvxWeightItem(bold, aItemIds.nWeight), [
    aItemIds.nWeight,
    aItemIds.nWeightCJK,
    aItemIds.nWeightCTL,
  ]);
  const value = new CSS1Expression(current.GetType(), current.GetString(), current.GetNumber());
  ParseCSS1Property("font-size", value, set, info, parser);
  current = current.GetNext();
  if (!current) return;
  if (current.GetOp() === 47) {
    value.Set(current.GetType(), current.GetString(), current.GetNumber());
    ParseCSS1Property("line-height", value, set, info, parser);
    current = current.GetNext();
  }
  if (current && !current.GetOp()) fontFamily(current, set, parser);
}
/** Native property dispatch retains source token admission, expression order and default branches. @param property - Source property. @param expression - Native chain. @param set - Actual target. @param info - Actual property info. @param parser - Original parser. @returns Nothing. */
export function ParseCSS1Property(
  property: string,
  expression: CSS1Expression,
  set: SfxItemSet,
  info: SvxCSS1PropertyInfo,
  parser: SvxCSS1Parser,
): void {
  const type = expression.GetType(),
    value = cssAsciiLower(expression.GetString());
  if (ParseCSS1ParagraphProperty(cssAsciiLower(property), expression, set, info)) return;
  switch (cssAsciiLower(property)) {
    case "font-family":
      fontFamily(expression, set, parser);
      break;
    case "font":
      font(expression, set, info, parser);
      break;
    case "line-height": {
      let height = 0,
        proportion = 0;
      if (type === T.LENGTH) height = expression.GetULength() & 0xffff;
      else if (type === T.PIXLENGTH) {
        const pixels = expression.GetNumber();
        if (pixels < 2147483647 / 2 && pixels > -2147483648 / 2)
          height = (Math.trunc(pixels) * 15) & 0xffff;
      } else if (type === T.PERCENTAGE) proportion = Math.trunc(expression.GetNumber()) & 0xffff;
      else if (type === T.NUMBER) proportion = Math.trunc(expression.GetNumber() * 100) & 0xffff;
      if (height) {
        height = Math.max(height, Number(toTwips(25n, Length.mm10)));
        const item = new SvxLineSpacingItem(height, aItemIds.nLineSpacing);
        item.SetLineHeight(height);
        item.SetLineSpaceRule(SvxLineSpaceRule.Min);
        item.SetInterLineSpaceRule(SvxInterLineSpaceRule.Off);
        put(set, item);
      } else if (proportion) {
        const item = new SvxLineSpacingItem(proportion, aItemIds.nLineSpacing);
        item.SetLineSpaceRule(SvxLineSpaceRule.Auto);
        if (proportion === 100) item.SetInterLineSpaceRule(SvxInterLineSpaceRule.Off);
        else item.SetPropLineSpace(proportion);
        put(set, item);
      }
      break;
    }
    case "font-weight": {
      const result =
        type === T.IDENT || type === T.STRING
          ? weight.get(value)
          : type === T.NUMBER
            ? (Math.trunc(expression.GetNumber()) & 0xffff) > 400
              ? W.WEIGHT_BOLD
              : W.WEIGHT_NORMAL
            : undefined;
      if (result !== undefined)
        scripts(set, new SvxWeightItem(result, aItemIds.nWeight), [
          aItemIds.nWeight,
          aItemIds.nWeightCJK,
          aItemIds.nWeightCTL,
        ]);
      break;
    }
    case "font-style": {
      let current: ConstCSS1Expression | undefined = expression,
        hasPosture = false,
        hasCase = false,
        italic = I.ITALIC_NONE,
        mode = C.NotMapped;
      for (let count = 0; current && count < 2; ++count, current = current.GetNext())
        if ((current.GetType() === T.IDENT || current.GetType() === T.STRING) && !current.GetOp()) {
          const name = cssAsciiLower(current.GetString()),
            slant = posture.get(name);
          if (slant !== undefined) {
            italic = slant;
            if (!hasCase && italic === I.ITALIC_NONE) {
              mode = C.NotMapped;
              hasCase = true;
            }
            hasPosture = true;
          } else if (!hasCase && name === "small-caps") {
            mode = C.SmallCaps;
            hasCase = true;
          }
        }
      if (hasPosture)
        scripts(set, new SvxPostureItem(italic, aItemIds.nPosture), [
          aItemIds.nPosture,
          aItemIds.nPostureCJK,
          aItemIds.nPostureCTL,
        ]);
      if (hasCase) put(set, new SvxCaseMapItem(mode, aItemIds.nCaseMap));
      break;
    }
    case "font-variant":
      if (type === T.IDENT && (value === "normal" || value === "small-caps"))
        put(
          set,
          new SvxCaseMapItem(value === "normal" ? C.NotMapped : C.SmallCaps, aItemIds.nCaseMap),
        );
      break;
    case "text-transform": {
      const mode = new Map([
        ["none", C.NotMapped],
        ["capitalize", C.Capitalize],
        ["uppercase", C.Uppercase],
        ["lowercase", C.Lowercase],
      ]).get(value);
      if (type === T.IDENT && mode !== undefined)
        put(set, new SvxCaseMapItem(mode, aItemIds.nCaseMap));
      break;
    }
    case "color":
      if ([T.IDENT, T.RGB, T.HEXCOLOR, T.STRING].includes(type)) {
        const color = new Color();
        if (expression.GetColor(color)) put(set, new SvxColorItem(color, aItemIds.nColor));
      }
      break;
    case "font-size": {
      let height = 0,
        proportion = 100;
      if (type === T.LENGTH) height = expression.GetULength();
      else if (type === T.PIXLENGTH) {
        const pixels = expression.GetNumber();
        if (pixels < 2147483647 / 2 && pixels > -2147483648 / 2) height = Math.trunc(pixels) * 15;
      } else if (type === T.PERCENTAGE) proportion = Math.trunc(expression.GetNumber()) & 0xffff;
      else if (type === T.IDENT) {
        const size = [
          "xx-small",
          "x-small",
          "small",
          "medium",
          "large",
          "x-large",
          "xx-large",
        ].indexOf(value);
        if (size >= 0) height = parser.GetFontHeight(size);
      }
      if (height || proportion !== 100)
        scripts(set, new SvxFontHeightItem(height >>> 0, proportion, aItemIds.nFontHeight), [
          aItemIds.nFontHeight,
          aItemIds.nFontHeightCJK,
          aItemIds.nFontHeightCTL,
        ]);
      break;
    }
    case "text-decoration": {
      let current: ConstCSS1Expression | undefined = expression,
        u = false,
        o = false,
        s = false,
        b = false,
        blink = false,
        under = L.LINESTYLE_NONE,
        over = L.LINESTYLE_NONE,
        strike = S.STRIKEOUT_NONE;
      while (
        current &&
        (current.GetType() === T.IDENT || current.GetType() === T.STRING) &&
        !current.GetOp()
      ) {
        const name = cssAsciiLower(current.GetString());
        switch (name) {
          case "none":
            u = o = s = b = true;
            under = over = L.LINESTYLE_NONE;
            strike = S.STRIKEOUT_NONE;
            blink = false;
            break;
          case "underline":
            u = true;
            under = L.LINESTYLE_SINGLE;
            break;
          case "overline":
            o = true;
            over = L.LINESTYLE_SINGLE;
            break;
          case "line-through":
            s = true;
            strike = S.STRIKEOUT_SINGLE;
            break;
          case "blink":
            b = true;
            blink = true;
            break;
          default:
            u = true;
            under = L.LINESTYLE_SINGLE;
        }
        current = current.GetNext();
      }
      if (u) put(set, new SvxUnderlineItem(under, aItemIds.nUnderline));
      if (o) put(set, new SvxOverlineItem(over, aItemIds.nOverline));
      if (s) put(set, new SvxCrossedOutItem(strike, aItemIds.nCrossedOut));
      if (b) put(set, new SvxBlinkItem(blink, aItemIds.nBlink));
      break;
    }
    case "text-align": {
      const adjust = new Map([
        ["left", A.Left],
        ["center", A.Center],
        ["right", A.Right],
        ["justify", A.Block],
        ["start", A.ParaStart],
        ["end", A.ParaEnd],
      ]).get(value);
      if ((type === T.IDENT || type === T.STRING) && adjust !== undefined)
        put(set, new SvxAdjustItem(adjust, aItemIds.nAdjust));
      break;
    }
    case "white-space":
      if (type === T.IDENT && (value === "pre" || value === "pre-wrap"))
        info.m_bPreserveSpace = true;
      break;
  }
}
