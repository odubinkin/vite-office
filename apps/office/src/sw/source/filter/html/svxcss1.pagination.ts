/** @fileoverview Original CSS1 page-break, widow and orphan producers from svxcss1.cxx over the current core's registered scalar items. */
import { CSS1Token as T, type ConstCSS1Expression } from "./parcss1.h";
import { SvxCSS1PageBreak as B, type SvxCSS1PropertyInfo } from "./svxcss1.types";
import { aItemIds } from "./svxcss1";
import { cssAsciiLower } from "./svxcss1.properties";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";

/** Original aPageBreakTable, admitted only for an IDENT expression. */
const pageBreak = new Map<string, B>([
  ["auto", B.AUTO],
  ["always", B.ALWAYS],
  ["avoid", B.AVOID],
  ["left", B.LEFT],
  ["right", B.RIGHT],
]);

/** Original first-expression-only lookup; no CSS validity check is added for trailing operands or tokens. @param expression - Borrowed first expression. @returns Recognized native enum or absent. */
function ParseCSS1_page_break_xxx(expression: ConstCSS1Expression): B | undefined {
  return expression.GetType() === T.IDENT
    ? pageBreak.get(cssAsciiLower(expression.GetString()))
    : undefined;
}

/** Original five property-table entries. The existing core binds split/count items to SfxBoolItem/SfxInt16Item; source uint8 conversion happens before insertion, without changing defaults or unrelated filter ingress. @param property - ASCII-folded property. @param expression - Original first expression. @param items - Actual current core item set. @param info - Native pending property owner. @returns Whether this is a registered pagination property, even when its value is ignored. */
export function ParseCSS1PaginationProperty(
  property: string,
  expression: ConstCSS1Expression,
  items: SfxItemSet,
  info: SvxCSS1PropertyInfo,
): boolean {
  if (property === "page-break-before" || property === "page-break-after") {
    const value = ParseCSS1_page_break_xxx(expression);
    if (value !== undefined) {
      if (property === "page-break-before") info.m_ePageBreakBefore = value;
      else info.m_ePageBreakAfter = value;
    }
    return true;
  }
  if (property === "page-break-inside") {
    const value = ParseCSS1_page_break_xxx(expression);
    if (value === B.AUTO || value === B.AVOID) {
      const item = new SfxBoolItem(aItemIds.nFormatSplit, value === B.AUTO);
      try {
        items.Put(item);
      } finally {
        item.Dispose();
      }
    }
    return true;
  }
  if (property === "widows" || property === "orphans") {
    if (expression.GetType() === T.NUMBER) {
      const number = expression.GetNumber();
      const value = number <= 255 ? Math.trunc(number) & 255 : 255;
      const which = property === "widows" ? aItemIds.nWidows : aItemIds.nOrphans;
      const item = new SfxInt16Item(which, value);
      try {
        items.Put(item);
      } finally {
        item.Dispose();
      }
    }
    return true;
  }
  return false;
}
