/** @fileoverview Calc ODF's merged cell protection and print-content property handlers. */
import { Converter } from "../../../../sax/source/tools/converter";
import type { FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { XMLToken as T } from "../../../../xmloff/source/core/xmltoken";
import { ScProtectionAttr } from "../../../inc/attrib";
import type { ScPatternAttr } from "../../../inc/patattr";
import { ATTR_PROTECTION } from "../../../inc/scitems";

/** Original admitted tokens for the merged ODF cell protection value. */
export const cellProtectionTokens = [T.STYLE_CELL_PROTECT, T.STYLE_PRINT_CONTENT] as const;

/** Interprets the native single-token and two-part protection spellings. @param source - Original lexical attribute. @returns Locked, formula hidden and cell hidden. */
function readProtection(source: string | null): readonly [boolean, boolean, boolean] {
  switch (source) {
    case null:
    case "protected":
      return [true, false, false];
    case "none":
      return [false, false, false];
    case "hidden-and-protected":
      return [true, true, true];
    case "formula-hidden":
      return [false, true, false];
    default: {
      const space = source.indexOf(" ");
      const first = space < 0 ? source : source.slice(0, space);
      const second = space < 0 ? "" : source.slice(space + 1);
      return [
        first === "protected" || second === "protected",
        first === "formula-hidden" || second === "formula-hidden",
        false,
      ];
    }
  }
}

/** Merges both source properties into a single actual native pool item. @param pattern - Cell style. @param attributes - Source cell properties. @param unsupported - Existing diagnostic sink. @returns Nothing. */
export function importCellProtection(
  pattern: ScPatternAttr,
  attributes: FastAttributeList,
  unsupported: (name: string) => void,
): void {
  const protection = attributes.get(T.STYLE_CELL_PROTECT);
  const print = attributes.get(T.STYLE_PRINT_CONTENT);
  const printContent: [boolean] = [true];
  const validPrint = print !== null && Converter.convertBool(printContent, print);
  if (print !== null && !validPrint) unsupported("invalid cell print content flag");
  if (protection === null && !validPrint) return;
  const [locked, formulaHidden, hidden] = readProtection(protection);
  pattern.ItemSetPut(
    new ScProtectionAttr(locked, formulaHidden, hidden, validPrint && !printContent[0]),
  );
}

/** Writes native ODF properties from the original cell protection item. @param pattern - Cell style. @returns Attributes for the cell style. */
export function exportCellProtection(pattern: ScPatternAttr): string {
  const item = pattern.GetItemSet().GetItemIfSet(ATTR_PROTECTION, false) as
    ScProtectionAttr | undefined;
  if (!item) return "";
  const locked = item.GetProtection(),
    formulaHidden = item.GetHideFormula();
  const protect = item.GetHideCell()
    ? "hidden-and-protected"
    : locked
      ? formulaHidden
        ? "protected formula-hidden"
        : "protected"
      : formulaHidden
        ? "formula-hidden"
        : "none";
  return ` style:cell-protect="${protect}" style:print-content="${!item.GetHidePrint()}"`;
}
