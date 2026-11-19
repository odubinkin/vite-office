/** @fileoverview XLSX export string and run collection from native Calc cells. */
import type { Section } from "../../../../editeng/inc/section";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { ScAddress } from "../../../inc/address";
import type { ScRefCellValue } from "../../../inc/cellvalue";
import type { ScDocument } from "../../../inc/document";
import { EXC_FONT_NOTFOUND } from "../inc/xlstyle";
import { XclExpString } from "./xestring";
import type { XclExpFontBuffer } from "./xestyle.xml";

/** Collects a native string, preserving displayed field text in the existing text path. @param document - Workbook. @param cell - Cell value. @returns Cell text. */
function getCellText(document: ScDocument, cell: ScRefCellValue): string {
  const value = cell.getSharedString();
  if (value) return text(value.getString());
  const edit = cell.getEditText();
  if (!edit) return "";
  const engine = document.GetEditEngine();
  engine.SetText(edit);
  const paragraphs: string[] = [];
  for (let index = 0; index < edit.GetParagraphCount(); ++index) {
    const paragraph = engine.GetParagraphText(index);
    try {
      paragraphs.push(text(paragraph));
    } finally {
      paragraph.dispose();
    }
  }
  return paragraphs.join("\n");
}

/** Builds the indexed Excel string from real EditTextObject sections. @param document - Workbook. @param address - Cell address. @param cell - Current value. @param fonts - Workbook font table. @returns Excel export string. */
export function CreateString(
  document: ScDocument,
  address: ScAddress,
  cell: ScRefCellValue,
  fonts: XclExpFontBuffer,
): XclExpString {
  const value = unicode(getCellText(document, cell));
  try {
    const result = new XclExpString(value);
    const edit = cell.getEditText();
    if (!edit || edit.HasField()) return result;
    const sections: Section[] = [];
    edit.GetAllSections(sections);
    const base =
      document.GetPattern(address) ?? document.getCellAttributeHelper().getDefaultCellAttribute();
    let paragraph = 0;
    let offset = 0;
    for (const section of sections) {
      while (paragraph < section.mnParagraph) offset += edit.GetTextLen(paragraph++) + 1;
      const start = offset + section.mnStart;
      if (start >= result.Len()) break;
      if (section.maAttributes.length > 0)
        result.AppendFormat(
          start,
          fonts.InsertEditFont(base, edit.GetPool(), section.maAttributes),
        );
      else if (result.IsRich()) result.AppendFormat(start, EXC_FONT_NOTFOUND);
    }
    return result;
  } finally {
    value.dispose();
  }
}
