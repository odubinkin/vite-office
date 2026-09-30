/** @fileoverview Owns the implemented independent numbering position fields from pinned SvxNumberFormat. */

/** Native position-and-space selection. */
export type SvxNumPositionAndSpaceMode = "label-width-and-position" | "label-alignment";

/** Numeric values are core Twips, or native MM100 at an explicit conversion boundary. */
export interface NumberingPositionProperties {
  readonly absLSpace?: number;
  readonly firstLineOffset?: number;
  readonly charTextDistance?: number;
  readonly firstLineIndent?: number;
  readonly indentAt?: number;
  readonly labelFollowedBy?: "listtab" | "nothing" | "space";
  readonly listTabPosition?: number;
  readonly positionAndSpaceMode?: SvxNumPositionAndSpaceMode;
}

/** Retains both native geometry groups independently; the active mode determines legacy getter results. */
export class SvxNumberFormat {
  private position: Required<NumberingPositionProperties>;
  /** Initializes the native zero geometry and legacy mode. @param properties - Explicit field overrides. @returns Format. */
  public constructor(properties: NumberingPositionProperties = {}) {
    this.position = {
      absLSpace: (properties.absLSpace ?? 0) | 0,
      firstLineOffset: (properties.firstLineOffset ?? 0) | 0,
      charTextDistance: ((properties.charTextDistance ?? 0) << 16) >> 16,
      firstLineIndent: properties.firstLineIndent ?? 0,
      indentAt: properties.indentAt ?? 0,
      labelFollowedBy: properties.labelFollowedBy ?? "listtab",
      listTabPosition: properties.listTabPosition ?? 0,
      positionAndSpaceMode: properties.positionAndSpaceMode ?? "label-width-and-position",
    };
  }
  /** Returns mode-dependent absolute left spacing. @returns Twips. */
  public GetAbsLSpace(): number {
    return this.position.positionAndSpaceMode === "label-width-and-position"
      ? this.position.absLSpace
      : (this.position.firstLineIndent + this.position.indentAt) | 0;
  }
  /** Returns mode-dependent first-line offset. @returns Twips. */
  public GetFirstLineOffset(): number {
    return this.position.positionAndSpaceMode === "label-width-and-position"
      ? this.position.firstLineOffset
      : this.position.firstLineIndent | 0;
  }
  /** Returns legacy character/text distance, or zero in alignment mode. @returns Twips. */
  public GetCharTextDistance(): number {
    return this.position.positionAndSpaceMode === "label-width-and-position"
      ? this.position.charTextDistance
      : 0;
  }
  /** Returns the independent alignment first-line indent. @returns Twips. */
  public GetFirstLineIndent(): number {
    return this.position.firstLineIndent;
  }
  /** Returns the independent alignment body indent. @returns Twips. */
  public GetIndentAt(): number {
    return this.position.indentAt;
  }
  /** Returns the stored alignment separator. @returns Separator. */
  public GetLabelFollowedBy(): "listtab" | "nothing" | "space" {
    return this.position.labelFollowedBy;
  }
  /** Returns the independent alignment tab position. @returns Twips. */
  public GetListtabPos(): number {
    return this.position.listTabPosition;
  }
  /** Returns the active native mode. @returns Mode. */
  public GetPositionAndSpaceMode(): SvxNumPositionAndSpaceMode {
    return this.position.positionAndSpaceMode;
  }
  /** Changes the active mode without rewriting either geometry group. @param mode - New mode. @returns Nothing. */
  public SetPositionAndSpaceMode(mode: SvxNumPositionAndSpaceMode): void {
    this.position = { ...this.position, positionAndSpaceMode: mode };
  }
  /** Copies raw fields for Writer copy construction and the browser snapshot port, including inactive geometry. @returns Independent property record. */
  public GetPositionProperties(): Required<NumberingPositionProperties> {
    return { ...this.position };
  }
}
