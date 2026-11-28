/** @fileoverview Calc's chained EditEngine ODF paragraph properties for Asian typography. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import type { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import type { FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { XMLToken as T } from "../../../../xmloff/source/core/xmltoken";
import type { SvXMLUnitConverter } from "../../../../xmloff/source/core/xmluconv";
import { XMLNamedBoolPropertyHdl } from "../../../../xmloff/source/style/NamedBoolPropertyHdl";
import type { ScPatternAttr } from "../../../inc/patattr";
import { ATTR_FORBIDDEN_RULES, ATTR_HANGPUNCTUATION, ATTR_SCRIPTSPACE } from "../../../inc/scitems";

const properties = [
  [
    T.STYLE_TEXT_AUTOSPACE,
    "text-autospace",
    ATTR_SCRIPTSPACE,
    new XMLNamedBoolPropertyHdl("ideograph-alpha", "none"),
  ],
  [
    T.STYLE_PUNCTUATION_WRAP,
    "punctuation-wrap",
    ATTR_HANGPUNCTUATION,
    new XMLNamedBoolPropertyHdl("hanging", "simple"),
  ],
  [
    T.STYLE_LINE_BREAK,
    "line-break",
    ATTR_FORBIDDEN_RULES,
    new XMLNamedBoolPropertyHdl("strict", "normal"),
  ],
] as const;

/** Original paragraph-property tokens accepted by the Calc style context. */
export const cellAsianParagraphTokens = properties.map(
  /** Collects the token from its original property mapping. @param property - Property tuple. @returns Token. */
  ([token]) => token,
);

/** Exports explicitly set Asian typography attributes from the native paragraph item group.
 * @param pattern - Original cell pattern.
 * @param converter - Shared property converter.
 * @returns Serialized attributes.
 */
export function exportCellAsianParagraphProperties(
  pattern: ScPatternAttr,
  converter: SvXMLUnitConverter,
): string {
  let attrs = "";
  const value = new Any();
  const lexical: [string] = [""];
  const items = pattern.GetItemSet();
  try {
    for (const [, name, which, handler] of properties) {
      const item = items.GetItemIfSet(which, false) as SfxBoolItem | undefined;
      if (item?.QueryValue(value) && handler.exportXML(lexical, value, converter))
        attrs += ` style:${name}="${lexical[0]}"`;
    }
    return attrs;
  } finally {
    value.dispose();
  }
}

/** Imports the original paragraph attributes into concrete pooled bool item clones.
 * @param pattern - Original cell pattern.
 * @param attributes - Actual SAX attributes.
 * @param converter - Shared property converter.
 * @param unsupported - Existing diagnostic sink.
 * @returns Nothing.
 */
export function importCellAsianParagraphProperties(
  pattern: ScPatternAttr,
  attributes: FastAttributeList,
  converter: SvXMLUnitConverter,
  unsupported: (name: string) => void,
): void {
  const value = new Any();
  try {
    for (const [token, name, which, handler] of properties) {
      const lexical = attributes.get(token);
      if (lexical === null) continue;
      if (!handler.importXML(lexical, value, converter)) {
        unsupported(`invalid cell paragraph style:${name}`);
        continue;
      }
      const item = (pattern.GetItem(which) as SfxBoolItem).Clone();
      item.PutValue(value, 0);
      pattern.ItemSetPut(item);
    }
  } finally {
    value.dispose();
  }
}
