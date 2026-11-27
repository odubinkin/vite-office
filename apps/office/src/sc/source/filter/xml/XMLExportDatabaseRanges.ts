/** @fileoverview Writes native database range and query parameters to Calc ODS. */
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SearchParam } from "../../../../unotools/source/i18n/textsearch";
import { escapeXml } from "../../../../xmloff/source/text/txtparae";
import { ScAddress, ScRange, ScRefFlags } from "../../../inc/address";
import type { ScDBData } from "../../../inc/dbdata";
import type { ScDocument } from "../../../inc/document";
import { ScQueryConnect, ScQueryOp } from "../../../inc/global";
import { STR_DB_GLOBAL_NONAME, STR_DB_LOCAL_NONAME } from "../../../inc/globalnames";
import type { ScDBQueryItem, ScQueryParam, ScQueryParamEntry } from "../../core/tool/queryparam";
import { ScRangeStringConverter } from "../../core/tool/rangeutl";
import { queryOps } from "./xmlfilti";

const ooo = FormulaGrammar.AddressConvention.CONV_OOO;
const queryOperatorTokens = new Map<ScQueryOp, string>();
for (const [token, operation] of queryOps) queryOperatorTokens.set(operation, token);

/** Computes the condition's legacy string source for multi-item serialization. @param item - Filter item. @returns Lexical value. */
function lexicalValue(item: ScDBQueryItem): string {
  return item.type === "number" ? (item.lexical ?? "") : item.value;
}

/** Keeps the native equality/pattern and empty-cell token spellings. @param entry - Query condition. @param query - Native query. @returns XML operator. */
function getOperatorXML(entry: ScQueryParamEntry, query: ScQueryParam): string {
  if (entry.empty !== undefined) return entry.empty ? "empty" : "!empty";
  if (query.eSearchType === SearchParam.SearchType.Regexp) {
    if (entry.eOp === ScQueryOp.SC_EQUAL) return "match";
    if (entry.eOp === ScQueryOp.SC_NOT_EQUAL) return "!match";
  }
  return queryOperatorTokens.get(entry.eOp) ?? "=";
}

/** Writes the source numeric, lexical, color or multi-item condition. @param entry - Native condition. @param start - First absolute field. @param query - Query flags. @returns ODF element. */
function writeCondition(entry: ScQueryParamEntry, start: number, query: ScQueryParam): string {
  const item = entry.items[0];
  if (!item) return "";
  const index = ` table:field-number="${entry.nField - start}"`;
  const caseSensitive = query.bCaseSens ? ' table:case-sensitive="true"' : "";
  if (entry.items.length > 1) {
    let children = "";
    for (const value of entry.items)
      children += `<table:filter-set-item table:value="${escapeXml(lexicalValue(value))}"/>`;
    return `<table:filter-condition table:value="${escapeXml(lexicalValue(item))}" table:operator="="${index}${caseSensitive}>${children}</table:filter-condition>`;
  }
  const datatype =
    item.type === "number"
      ? ' table:data-type="number"'
      : item.type === "text-color" || item.type === "background-color"
        ? ` loext:data-type="${item.type}"`
        : "";
  return `<table:filter-condition${datatype} table:value="${escapeXml(String(item.value))}" table:operator="${escapeXml(getOperatorXML(entry, query))}"${index}${caseSensitive}/>`;
}

/** Exports the original flat connector sequence as OR groups of consecutive AND runs. @param query - Query with absolute stored fields. @returns ODF conditions. */
function writeConditions(query: ScQueryParam): string {
  const and = ScQueryConnect.SC_AND;
  const or = ScQueryConnect.SC_OR;
  const start = query.bByRow ? query.nCol1 : query.nRow1;
  let content = "";
  let group = "";
  let groupCount = 0;
  let haveAnd = false;
  let haveOr = false;
  for (const [i, entry] of query.entries.entries()) {
    haveAnd ||= entry.eConnect === and;
    haveOr ||= entry.eConnect === or;
    const condition = writeCondition(entry, start, query);
    if (i && entry.eConnect === or) {
      content += groupCount > 1 ? `<table:filter-and>${group}</table:filter-and>` : group;
      group = "";
      groupCount = 0;
    }
    group += condition;
    groupCount++;
  }
  if (!haveOr) return `<table:filter-and>${group}</table:filter-and>`;
  if (!haveAnd) return `<table:filter-or>${content}${group}</table:filter-or>`;
  if (groupCount > 1) group = `<table:filter-and>${group}</table:filter-and>`;
  return `<table:filter-or>${content}${group}</table:filter-or>`;
}

/** Writes the original base filter fields and output/advanced-source addresses. @param data - Database range. @param doc - Native document. @returns Filter XML. */
function writeFilter(data: ScDBData, doc: ScDocument): string {
  const query = data.GetQueryParam();
  if (!query.entries.length) return "";
  let attributes = "";
  if (!query.bInplace) {
    const destination = new ScAddress(query.nDestCol, query.nDestRow, query.nDestTab);
    const address = destination.Format(
      ScRefFlags.VALID | ScRefFlags.TAB_3D,
      doc,
      new ScAddress.Details(ooo),
    );
    try {
      attributes += ` table:target-range-address="${escapeXml(text(address))}"`;
    } finally {
      address.dispose();
    }
  }
  const advanced = data.GetAdvancedQuerySource();
  if (advanced) {
    const range = ScRangeStringConverter.GetStringFromRangeList([advanced], doc, ooo);
    if (range) attributes += ` table:condition-source-range-address="${escapeXml(range)}"`;
  }
  if (!query.bDuplicate) attributes += ' table:display-duplicates="false"';
  return `<table:filter${attributes}>${writeConditions(query)}</table:filter>`;
}

/** Writes a named or anonymous range from the same native owner. @param name - Export name. @param data - Range data. @param document - Workbook. @returns XML declaration. */
function writeDatabaseRange(name: string, data: ScDBData, document: ScDocument): string {
  const area = data.GetArea(new ScRange());
  const address = ScRangeStringConverter.GetStringFromRangeList([area], document, ooo);
  const query = data.GetQueryParam();
  const imports = data.HasImportSelection() ? ' table:is-selection="true"' : "";
  const auto = data.HasAutoFilter() ? ' table:display-filter-buttons="true"' : "";
  const styles = data.IsKeepFmt() ? ' table:on-update-keep-styles="true"' : "";
  const size = data.IsDoSize() ? ' table:on-update-keep-size="false"' : "";
  const strip = data.IsStripData() ? ' table:has-persistent-data="false"' : "";
  const header = query.bHasHeader ? "" : ' table:contains-header="false"';
  const footer = query.bHasTotals ? ' calcext:contains-footer="true"' : "";
  const orientation = query.bByRow ? "" : ' table:orientation="column"';
  const opening = `<table:database-range table:name="${escapeXml(name)}" table:target-range-address="${escapeXml(address)}"${imports}${auto}${styles}${size}${strip}${header}${footer}${orientation}`;
  const filter = writeFilter(data, document);
  return filter ? `${opening}>${filter}</table:database-range>` : opening + "/>";
}

/** Writes named, global-anonymous and then sheet-anonymous declarations, in native order. @param document - Workbook. @returns ODS fragment. */
export function WriteDatabaseRanges(document: ScDocument): string {
  const collection = document.GetDBCollection();
  let xml = "";
  for (const range of collection.getNamedDBs())
    xml += writeDatabaseRange(range.GetName(), range, document);
  let index = 0;
  for (const range of collection.getAnonDBs())
    xml += writeDatabaseRange(STR_DB_GLOBAL_NONAME + ++index, range, document);
  for (let tab = 0; tab < document.GetTableCount(); tab++) {
    const range = document.GetAnonymousDBData(tab);
    if (range) xml += writeDatabaseRange(STR_DB_LOCAL_NONAME + tab, range, document);
  }
  return xml ? "<table:database-ranges>" + xml + "</table:database-ranges>" : "";
}
