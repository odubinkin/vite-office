/** @fileoverview Restores ODF text-style items and cell text span ranges on the native Calc editor. */
import type { EditTextObject } from "../../../../editeng/inc/editobj";
import { ESelection } from "../../../../editeng/inc/ESelection";
import { EE_CHAR_ESCAPEMENT } from "../../../../editeng/inc/eeitem";
import { SvxEscapementItem } from "../../../../editeng/source/items/textitem.escapement";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { ScPatternAttr } from "../../../inc/patattr";
import type { FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { importTextCharacterProperties } from "../../../../xmloff/source/text/txtprmap";
import type { ScXMLImport } from "./xmlimprt";
import { importCellTextProperties } from "./xmlstyle";
import type { CellTextParagraph } from "./xmlexprt.celltext";

/** Parses a text-style property list into the native edit item set. @param importer - Actual ODF importer. @param attributes - Native lexical attributes. @param items - Destination edit items. @returns Nothing. */
export function importCellTextStyle(
  importer: ScXMLImport,
  attributes: FastAttributeList,
  items: SfxItemSet,
): void {
  const pattern = new ScPatternAttr(importer.GetDocument().getCellAttributeHelper());
  try {
    importCellTextProperties(
      pattern,
      attributes,
      /** Reports the normal ODF property diagnostic. @param name - Unsupported property. @returns Nothing. */
      (name) => importer.unsupported(name),
      /** Resolves the package font declaration. @param name - Font name. @returns Borrowed item. */
      (name) => importer.GetFontFace(name),
      true,
    );
    pattern.FillDirectEditItemSet(items);
    const position = importTextCharacterProperties(attributes);
    if (position.escapement !== undefined || position.escapementHeight !== undefined)
      items.Put(
        new SvxEscapementItem(
          position.escapement ?? 0,
          position.escapementHeight ?? 100,
          EE_CHAR_ESCAPEMENT,
        ),
        true,
      );
  } finally {
    pattern.Dispose();
  }
}

/** Restores the cell's paragraph content and span formatting on the actual Calc editor. @param importer - Owner of text styles and editor. @param paragraphs - Decoded cell spans. @returns Owned edit object. */
export function createCellEditText(
  importer: ScXMLImport,
  paragraphs: readonly CellTextParagraph[],
): EditTextObject {
  let value = "";
  const selection = new ESelection();
  const ranges: { style: string; selection: ESelection }[] = [];
  for (const paragraph of paragraphs) {
    for (const [span, style] of paragraph) {
      value += span;
      selection.CollapseToEnd();
      const lastBreak = span.lastIndexOf("\n");
      if (lastBreak < 0) selection.end.nIndex += span.length;
      else {
        for (let i = span.indexOf("\n"); i >= 0; i = span.indexOf("\n", i + 1))
          ++selection.end.nPara;
        selection.end.nIndex = span.length - lastBreak - 1;
      }
      if (style && span) ranges.push({ style, selection: new ESelection(selection) });
    }
    value += "\n";
    ++selection.end.nPara;
    selection.end.nIndex = 0;
  }
  const input = unicode(value.slice(0, -1));
  const engine = importer.GetDocument().GetEditEngine();
  try {
    engine.SetTextCurrentDefaults(input);
    for (const range of ranges) {
      const items = importer.GetTextStyle(range.style);
      if (items) engine.QuickSetAttribs(items, range.selection);
    }
    return engine.CreateTextObject();
  } finally {
    input.dispose();
  }
}
