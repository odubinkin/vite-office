/** @fileoverview Browser graph transfer for the native Calc consolidation parameter. */
import { MAXTAB } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { ScSubTotalFunc } from "../../../inc/global";
import { ScConsolidateParam } from "../../../source/core/data/global2";
import { ScArea } from "../../../source/core/tool/rangeutl";

/** Realm-neutral consolidation settings in original source-area order. */
export interface CalcConsolidationRecord {
  readonly target: readonly [column: number, row: number, sheet: number];
  readonly areas: readonly (readonly [
    sheet: number,
    left: number,
    top: number,
    right: number,
    bottom: number,
  ])[];
  readonly operation: ScSubTotalFunc;
  readonly byColumn: boolean;
  readonly byRow: boolean;
  readonly referenceData: boolean;
}

/** Transfers native destination and source coordinates. @param params - Native document settings. @returns Worker record. */
export function encodeConsolidation(params: ScConsolidateParam): CalcConsolidationRecord {
  return {
    target: [params.nCol, params.nRow, params.nTab],
    areas: params.pDataAreas.map(
      /** Copies one native area. @param area - Source area. @returns Original coordinates. */
      (area) => [area.nTab, area.nColStart, area.nRowStart, area.nColEnd, area.nRowEnd],
    ),
    operation: params.eFunction,
    byColumn: params.bByCol,
    byRow: params.bByRow,
    referenceData: params.bReferenceData,
  };
}

/** Restores real model parameters before adopting the document. @param document - Destination. @param record - Graph value. @returns Restored settings. */
export function decodeConsolidation(
  document: ScDocument,
  record: CalcConsolidationRecord,
): ScConsolidateParam {
  /** Admits the native address domain independently of current sheet existence. @param sheet - Stored sheet index. @returns Whether representable. */
  function validSheet(sheet: number): boolean {
    return Number.isInteger(sheet) && sheet >= 0 && sheet <= MAXTAB;
  }
  /** Checks a Worker coordinate before applying native bounds. @param column - Column. @param row - Row. @returns Whether representable. */
  function validCell(column: number, row: number): boolean {
    return Number.isInteger(column) && Number.isInteger(row) && document.ValidColRow(column, row);
  }
  if (
    !record ||
    !Array.isArray(record.target) ||
    record.target.length !== 3 ||
    !Array.isArray(record.areas) ||
    record.areas.length > 0xffff ||
    !Number.isInteger(record.operation) ||
    !Object.values(ScSubTotalFunc).includes(record.operation) ||
    typeof record.byColumn !== "boolean" ||
    typeof record.byRow !== "boolean" ||
    typeof record.referenceData !== "boolean"
  )
    throw new Error("Calc worker consolidation is invalid.");
  const [column, row, sheet] = record.target;
  if (!validCell(column, row) || !validSheet(sheet))
    throw new Error("Calc worker consolidation target is invalid.");
  const params = new ScConsolidateParam();
  params.nCol = column;
  params.nRow = row;
  params.nTab = sheet;
  params.eFunction = record.operation;
  params.bByCol = record.byColumn;
  params.bByRow = record.byRow;
  params.bReferenceData = record.referenceData;
  params.SetAreas(
    record.areas.map(
      /** Rehydrates one original area. @param area - Worker coordinates. @returns Native area. */
      (area) => {
        if (!Array.isArray(area) || area.length !== 5)
          throw new Error("Calc worker consolidation source area is invalid.");
        const [tab, left, top, right, bottom] = area;
        if (!validSheet(tab) || !validCell(left, top) || !validCell(right, bottom))
          throw new Error("Calc worker consolidation source area is invalid.");
        return new ScArea(tab, left, top, right, bottom);
      },
    ),
  );
  return params;
}
