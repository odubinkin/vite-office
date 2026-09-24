/** @fileoverview Emits supported ODF line numbering at the pinned XMLLineNumberingExport boundary. */

import { escapeXml } from "./txtparae";
import type { OdfLineNumberingConfiguration } from "./XMLLineNumberingImportContext";

/** Exports the document-level line-number configuration, including upstream omission defaults. @param value - Settings. @returns ODF XML element. */
export function exportLineNumberingConfiguration(value: OdfLineNumberingConfiguration): string {
  const attributes = [
    ...(value.paintLineNumbers ? [] : ['text:number-lines="false"']),
    ...(value.countBlankLines ? [] : ['text:count-empty-lines="false"']),
    ...(value.countInFlys ? ['text:count-in-text-boxes="true"'] : []),
    ...(value.restartEachPage ? ['text:restart-on-page="true"'] : []),
    ...(value.posFromLeft === 0
      ? []
      : [`text:offset="${Number(((value.posFromLeft * 2.54) / 1440).toFixed(4))}cm"`]),
    'style:num-format="1"',
    `text:number-position="${value.position}"`,
    `text:increment="${value.countBy}"`,
  ];
  const separator =
    value.divider.length === 0
      ? ""
      : `<text:linenumbering-separator text:increment="${value.dividerCountBy}">${escapeXml(value.divider)}</text:linenumbering-separator>`;
  return `<text:linenumbering-configuration ${attributes.join(" ")}>${separator}</text:linenumbering-configuration>`;
}
