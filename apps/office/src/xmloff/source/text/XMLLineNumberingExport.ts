/** @fileoverview Emits supported ODF line numbering at the pinned XMLLineNumberingExport boundary. */

import { escapeXml } from "./txtparae";
import type { OdfLineNumberingConfiguration } from "./XMLLineNumberingImportContext";
import { SvXMLUnitConverter } from "../core/xmluconv";

/** Exports the document-level line-number configuration, including upstream omission defaults. @param value - Settings. @returns ODF XML element. */
export function exportLineNumberingConfiguration(
  value: OdfLineNumberingConfiguration & {
    readonly countBy: number;
    readonly dividerCountBy: number;
  },
): string {
  const converter = new SvXMLUnitConverter("mm100");
  const letterSync = SvXMLUnitConverter.convertNumLetterSync(value.numberingType);
  const attributes = [
    ...(value.charStyleName ? [`text:style-name="${escapeXml(value.charStyleName)}"`] : []),
    ...(value.paintLineNumbers ? [] : ['text:number-lines="false"']),
    ...(value.countBlankLines ? [] : ['text:count-empty-lines="false"']),
    ...(value.countInFlys ? ['text:count-in-text-boxes="true"'] : []),
    ...(value.restartEachPage ? ['text:restart-on-page="true"'] : []),
    ...(value.distance === 0
      ? []
      : [`text:offset="${converter.convertMeasureToXML(value.distance)}"`]),
    `style:num-format="${escapeXml(converter.convertNumFormat(value.numberingType))}"`,
    ...(letterSync ? [`style:num-letter-sync="${letterSync}"`] : []),
    `text:number-position="${value.position}"`,
    `text:increment="${(value.countBy << 16) >> 16}"`,
  ];
  const separator =
    value.divider.length === 0
      ? ""
      : `<text:linenumbering-separator text:increment="${(value.dividerCountBy << 16) >> 16}">${escapeXml(value.divider)}</text:linenumbering-separator>`;
  return `<text:linenumbering-configuration ${attributes.join(" ")}>${separator}</text:linenumbering-configuration>`;
}
