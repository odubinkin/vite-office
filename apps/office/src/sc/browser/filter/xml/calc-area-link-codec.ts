/** @fileoverview Restores the native ordered area links at the ODS Worker boundary. */
import { SvBaseLinkObjectType } from "../../../../sfx2/source/appl/lnkbase2";
import { ScRange } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { ScAreaLink } from "../../../source/ui/docshell/arealink";

/** Native destination endpoints in address order. */
type AreaDestination = ReturnType<ScRange["GetVars"]>;

/** Primitive version-one Worker state for one native ScAreaLink. */
export interface CalcAreaLinkRecord {
  readonly file: string;
  readonly filter: string;
  readonly options: string;
  readonly source: string;
  readonly destination: Readonly<AreaDestination>;
  readonly refresh: number;
}

/** Exposes one native link as Worker-owned primitives. @param link - Canonical area link. @returns Transfer state. */
export function encodeCalcAreaLink(link: ScAreaLink): CalcAreaLinkRecord {
  return {
    file: link.GetFile(),
    filter: link.GetFilter(),
    options: link.GetOptions(),
    source: link.GetSource(),
    destination: link.GetDestArea().GetVars(),
    refresh: link.GetRefreshDelaySeconds(),
  };
}

/** Restores the original registration at an already-created destination sheet. @param document - Workbook. @param record - Transport data. */
export function decodeCalcAreaLink(document: ScDocument, record: CalcAreaLinkRecord): void {
  if (
    !record ||
    typeof record.file !== "string" ||
    !record.file ||
    typeof record.filter !== "string" ||
    !record.filter ||
    typeof record.options !== "string" ||
    typeof record.source !== "string" ||
    !record.source ||
    !Number.isInteger(record.refresh) ||
    record.refresh < 0 ||
    record.refresh > 2147483647 ||
    !Array.isArray(record.destination) ||
    record.destination.length !== 6 ||
    record.destination.some(
      /** Validates the native signed coordinate boundary. @param value - Coordinate. @returns Whether invalid. */
      (value) => !Number.isInteger(value) || (value | 0) !== value,
    )
  )
    throw new Error("Calc Worker area link is invalid.");
  const [col, row, tab, endCol, endRow, endTab] = record.destination;
  if (!document.ValidColRow(col, row) || !document.FetchTable(tab) || tab !== endTab)
    throw new Error("Calc Worker area-link destination is invalid.");
  const destination = new ScRange(col, row, tab, endCol, endRow, tab);
  const link = new ScAreaLink(
    record.file,
    record.filter,
    record.options,
    record.source,
    destination,
    record.refresh,
  );
  document
    .GetLinkManager()
    .InsertFileLink(
      link,
      SvBaseLinkObjectType.ClientFile,
      record.file,
      record.filter,
      record.source,
    );
}
