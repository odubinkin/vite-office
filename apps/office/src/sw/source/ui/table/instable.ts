/** @fileoverview Native Insert Table draft and linked input handlers from pinned instable.cxx. */
import { SwInsertTableFlags, type SwInsertTableOptions } from "../../../inc/itabenum";

/** Accepted native insert dialog fields; row and column results use sal_uInt16. */
export interface SwInsTableValues {
  readonly name: string;
  readonly rows: number;
  readonly columns: number;
  readonly options: SwInsertTableOptions;
}

/** Owns supported Insert Table controls; full autoformat, HTML and LOK variants remain unverified. */
export class SwInsTableDlg {
  public name: string;
  public rows = 2;
  public columns = 2;
  public header: boolean;
  public repeatHeader: boolean;
  public dontSplit: boolean;
  public repeatRows = 1;
  public repeatMaximum = 1;
  public warning = false;
  private m_nEnteredValRepeatHeaderNF = -1;

  /** Initializes native spin and Writer module defaults. @param name - Suggested native table name. @param occupiedNames - Existing document table names. @param options - Injected module options, defaulting to pinned Writer configuration. @returns Nothing. */
  public constructor(
    name: string,
    private readonly occupiedNames: readonly string[] = [],
    options: SwInsertTableOptions = {
      mnInsMode: SwInsertTableFlags.DefaultBorder | SwInsertTableFlags.SplitLayout,
      mnRowsToRepeat: 1,
    },
  ) {
    this.name = name;
    this.header = Boolean(options.mnInsMode & SwInsertTableFlags.Headline);
    this.repeatHeader = options.mnRowsToRepeat > 0;
    this.dontSplit = !(options.mnInsMode & SwInsertTableFlags.SplitLayout);
  }

  /** Filters native forbidden entry characters without rejecting other text. @param value - Edited table name. @returns Nothing. */
  public TextFilterHdl(value: string): void {
    this.name = value.replace(/[ .<>]/gu, "");
  }

  /** Matches native ModifyName sensitivity, including acceptance of an empty generated name. @returns Whether Insert is enabled. */
  public IsInsertSensitive(): boolean {
    return !this.occupiedNames.includes(this.name);
  }

  /** Reports native header checkbox sensitivity. @returns Whether repeat checkbox is enabled. */
  public IsRepeatHeaderSensitive(): boolean {
    return this.header;
  }

  /** Reports native RepeatHeaderCheckBoxHdl sensitivity. @returns Whether repeated-row group is enabled. */
  public IsRepeatGroupSensitive(): boolean {
    return this.header && this.repeatHeader;
  }

  /** Applies the native header toggle before presenting linked sensitivity. @param active - Header checkbox value. @returns Nothing. */
  public CheckBoxHdl(active: boolean): void {
    this.header = active;
  }

  /** Applies the native repeat toggle while retaining its spin value. @param active - Repeat checkbox value. @returns Nothing. */
  public RepeatHeaderCheckBoxHdl(active: boolean): void {
    this.repeatHeader = active;
  }

  /** Sets the native split checkbox consumed by GetValues. @param active - Dont-split checkbox value. @returns Nothing. */
  public SetDontSplit(active: boolean): void {
    this.dontSplit = active;
  }

  /** Updates dimension warning and restores the manually entered repeated-row value. @param field - Edited dimension. @param value - Entry text, read before focus is lost. @returns Nothing. */
  public ModifyRowCol(field: "rows" | "columns", value: string): void {
    this[field] = Math.max(1, Math.min(2_000_000, Math.trunc(Number(value) || 0)));
    this.warning = this.rows > 255 || this.columns > 63;
    if (field === "columns") return;
    this.repeatMaximum = this.rows === 1 ? 1 : this.rows - 1;
    if (this.repeatRows > this.repeatMaximum) this.repeatRows = this.repeatMaximum;
    else if (this.repeatRows < this.m_nEnteredValRepeatHeaderNF)
      this.repeatRows = Math.min(this.m_nEnteredValRepeatHeaderNF, this.repeatMaximum);
  }

  /** Retains the user's repeated-row value separately from later automatic clamping. @param value - Edited count. @returns Nothing. */
  public ModifyRepeatHeaderNF_Hdl(value: number): void {
    this.repeatRows = Math.max(1, Math.min(this.repeatMaximum, Math.trunc(value)));
    this.m_nEnteredValRepeatHeaderNF = this.repeatRows;
  }

  /** Projects accepted native flags and repeated-row count without any geometry/model mutation. @returns Native insertion parameters. */
  public GetValues(): SwInsTableValues {
    let flags = SwInsertTableFlags.NONE;
    if (this.header) flags |= SwInsertTableFlags.Headline;
    if (!this.dontSplit) flags |= SwInsertTableFlags.SplitLayout;
    return {
      name: this.name,
      rows: this.rows & 0xffff,
      columns: this.columns & 0xffff,
      options: {
        mnInsMode: flags,
        mnRowsToRepeat: this.IsRepeatGroupSensitive() ? this.repeatRows & 0xffff : 0,
      },
    };
  }
}
