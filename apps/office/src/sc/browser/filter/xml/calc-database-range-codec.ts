/** @fileoverview Cloneable transfer of native Calc database range owners and query records. */
import { SearchParam } from "../../../../unotools/source/i18n/textsearch";
import { ScRange } from "../../../inc/address";
import { ScDBData, ScDBRangeType } from "../../../inc/dbdata";
import type { ScDocument } from "../../../inc/document";
import { ScQueryConnect, ScQueryOp } from "../../../inc/global";
import {
  ScQueryParam,
  type ScDBQueryItem,
  type ScQueryParamEntry,
} from "../../../source/core/tool/queryparam";
import { AdoptDatabaseRange } from "../../../source/filter/xml/xmldrani";

/** Native database area coordinates. */
type Area = ReturnType<ScRange["GetVars"]>;
/** Native query values without its member functions. */
type Query = Omit<ScQueryParam, "Clone">;

/** One detached range and its owning collection category. */
interface DatabaseRangeRecord {
  readonly type: ScDBRangeType;
  readonly name: string;
  readonly area: Area;
  readonly index: number;
  readonly query: Query;
  readonly advanced?: Area;
  readonly autoFilter: boolean;
  readonly keepFormat: boolean;
  readonly moveCells: boolean;
  readonly stripData: boolean;
  readonly selection: boolean;
}

/** Optional version-one extension, preserving name indices and allocation state. */
export interface CalcDatabaseRangesRecord {
  readonly nextIndex: number;
  readonly ranges: readonly DatabaseRangeRecord[];
}

/** Copies one native database range into detached version-one values. @param type - Range owner. @param data - Native data. @returns Cloneable data. */
function encodeRange(type: ScDBRangeType, data: ScDBData): DatabaseRangeRecord {
  const advanced = data.GetAdvancedQuerySource();
  return {
    type,
    name: data.GetName(),
    area: data.GetArea().GetVars(),
    index: data.GetIndex(),
    query: { ...data.GetQueryParam() },
    ...(advanced ? { advanced: advanced.GetVars() } : {}),
    autoFilter: data.HasAutoFilter(),
    keepFormat: data.IsKeepFmt(),
    moveCells: data.IsDoSize(),
    stripData: data.IsStripData(),
    selection: data.HasImportSelection(),
  };
}

/** Copies the workbook and sheet range owners in native order. @param document - Workbook. @returns Optional graph extension. */
export function encodeCalcDatabaseRanges(
  document: ScDocument,
): CalcDatabaseRangesRecord | undefined {
  const collection = document.GetDBCollection(),
    named = collection.getNamedDBs();
  const ranges: DatabaseRangeRecord[] = [];
  for (const range of named) ranges.push(encodeRange(ScDBRangeType.GlobalNamed, range));
  for (const range of collection.getAnonDBs())
    ranges.push(encodeRange(ScDBRangeType.GlobalAnonymous, range));
  for (let tab = 0; tab < document.GetTableCount(); tab++) {
    const range = document.GetAnonymousDBData(tab);
    if (range) ranges.push(encodeRange(ScDBRangeType.SheetAnonymous, range));
  }
  const nextIndex = named.GetNextIndex();
  return ranges.length || nextIndex !== 1 ? { nextIndex, ranges } : undefined;
}

/** Validates and constructs a transferred area. @param document - Target workbook. @param area - Coordinates. @returns Native range. */
function decodeArea(document: ScDocument, area: Area): ScRange {
  if (!Array.isArray(area) || area.length !== 6 || !area.every(Number.isInteger))
    throw new Error("Calc worker database area is invalid.");
  const [col, row, tab, endCol, endRow, endTab] = area;
  if (
    !document.FetchTable(tab) ||
    !document.FetchTable(endTab) ||
    !document.ValidColRow(col, row) ||
    !document.ValidColRow(endCol, endRow)
  )
    throw new Error("Calc worker database area is outside the workbook.");
  return new ScRange(col, row, tab, endCol, endRow, endTab);
}

/** Validates the native query item union. @param item - Transfer item. @returns Whether valid. */
function validItem(item: ScDBQueryItem): boolean {
  if (!item || typeof item !== "object") return false;
  switch (item.type) {
    case "number":
      return (
        Number.isFinite(item.value) &&
        (item.lexical === undefined || typeof item.lexical === "string")
      );
    case "string":
    case "date":
    case "text-color":
    case "background-color":
      return typeof item.value === "string";
    default:
      return false;
  }
}

/** Validates one detached native condition. @param entry - Query entry. @returns Whether valid. */
function validEntry(entry: ScQueryParamEntry): boolean {
  return (
    Boolean(entry) &&
    Number.isInteger(entry.nField) &&
    (entry.eConnect === ScQueryConnect.SC_AND || entry.eConnect === ScQueryConnect.SC_OR) &&
    Number.isInteger(entry.eOp) &&
    entry.eOp >= ScQueryOp.SC_EQUAL &&
    entry.eOp <= ScQueryOp.SC_DOES_NOT_END_WITH &&
    (entry.empty === undefined || typeof entry.empty === "boolean") &&
    Array.isArray(entry.items) &&
    entry.items.length > 0 &&
    entry.items.every(validItem)
  );
}

/** Copies native query flags and their ordered criteria. @param document - Native document. @param record - Detached query. @returns Native query. */
function decodeQuery(document: ScDocument, record: Query): ScQueryParam {
  if (
    !record ||
    typeof record !== "object" ||
    [
      record.bByRow,
      record.bHasHeader,
      record.bHasTotals,
      record.bInplace,
      record.bCaseSens,
      record.bDuplicate,
      record.bDestPers,
    ].some(
      /** Validates an original query flag. @param flag - Wire value. @returns Invalid flag. */
      (flag) => typeof flag !== "boolean",
    ) ||
    (record.eSearchType !== SearchParam.SearchType.Normal &&
      record.eSearchType !== SearchParam.SearchType.Regexp &&
      record.eSearchType !== SearchParam.SearchType.Wildcard) ||
    ![record.nDestCol, record.nDestRow, record.nDestTab].every(Number.isInteger) ||
    (!record.bInplace &&
      (!document.ValidColRow(record.nDestCol, record.nDestRow) ||
        !document.FetchTable(record.nDestTab))) ||
    !Array.isArray(record.entries) ||
    !record.entries.every(validEntry)
  )
    throw new Error("Calc worker database filter is invalid.");
  return Object.assign(new ScQueryParam(), record);
}

/** Restores all original owners and their sparse auto-filter flags. @param document - Target workbook with sheets. @param record - Transfer extension. */
export function decodeCalcDatabaseRanges(
  document: ScDocument,
  record: CalcDatabaseRangesRecord,
): void {
  if (
    !record ||
    !Array.isArray(record.ranges) ||
    !Number.isSafeInteger(record.nextIndex) ||
    record.nextIndex < 1
  )
    throw new Error("Calc worker database range collection is invalid.");
  for (const entry of record.ranges as readonly DatabaseRangeRecord[]) {
    if (
      !entry ||
      typeof entry.name !== "string" ||
      ![
        ScDBRangeType.GlobalNamed,
        ScDBRangeType.GlobalAnonymous,
        ScDBRangeType.SheetAnonymous,
      ].includes(entry.type) ||
      !Number.isInteger(entry.index) ||
      entry.index < 0 ||
      entry.index > 0xffff ||
      [entry.autoFilter, entry.keepFormat, entry.moveCells, entry.stripData, entry.selection].some(
        /** Validates an original database flag. @param flag - Wire value. @returns Invalid flag. */
        (flag) => typeof flag !== "boolean",
      )
    )
      throw new Error("Calc worker database range is invalid.");
    const query = decodeQuery(document, entry.query);
    const range = new ScDBData(
      entry.name,
      decodeArea(document, entry.area),
      query.bByRow,
      query.bHasHeader,
      query.bHasTotals,
    );
    range.SetIndex(entry.index);
    range.SetAutoFilter(entry.autoFilter);
    range.SetKeepFmt(entry.keepFormat);
    range.SetDoSize(entry.moveCells);
    range.SetStripData(entry.stripData);
    range.SetImportSelection(entry.selection);
    range.SetQueryParam(query);
    if (entry.advanced) range.SetAdvancedQuerySource(decodeArea(document, entry.advanced));
    AdoptDatabaseRange(document, range, entry.type);
  }
  document.GetDBCollection().getNamedDBs().SetNextIndex(record.nextIndex);
}
