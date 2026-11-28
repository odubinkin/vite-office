/** @fileoverview Reconstructs native Calc content change actions from the ODF loading pass. */
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { Converter } from "../../../../sax/source/tools/converter";
import { ScAddress } from "../../../inc/address";
import { ScCellValue } from "../../../inc/cellvalue";
import type { ScDocument } from "../../../inc/document";
import {
  ScChangeActionContent,
  ScChangeTrack,
  type ScChangeActionInfo,
} from "../../core/tool/chgtrack";

/** Native loader state for the supported scalar previous cell. */
export interface ScMyCellInfo {
  readonly value: number | string | undefined;
  readonly inputString: string;
}

/** Loaded content change before linking its dependencies. */
export interface ScMyContentAction extends ScChangeActionInfo {
  readonly oldCell: ScMyCellInfo;
  readonly previousAction: number;
  readonly dependencies: readonly number[];
}

/** Owns the parsed actions until the real document cells are ready. */
export class ScXMLChangeTrackingImportHelper {
  private readonly actions: ScMyContentAction[] = [];
  private protection = new Uint8Array();

  /** Parses the original ct identifier and signed-32 range. @param value - Authored identifier. @returns Action number or zero. */
  public static GetIDFromString(value: string | null): number {
    const number: [number] = [0];
    if (value?.startsWith("ct")) Converter.convertNumber(number, value.slice(2), 0);
    return number[0];
  }

  /** Retains protection after the tracked-changes wrapper is read. @param value - Imported bytes. */
  public SetProtection(value: Uint8Array): void {
    this.protection = new Uint8Array(value);
  }

  /** Records the completed native content action if its identity is valid. @param action - Loaded action. */
  public EndChangeAction(action: ScMyContentAction): void {
    if (action.actionNumber > 0) this.actions.push(action);
  }

  /** Reconstructs the native actions in their original three import passes. @param document - Fully populated workbook. */
  public CreateChangeTrack(document: ScDocument): void {
    const track = new ScChangeTrack(document);
    const loaded: ScMyContentAction[] = [];
    try {
      for (const action of this.actions) {
        const cell = createPreviousCell(document, action.oldCell.value);
        try {
          if (
            track.AppendLoaded(
              new ScChangeActionContent(action, cell, document, action.oldCell.inputString),
            )
          )
            loaded.push(action);
        } finally {
          cell.clear();
        }
      }
      const last = track.GetLast()?.GetActionNumber() ?? 0;
      track.SetActionMax(last);
      for (const action of loaded) {
        const content = track.GetAction(action.actionNumber);
        if (!content) continue;
        for (let index = action.dependencies.length - 1; index >= 0; index--) {
          const dependent = track.GetAction(action.dependencies[index] as number);
          if (dependent) content.AddDependent(dependent);
        }
        const previous = track.GetAction(action.previousAction);
        if (previous) {
          content.SetPrevContent(previous);
          const old = content.GetOldCell();
          if (!old.isEmpty()) previous.SetNewCell(old);
        }
      }
      for (const content of track.entries()) {
        if (!content.IsTopContent()) continue;
        const [column, row, tab] = content.GetBigRange().aStart.GetVars().map(Number) as [
          number,
          number,
          number,
        ];
        if (!document.ValidColRow(column, row) || !document.FetchTable(tab)) continue;
        const cell = new ScCellValue(document.GetRefCellValue(new ScAddress(column, row, tab)));
        try {
          if (!cell.isEmpty()) content.SetNewCell(cell);
        } finally {
          cell.clear();
        }
      }
      if (this.protection.length) track.SetProtection(this.protection);
      else {
        const previous = document.GetChangeTrack();
        if (previous) track.SetProtection(previous.GetProtection());
      }
      track.SetLastSavedActionNumber(last);
      document.SetChangeTrack(track);
    } catch (error) {
      track.Dispose();
      throw error;
    } finally {
      this.actions.length = 0;
    }
  }
}

/** Creates the actual previous cell using the document's native string pool. @param document - Workbook. @param value - Imported scalar. @returns Owned previous cell. */
export function createPreviousCell(
  document: ScDocument,
  value: number | string | undefined,
): ScCellValue {
  if (typeof value !== "string") return new ScCellValue(value);
  const authored = unicode(value);
  try {
    const shared = document.GetSharedStringPool().intern(authored);
    try {
      return new ScCellValue(shared);
    } finally {
      shared.dispose();
    }
  } finally {
    authored.dispose();
  }
}
