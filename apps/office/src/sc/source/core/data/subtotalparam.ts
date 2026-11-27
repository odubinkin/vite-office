/** @fileoverview Native Calc subtotal groups and their database range options. */
import type { ScSubTotalFunc } from "../../../inc/global";

/** Original maximum number of subtotal grouping levels. */
export const MAXSUBTOTAL = 3;

/** Original grouping column and ordered calculated subtotal fields. */
export class ScSubtotalGroup {
  public bActive = false;
  public nField = 0;
  public pSubTotals: Array<readonly [number, ScSubTotalFunc]> = [];

  /** Replaces the independently owned associated columns and functions. @param columns - Original group fields. @returns Nothing. */
  public SetSubtotals(columns: readonly (readonly [number, ScSubTotalFunc])[]): void {
    this.pSubTotals = columns.map(
      /** Copies an individual field. @param entry - Column and function. @returns Owned field. */
      ([column, operation]) => [column, operation],
    );
  }
}

/** Native subtotal descriptor and the original nonzero default options. */
export class ScSubTotalParam {
  public nCol1 = 0;
  public nRow1 = 0;
  public nCol2 = 0;
  public nRow2 = 0;
  public nUserIndex = 0;
  public bRemoveOnly = false;
  public bReplace = true;
  public bPagebreak = false;
  public bCaseSens = false;
  public bDoSort = true;
  public bSummaryBelow = true;
  public bAscending = true;
  public bUserDef = false;
  public bIncludePattern = false;
  public bGroupedBy = true;
  public bHasHeader = true;
  public readonly aGroups = [new ScSubtotalGroup(), new ScSubtotalGroup(), new ScSubtotalGroup()];

  /** Copies a subtotal descriptor without sharing group arrays. @param source - Original parameter. @returns This value. */
  public assign(source: ScSubTotalParam): this {
    const { aGroups, ...scalar } = source;
    Object.assign(this, scalar);
    for (const [index, original] of aGroups.entries()) {
      const group = this.aGroups[index] as ScSubtotalGroup;
      group.bActive = original.bActive;
      group.nField = original.nField;
      group.SetSubtotals(original.pSubTotals);
    }
    return this;
  }
}
