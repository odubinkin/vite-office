/** @fileoverview Detached native database sort and subtotal descriptor values for the Calc Worker. */
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { ScDBData } from "../../../inc/dbdata";
import type { ScDocument } from "../../../inc/document";
import { ScSubTotalFunc } from "../../../inc/global";
import { ScSortKeyState, ScSortNumberBehavior } from "../../../source/core/data/sortparam";
import { MAXSUBTOTAL, ScSubTotalParam } from "../../../source/core/data/subtotalparam";

/** Optional persisted sort values, with area and orientation owned by the database range. */
interface CalcDatabaseSortRecord {
  readonly formats: boolean;
  readonly caseSensitive: boolean;
  readonly userList?: number;
  readonly destination?: readonly [number, number, number];
  readonly behavior: ScSortNumberBehavior;
  readonly locale: readonly [string, string, string];
  readonly algorithm: string;
  readonly keys: readonly Pick<ScSortKeyState, "nField" | "bAscending" | "bDoSort">[];
}

/** Original subtotal group flags and ordered aggregation columns. */
interface CalcDatabaseSubtotalRecord {
  readonly fields: Readonly<
    Pick<
      ScSubTotalParam,
      | "nUserIndex"
      | "bRemoveOnly"
      | "bReplace"
      | "bPagebreak"
      | "bCaseSens"
      | "bDoSort"
      | "bSummaryBelow"
      | "bAscending"
      | "bUserDef"
      | "bIncludePattern"
      | "bGroupedBy"
      | "bHasHeader"
    >
  >;
  readonly groups: readonly {
    readonly active: boolean;
    readonly field: number;
    readonly totals: readonly (readonly [number, ScSubTotalFunc])[];
  }[];
}

/** Optional backward-compatible descriptors on the existing range record. */
export interface CalcDatabaseDescriptors {
  readonly sort?: CalcDatabaseSortRecord;
  readonly subtotal?: CalcDatabaseSubtotalRecord;
}

/** Copies active native database descriptors without transporting owned objects. @param owner - Database range. @returns Optional detached fields. */
export function encodeDatabaseDescriptors(owner: ScDBData): CalcDatabaseDescriptors {
  const sort = owner.GetSortParam();
  const subtotal = owner.GetSubTotalParam();
  try {
    const { aCollatorLocale: locale } = sort;
    const sortRecord: CalcDatabaseSortRecord | undefined = sort.maKeyState.some(
      /** Admits original active sort metadata. @param key - Native field. @returns Whether active. */
      (key) => key.bDoSort,
    )
      ? {
          formats: sort.aDataAreaExtras.mbCellFormats,
          caseSensitive: sort.bCaseSens,
          ...(sort.bUserDef ? { userList: sort.nUserIndex } : {}),
          ...(sort.bInplace
            ? {}
            : { destination: [sort.nDestCol, sort.nDestRow, sort.nDestTab] as const }),
          behavior: sort.eSortNumberBehavior,
          locale: [text(locale.Language), text(locale.Country), text(locale.Variant)],
          algorithm: sort.aCollatorAlgorithm,
          keys: sort.maKeyState.map(
            /** Copies a sort field. @param key - Native key state. @returns Detached values. */
            ({ nField, bDoSort, bAscending }) => ({ nField, bDoSort, bAscending }),
          ),
        }
      : undefined;
    const { aGroups } = subtotal;
    const fields = {
      nUserIndex: subtotal.nUserIndex,
      bRemoveOnly: subtotal.bRemoveOnly,
      bReplace: subtotal.bReplace,
      bPagebreak: subtotal.bPagebreak,
      bCaseSens: subtotal.bCaseSens,
      bDoSort: subtotal.bDoSort,
      bSummaryBelow: subtotal.bSummaryBelow,
      bAscending: subtotal.bAscending,
      bUserDef: subtotal.bUserDef,
      bIncludePattern: subtotal.bIncludePattern,
      bGroupedBy: subtotal.bGroupedBy,
      bHasHeader: subtotal.bHasHeader,
    };
    const subtotalRecord: CalcDatabaseSubtotalRecord | undefined = aGroups.some(
      /** Admits original active group metadata. @param group - Native group. @returns Whether active. */
      (group) => group.bActive,
    )
      ? {
          fields,
          groups: aGroups.map(
            /** Copies a group without retaining its owner. @param group - Native group. @returns Detached group. */
            (group) => ({
              active: group.bActive,
              field: group.nField,
              totals: group.pSubTotals.map(
                /** Copies each associated subtotal pair. @param pair - Native function operand. @returns Detached operand. */
                ([column, operation]) => [column, operation],
              ),
            }),
          ),
        }
      : undefined;
    return {
      ...(sortRecord ? { sort: sortRecord } : {}),
      ...(subtotalRecord ? { subtotal: subtotalRecord } : {}),
    };
  } finally {
    sort.Dispose();
  }
}

/** Rebinds optional database descriptors after reading the area and orientation. @param owner - Receiving range. @param document - Native workbook. @param record - Detached descriptors. @returns Nothing. */
export function decodeDatabaseDescriptors(
  owner: ScDBData,
  document: ScDocument,
  record: CalcDatabaseDescriptors,
): void {
  if (record.sort !== undefined) decodeSort(owner, document, record.sort);
  if (record.subtotal !== undefined) decodeSubtotal(owner, record.subtotal);
}

/** Restores original locale, active keys and validated copy destination. @param owner - Receiving range. @param document - Native workbook. @param record - Detached sort descriptor. @returns Nothing. */
function decodeSort(owner: ScDBData, document: ScDocument, record: CalcDatabaseSortRecord): void {
  if (
    !record ||
    typeof record.formats !== "boolean" ||
    typeof record.caseSensitive !== "boolean" ||
    (record.userList !== undefined &&
      (!Number.isInteger(record.userList) || record.userList < 0 || record.userList > 0xffff)) ||
    ![
      ScSortNumberBehavior.ALPHA_NUMERIC,
      ScSortNumberBehavior.DOUBLE,
      ScSortNumberBehavior.INTEGER,
    ].includes(record.behavior) ||
    !Array.isArray(record.locale) ||
    record.locale.length !== 3 ||
    record.locale.some(
      /** Checks the original locale's three detached strings. @param entry - Locale field. @returns Whether invalid. */
      (entry) => typeof entry !== "string",
    ) ||
    typeof record.algorithm !== "string" ||
    !Array.isArray(record.keys)
  )
    throw new Error("Calc worker database sort descriptor is invalid.");
  const sort = owner.GetSortParam();
  try {
    sort.aDataAreaExtras.mbCellFormats = record.formats;
    sort.bCaseSens = record.caseSensitive;
    sort.bUserDef = record.userList !== undefined;
    sort.nUserIndex = record.userList ?? 0;
    sort.eSortNumberBehavior = record.behavior;
    sort.aCollatorAlgorithm = record.algorithm;
    sort.maKeyState = [];
    for (const key of record.keys as readonly CalcDatabaseSortRecord["keys"][number][]) {
      if (
        !key ||
        !Number.isInteger(key.nField) ||
        typeof key.bAscending !== "boolean" ||
        typeof key.bDoSort !== "boolean"
      )
        throw new Error("Calc worker database sort key is invalid.");
      sort.maKeyState.push(Object.assign(new ScSortKeyState(), key));
    }
    if (record.destination !== undefined) {
      if (
        !Array.isArray(record.destination) ||
        record.destination.length !== 3 ||
        !record.destination.every(Number.isInteger)
      )
        throw new Error("Calc worker database sort destination is invalid.");
      const [column, row, tab] = record.destination;
      if (!document.ValidColRow(column, row) || !document.FetchTable(tab))
        throw new Error("Calc worker database sort destination is outside the workbook.");
      sort.bInplace = false;
      sort.nDestTab = tab;
      sort.nDestRow = row;
      sort.nDestCol = column;
    }
    const language = unicode(record.locale[0]);
    const country = unicode(record.locale[1]);
    const variant = unicode(record.locale[2]);
    try {
      sort.aCollatorLocale.Language = language;
      sort.aCollatorLocale.Country = country;
      sort.aCollatorLocale.Variant = variant;
    } finally {
      variant.dispose();
      country.dispose();
      language.dispose();
    }
    owner.SetSortParam(sort);
  } finally {
    sort.Dispose();
  }
}

/** Recreates the original fixed group slots and verifies transferred field functions. @param owner - Receiving range. @param record - Detached subtotal descriptor. @returns Nothing. */
function decodeSubtotal(owner: ScDBData, record: CalcDatabaseSubtotalRecord): void {
  if (
    !record ||
    !record.fields ||
    !Array.isArray(record.groups) ||
    record.groups.length !== MAXSUBTOTAL
  )
    throw new Error("Calc worker database subtotal descriptor is invalid.");
  const result = new ScSubTotalParam();
  const { fields } = record;
  for (const field of [
    "bRemoveOnly",
    "bReplace",
    "bPagebreak",
    "bCaseSens",
    "bDoSort",
    "bSummaryBelow",
    "bAscending",
    "bUserDef",
    "bIncludePattern",
    "bGroupedBy",
    "bHasHeader",
  ] as const) {
    if (typeof fields[field] !== "boolean")
      throw new Error("Calc worker database subtotal option is invalid.");
    result[field] = fields[field];
  }
  if (!Number.isInteger(fields.nUserIndex) || fields.nUserIndex < 0 || fields.nUserIndex > 0xffff)
    throw new Error("Calc worker database subtotal list index is invalid.");
  result.nUserIndex = fields.nUserIndex;
  for (const [index, entry] of (record.groups as CalcDatabaseSubtotalRecord["groups"]).entries()) {
    const group = result.aGroups[index];
    if (
      !group ||
      !entry ||
      typeof entry.active !== "boolean" ||
      !Number.isInteger(entry.field) ||
      !Array.isArray(entry.totals)
    )
      throw new Error("Calc worker database subtotal group is invalid.");
    group.bActive = entry.active;
    group.nField = entry.field;
    for (const pair of entry.totals as CalcDatabaseSubtotalRecord["groups"][number]["totals"]) {
      if (
        !Array.isArray(pair) ||
        pair.length !== 2 ||
        !Number.isInteger(pair[0]) ||
        !Number.isInteger(pair[1]) ||
        pair[1] < ScSubTotalFunc.NONE ||
        pair[1] > ScSubTotalFunc.MED
      )
        throw new Error("Calc worker database subtotal field is invalid.");
      group.pSubTotals.push([pair[0], pair[1]]);
    }
  }
  owner.SetSubTotalParam(result);
}
