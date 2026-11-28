/** @fileoverview Cloneable transport of loaded native Calc content change actions. */
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { DateTime } from "../../../../tools/source/datetime/datetime";
import { Date } from "../../../../tools/source/datetime/tdate";
import { Time } from "../../../../tools/source/datetime/ttime";
import { ScAddress } from "../../../inc/address";
import { ScBigRange } from "../../../inc/bigrange";
import { ScCellValue } from "../../../inc/cellvalue";
import type { ScDocument } from "../../../inc/document";
import { CellType } from "../../../inc/global";
import {
  ScChangeActionContent,
  ScChangeActionState,
  ScChangeTrack,
} from "../../../source/core/tool/chgtrack";
import { createPreviousCell } from "../../../source/filter/xml/XMLChangeTrackingImportHelper";

/** Native scalar change cell, with null for an empty cell. */
type ScalarCell = number | string | null;

/** Loaded action before connecting its original links. */
interface ContentActionRecord {
  readonly id: number;
  readonly rejecting: number;
  readonly state: ScChangeActionState;
  readonly range: ReturnType<ScBigRange["GetVars"]>;
  readonly user: string;
  readonly date: number;
  readonly time: bigint;
  readonly comment: string;
  readonly oldCell: ScalarCell;
  readonly oldValue: string;
  readonly newCell?: ScalarCell;
  readonly previous: number;
  readonly dependencies: readonly number[];
}

/** Detached workbook change track. */
export interface CalcChangeTrackRecord {
  readonly actions: readonly ContentActionRecord[];
  readonly protection: Uint8Array;
  readonly max: number;
  readonly lastSaved: number;
}

/** Copies a supported scalar value. @param cell - Native cell. @returns Scalar snapshot, or undefined for a non-scalar cell. */
function encodeCell(cell: ScCellValue): ScalarCell | undefined {
  switch (cell.getType()) {
    case CellType.CELLTYPE_NONE:
      return null;
    case CellType.CELLTYPE_VALUE:
      return cell.getDouble();
    case CellType.CELLTYPE_STRING: {
      const shared = cell.getSharedString();
      return shared ? text(shared.getString()) : "";
    }
    default:
      return undefined;
  }
}

/** Encodes the native writable graph without assigning new action IDs. @param document - Workbook. @returns Detached change track, if present. */
export function encodeCalcChangeTrack(document: ScDocument): CalcChangeTrackRecord | undefined {
  const track = document.GetChangeTrack();
  if (!track) return undefined;
  const actions = Array.from(
    track.entries(),
    /** Copies an actual action and its link identities. @param action - Source action. @returns Transfer record. */
    (action): ContentActionRecord => {
      const oldCell = encodeCell(action.GetOldCell());
      if (oldCell === undefined)
        throw new Error("Calc worker cannot transfer a non-scalar previous cell");
      const newCell = encodeCell(action.GetNewCell());
      const timestamp = action.GetDateTimeUTC();
      return {
        id: action.GetActionNumber(),
        rejecting: action.GetRejectingNumber(),
        state: action.GetState(),
        range: action.GetBigRange().GetVars(),
        user: action.GetUser(),
        date: timestamp.GetDate(),
        time: timestamp.GetTime(),
        comment: action.GetComment(),
        oldCell,
        oldValue: action.GetOldValue(),
        ...(newCell !== undefined ? { newCell } : {}),
        previous: action.GetPrevContent()?.GetActionNumber() ?? 0,
        dependencies: action.GetDependents().map(
          /** Reads native action identity. @param dependent - Native linked action. @returns Identity. */
          (dependent) => dependent.GetActionNumber(),
        ),
      };
    },
  );
  return {
    actions,
    protection: track.GetProtection(),
    max: track.GetActionMax(),
    lastSaved: track.GetLastSavedActionNumber(),
  };
}

/** Checks a serialized action number in the supported model. @param id - Target ID. @returns Whether valid. */
function validId(id: number): boolean {
  return Number.isInteger(id) && id >= 0 && id <= 0xffffffff;
}

/** Checks a decoded scalar cell. @param value - Candidate cell. @returns Whether representable. */
function validCell(value: ScalarCell): boolean {
  return value === null || typeof value === "string" || typeof value === "number";
}

/** Restores owned change actions and then resolves original dependency links. @param document - Restored workbook. @param record - Detached track. */
export function decodeCalcChangeTrack(document: ScDocument, record: CalcChangeTrackRecord): void {
  if (
    !record ||
    !Array.isArray(record.actions) ||
    !ArrayBuffer.isView(record.protection) ||
    Object.prototype.toString.call(record.protection) !== "[object Uint8Array]" ||
    !validId(record.max) ||
    !validId(record.lastSaved)
  )
    throw new Error("Calc worker change track is invalid");
  const track = new ScChangeTrack(document);
  try {
    for (const data of record.actions as readonly ContentActionRecord[]) {
      if (
        !data ||
        !validId(data.id) ||
        data.id === 0 ||
        !validId(data.rejecting) ||
        !validId(data.previous) ||
        !Number.isInteger(data.state) ||
        data.state < ScChangeActionState.SC_CAS_VIRGIN ||
        data.state > ScChangeActionState.SC_CAS_REJECTED ||
        !Array.isArray(data.range) ||
        data.range.length !== 6 ||
        !data.range.every(
          /** Tests one raw BigRange coordinate. @param value - Wire coordinate. @returns Whether it fits in signed64. */
          (value) => typeof value === "bigint" && BigInt.asIntN(64, value) === value,
        ) ||
        !Array.isArray(data.dependencies) ||
        !data.dependencies.every(validId) ||
        typeof data.user !== "string" ||
        typeof data.comment !== "string" ||
        typeof data.oldValue !== "string" ||
        !Number.isInteger(data.date) ||
        (data.date | 0) !== data.date ||
        typeof data.time !== "bigint" ||
        BigInt.asIntN(64, data.time) !== data.time ||
        !validCell(data.oldCell) ||
        (data.newCell !== undefined && !validCell(data.newCell))
      )
        throw new Error("Calc worker change action is invalid");
      const action = new ScChangeActionContent(
        {
          actionNumber: data.id,
          rejectingNumber: data.rejecting,
          state: data.state,
          range: new ScBigRange(...data.range),
          user: data.user,
          comment: data.comment,
          dateTimeUTC: new DateTime(new Date(data.date), Time.fromEncodedTime(data.time)),
        },
        createPreviousCell(document, data.oldCell ?? undefined),
        document,
        data.oldValue,
      );
      if (!track.AppendLoaded(action))
        throw new Error("Calc worker change action ID is duplicated");
      if (data.newCell !== undefined) {
        const value = createPreviousCell(document, data.newCell ?? undefined);
        try {
          action.SetNewCell(value);
        } finally {
          value.clear();
        }
      } else {
        const [column, row, tab] = action.GetBigRange().aStart.GetVars().map(Number) as [
          number,
          number,
          number,
        ];
        if (document.ValidColRow(column, row) && document.FetchTable(tab)) {
          const value = new ScCellValue(document.GetRefCellValue(new ScAddress(column, row, tab)));
          try {
            action.SetNewCell(value);
          } finally {
            value.clear();
          }
        }
      }
    }
    for (const data of record.actions) {
      const action = track.GetAction(data.id);
      if (!action) continue;
      const previous = track.GetAction(data.previous);
      if (previous) action.SetPrevContent(previous);
      for (const id of [...data.dependencies].reverse()) {
        const dependent = track.GetAction(id);
        if (dependent) action.AddDependent(dependent);
      }
    }
    track.SetActionMax(record.max);
    track.SetLastSavedActionNumber(record.lastSaved);
    track.SetProtection(record.protection);
    document.SetChangeTrack(track);
  } catch (error) {
    track.Dispose();
    throw error;
  }
}
