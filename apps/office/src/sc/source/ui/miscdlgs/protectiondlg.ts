/** @fileoverview Native Calc sheet protection dialog options and result. */
import { ScTableProtection } from "../../core/data/tabprotection";
import { ScTableProtectionOption as Option } from "../../../inc/tabprotection";

/** Option order from the native protection list box. */
export const sheetProtectionOptions = [
  [Option.SELECT_LOCKED_CELLS, "Select protected cells"],
  [Option.SELECT_UNLOCKED_CELLS, "Select unprotected cells"],
  [Option.INSERT_COLUMNS, "Insert columns"],
  [Option.INSERT_ROWS, "Insert rows"],
  [Option.DELETE_COLUMNS, "Delete columns with unprotected cells"],
  [Option.DELETE_ROWS, "Delete rows with unprotected cells"],
  [Option.AUTOFILTER, "Use AutoFilter"],
  [Option.PIVOT_TABLES, "Use Pivot Table and Pivot Chart"],
] as const;

/** Result returned by the native protection dialog. */
export interface ScSheetProtectionResult {
  readonly password: string;
  readonly enabled: ReadonlySet<Option>;
}

/** Carries original options between the native command and modal presenter. */
export class ScTableProtectionDlg {
  readonly options: ReadonlySet<Option>;

  /** Applies existing options or the original default selection. @param protection - Current sheet options. @returns Dialog model. */
  constructor(protection: Readonly<ScTableProtection> = new ScTableProtection()) {
    this.options = new Set(
      sheetProtectionOptions
        .map(
          /** Reads the native ID for a row. @param row - Option row. @returns Permission. */ ([
            option,
          ]) => option,
        )
        .filter(
          /** Reads the sheet-owned default. @param option - Permission. @returns Whether selected. */ (
            option,
          ) => protection.isOptionEnabled(option),
        ),
    );
  }

  /** Copies the verified dialog values into a new source sheet protection record. @param result - Accepted form data. @returns New protection. */
  async WriteData(result: ScSheetProtectionResult): Promise<ScTableProtection> {
    const protection = new ScTableProtection();
    protection.setProtected(true);
    for (const [option] of sheetProtectionOptions)
      protection.setOption(option, result.enabled.has(option));
    await protection.setPassword(result.password);
    return protection;
  }
}
