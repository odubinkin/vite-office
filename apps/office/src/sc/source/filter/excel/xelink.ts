/** @fileoverview XLSX workbook external links and embedded sheet cache export. */
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { OFFICE_DOCUMENT_RELATION } from "../../../../oox/source/core/relations";
import { FSNS, type FastSerializerHelper } from "../../../../sax/inc/fshelper";
import type { ZipFragmentStream } from "../../../../oox/source/helper/zipstorage";
import { FormulaStringToken } from "../../../../formula/inc/token";
import type { ScExternalCacheToken } from "../../ui/docshell/externalrefmgr";
import { FormulaError, GetDoubleErrorValue } from "../../../../formula/inc/errorcodes";
import { errorSymbols } from "../../../../formula/inc/FormulaCompiler";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScAddress, ScRefFlags } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { spreadsheetNamespace } from "../oox/workbookfragment";
import type { XclExpXmlStream } from "./xestream";

/** Writes one typed scalar cached cell. @param xml - Link part. @param row - Cached row. @param col - Cached column. @param value - Native token. @returns Nothing. */
function saveCell(
  xml: FastSerializerHelper,
  row: number,
  col: number,
  value: ScExternalCacheToken,
): void {
  let type = "n",
    content: string;
  if (value instanceof FormulaStringToken) {
    type = "str";
    content = text(value.GetString().getString());
  } else {
    const number = value.GetDouble(),
      error = GetDoubleErrorValue(number);
    if (error === FormulaError.NONE) content = String(number);
    else {
      type = "e";
      content = "#N/A";
      for (const [symbol, code] of errorSymbols) if (code === error) content = symbol;
    }
  }
  const address = new ScAddress(col, row, 0).Format(ScRefFlags.VALID);
  try {
    xml.startElement(token("cell"), token("r"), address, token("t"), type);
    xml.startElement(token("v"));
    xml.writeEscaped(content);
    xml.endElement(token("v"));
    xml.endElement(token("cell"));
  } finally {
    address.dispose();
  }
}

/** Writes the workbook reference list and external book parts in native file ID order. @param output - Workbook package. @param workbook - Workbook fragment. @param document - Actual Calc graph. @returns Nothing. */
export function SaveXmlExternalLinks(
  output: XclExpXmlStream,
  workbook: FastSerializerHelper,
  document: ScDocument,
): void {
  const files = document.GetExternalRefManager().getExternalFiles();
  if (!files.length) return;
  const r = token("r"),
    ns = token("xmlns");
  const relId = FSNS(r, token("id"));
  workbook.startElement(token("externalReferences"));
  for (const [id, file] of files.entries()) {
    const relative = `externalLinks/externalLink${id + 1}.xml`;
    const relation = output.addRelation(
      workbook.getOutputStream() as ZipFragmentStream,
      OFFICE_DOCUMENT_RELATION + "externalLink",
      relative,
    );
    workbook.singleElement(token("externalReference"), relId, relation);
    const xml = output.openFragmentStreamWithSerializer(
      "xl/" + relative,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.externalLink+xml",
    );
    const link = output.addRelation(
      xml.getOutputStream() as ZipFragmentStream,
      OFFICE_DOCUMENT_RELATION + "externalLinkPath",
      file.name,
      true,
    );
    xml.startElement(
      token("externalLink"),
      ns,
      spreadsheetNamespace,
      FSNS(ns, r),
      OFFICE_DOCUMENT_RELATION.slice(0, -1),
    );
    xml.startElement(token("externalBook"), relId, link);
    xml.startElement(token("sheetNames"));
    for (const sheet of file.tables.values())
      xml.singleElement(token("sheetName"), token("val"), sheet.name);
    xml.endElement(token("sheetNames"));
    xml.startElement(token("sheetDataSet"));
    let sheetIndex = 0;
    for (const sheet of file.tables.values()) {
      xml.startElement(token("sheetData"), token("sheetId"), String(sheetIndex++));
      const rows = sheet.cache.entries();
      for (const [row, cells] of [...rows].sort(
        /** Sorts row numbers in source order. @param a - First row. @param b - Second row. @returns Comparison. */
        (a, b) => a[0] - b[0],
      )) {
        xml.startElement(token("row"), token("r"), String(row + 1));
        for (const [col, cell] of [...cells].sort(
          /** Sorts columns in source order. @param a - First column. @param b - Second column. @returns Comparison. */
          (a, b) => a[0] - b[0],
        ))
          saveCell(xml, row, col, cell);
        xml.endElement(token("row"));
      }
      xml.endElement(token("sheetData"));
    }
    xml.endElement(token("sheetDataSet"));
    xml.endElement(token("externalBook"));
    xml.endElement(token("externalLink"));
    xml.endDocument();
  }
  workbook.endElement(token("externalReferences"));
}
