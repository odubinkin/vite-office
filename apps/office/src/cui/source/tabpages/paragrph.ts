/** @fileoverview Consumed definite-state split/widow/orphan controls of SvxExtParagraphTabPage from pinned paragrph.cxx;textflowpage.ui;other controls and mixed states remain unrepresented. */
/** Existing paragraph attribute values at this CUI boundary. */
export interface ParagraphSplitValue {
  readonly keepTogether?: boolean;
  readonly widows?: number;
  readonly orphans?: number;
}
/** Original represented control draft and source handler order;document attributes remain with Writer. */
export class SvxExtParagraphTabPage {
  private readonly original: Required<ParagraphSplitValue>;
  private readonly saved: {
    allow: boolean;
    widow: boolean;
    orphan: boolean;
    widowLines: number;
    orphanLines: number;
  };
  private allow: boolean;
  private widow: boolean;
  private orphan: boolean;
  private widowLines: number;
  private orphanLines: number;
  private allowSensitive = true;
  private boxesSensitive = true;
  private widowRows = false;
  private orphanRows = false;
  /** Resets definite controls and runs original handlers in source order. @param value - Existing attributes. @returns Nothing. */
  public constructor(value: ParagraphSplitValue) {
    this.original = {
      keepTogether: value.keepTogether ?? false,
      widows: value.widows ?? 2,
      orphans: value.orphans ?? 2,
    };
    this.allow = !this.original.keepTogether;
    this.widow = this.original.widows > 0;
    this.orphan = this.original.orphans > 0;
    this.widowLines = boundLines(this.original.widows);
    this.orphanLines = boundLines(this.original.orphans);
    this.saved = {
      allow: this.allow,
      widow: this.widow,
      orphan: this.orphan,
      widowLines: this.widowLines,
      orphanLines: this.orphanLines,
    };
    this.AllowSplitHdl(this.allow);
    this.WidowHdl(this.widow);
    this.OrphanHdl(this.orphan);
  }
  /** Publishes independent original control state. @returns Controls. */
  public GetState() {
    return {
      allow: this.allow,
      widow: this.widow,
      orphan: this.orphan,
      widowLines: this.widowLines,
      orphanLines: this.orphanLines,
      allowSensitive: this.allowSensitive,
      boxesSensitive: this.boxesSensitive,
      widowRows: this.widowRows,
      orphanRows: this.orphanRows,
    };
  }
  /** Original split handler changes only the subordinate checkbox sensitivity. @param active - Checkbox state. @returns Nothing. */
  public AllowSplitHdl(active: boolean): void {
    this.allow = active;
    this.boxesSensitive = active;
  }
  /** Original widow handler includes its asymmetric false branch. @param active - Checkbox state. @returns Nothing. */
  public WidowHdl(active: boolean): void {
    this.widow = active;
    this.widowRows = active;
    if (active) this.allowSensitive = true;
    else if (!this.orphan) this.allowSensitive = false;
  }
  /** Original orphan handler retains source false-branch asymmetry. @param active - Checkbox state. @returns Nothing. */
  public OrphanHdl(active: boolean): void {
    this.orphan = active;
    this.orphanRows = active;
    if (active) this.allowSensitive = true;
    else if (!this.widow) this.allowSensitive = true;
  }
  /** Updates the actual original spin value within textflowpage.ui bounds. @param kind - Original spin identity. @param value - Changed number. @returns Nothing. */
  public SetLines(kind: "widow" | "orphan", value: number): void {
    if (kind === "widow") this.widowLines = boundLines(value);
    else this.orphanLines = boundLines(value);
  }
  /** Emits only changed represented attributes as native FillItemSet does. @returns Changed attribute values. */
  public FillItemSet(): ParagraphSplitValue {
    const result: { keepTogether?: boolean; widows?: number; orphans?: number } = {};
    if (this.allow !== this.saved.allow) result.keepTogether = !this.allow;
    if (
      (this.widow !== this.saved.widow || this.widowLines !== this.saved.widowLines) &&
      (this.widow !== this.saved.widow ||
        (this.widow ? this.widowLines : 0) !== this.original.widows)
    )
      result.widows = this.widow ? this.widowLines : 0;
    if (
      (this.orphan !== this.saved.orphan || this.orphanLines !== this.saved.orphanLines) &&
      (this.orphan !== this.saved.orphan ||
        (this.orphan ? this.orphanLines : 0) !== this.original.orphans)
    )
      result.orphans = this.orphan ? this.orphanLines : 0;
    return result;
  }
}
/** Original numeric widget bounds. @param value - Native spin value. @returns Clamped whole count. */
function boundLines(value: number): number {
  return Math.max(1, Math.min(9, Math.round(value)));
}
