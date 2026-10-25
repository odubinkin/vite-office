/** @fileoverview Consumed definite-state split/widow/orphan controls of SvxExtParagraphTabPage from pinned paragrph.cxx;textflowpage.ui;definite page breaks;other controls and mixed states remain unrepresented. */
/** Existing paragraph attribute values at this CUI boundary. */
export interface ParagraphSplitValue {
  readonly keepTogether?: boolean;
  readonly widows?: number;
  readonly orphans?: number;
}
/** Represented definite page-only attributes at the existing Writer boundary. */
export interface ParagraphBreakValue {
  readonly breakBefore?: "auto" | "page";
  readonly breakAfter?: "auto" | "page";
  readonly pageStyleName?: string;
  readonly pageNumber?: number | "auto";
}
/** Original represented control draft and source handler order;document attributes remain with Writer. */
export class SvxExtParagraphTabPage {
  private readonly initialBreak: ParagraphBreakValue;
  private readonly styles: readonly string[];
  private readonly savedBreak: {
    insert: boolean;
    position: "before" | "after";
    apply: boolean;
    style: string;
    numbered: boolean;
    number: number;
  };
  private insert: boolean;
  private position: "before" | "after";
  private apply: boolean;
  private style: string;
  private numbered: boolean;
  private number: number;
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
  /** Resets definite controls and runs original handlers in source order. @param value - Existing attributes. @param styles - Actual available page styles. @returns Nothing. */
  public constructor(
    value: ParagraphSplitValue & ParagraphBreakValue,
    styles: readonly string[] = ["Standard"],
  ) {
    this.initialBreak = value;
    this.styles = styles;
    this.apply = !!value.pageStyleName && styles.includes(value.pageStyleName);
    this.style = this.apply ? String(value.pageStyleName) : "";
    this.insert = this.apply || value.breakBefore === "page" || value.breakAfter === "page";
    this.position =
      !this.apply && value.breakBefore !== "page" && value.breakAfter === "page"
        ? "after"
        : "before";
    this.numbered = value.pageNumber !== undefined && value.pageNumber !== "auto";
    this.number = boundPage(this.numbered ? (value.pageNumber as number) : 1);
    this.savedBreak = {
      insert: this.insert,
      position: this.position,
      apply: this.apply,
      style: this.style,
      numbered: this.numbered,
      number: this.number,
    };
    this.PageBreakPosHdl_Impl(this.position);
    this.PageBreakHdl(this.insert);
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
  public FillItemSet(): ParagraphSplitValue & ParagraphBreakValue {
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
    return { ...result, ...this.FillBreakItems() };
  }
  /** Publishes original break controls and dependent widget sensitivities. @returns Native control values. */
  public GetBreakState() {
    const applySensitive = this.insert && this.position === "before";
    const styleSensitive = applySensitive && this.apply && this.styles.length > 0;
    return {
      insert: this.insert,
      position: this.position,
      apply: this.apply,
      style: this.style,
      numbered: this.numbered,
      number: this.number,
      applySensitive,
      styleSensitive,
      numberSensitive: styleSensitive && this.numbered,
      styles: this.styles,
    };
  }
  /** Runs original Insert handler. @param active - Insert state. @returns Nothing. */
  public PageBreakHdl(active: boolean): void {
    this.insert = active;
    if (!active) this.apply = false;
  }
  /** Runs original position handler,retaining inactive style and number drafts. @param position - Selected position. @returns Nothing. */
  public PageBreakPosHdl_Impl(position: "before" | "after"): void {
    this.position = position;
    if (position === "after") this.apply = false;
  }
  /** Runs original apply-style handler with standard style selection. @param active - With page style. @returns Nothing. */
  public ApplyCollClickHdl(active: boolean): void {
    this.apply = active;
    this.style =
      active && this.styles.length > 0 ? (this.styles.includes("Standard") ? "Standard" : "") : "";
  }
  /** Selects an actual style row. @param name - Existing document style. @returns Nothing. */
  public SetPageStyle(name: string): void {
    this.style = name;
  }
  /** Changes original page-number checkbox. @param active - Checkbox. @returns Nothing. */
  public PageNumBoxClickHdl(active: boolean): void {
    this.numbered = active;
  }
  /** Writes original spinPageNumber bounds including source zero and55535 ceiling. @param number - Spin value. @returns Nothing. */
  public SetPageNumber(number: number): void {
    this.number = boundPage(number);
  }
  /** Projects changed original items to represented Writer values;inactive numeric controls cannot emit. @returns Changed attributes. */
  private FillBreakItems(): ParagraphBreakValue {
    const saved = this.savedBreak,
      state = this.GetBreakState();
    const result: {
      pageNumber?: number | "auto";
      pageStyleName?: string;
      breakBefore?: "auto" | "page";
      breakAfter?: "auto" | "page";
    } = {};
    if (
      state.styleSensitive &&
      (this.numbered !== saved.numbered || this.number !== saved.number)
    ) {
      if (this.numbered) {
        if (this.number !== this.initialBreak.pageNumber) result.pageNumber = this.number;
      } else if (typeof this.initialBreak.pageNumber === "number") result.pageNumber = "auto";
    }
    let pageModel = false;
    if (this.apply !== saved.apply || (this.apply && this.style !== saved.style)) {
      const style = this.apply ? this.style : "";
      if (style !== (this.initialBreak.pageStyleName ?? "")) {
        result.pageStyleName = style;
        pageModel = style !== "";
      }
    } else if (this.apply && state.applySensitive) pageModel = true;
    else if (this.initialBreak.pageStyleName) result.pageStyleName = "";
    if (pageModel) {
      result.breakBefore = "auto";
      result.breakAfter = "auto";
    } else if (
      (this.initialBreak.pageStyleName !== undefined && this.insert) ||
      this.insert !== saved.insert ||
      this.position !== saved.position
    ) {
      const before = this.insert && this.position === "before" ? "page" : "auto";
      const after = this.insert && this.position === "after" ? "page" : "auto";
      if (
        this.insert !== saved.insert ||
        before !== (this.initialBreak.breakBefore ?? "auto") ||
        after !== (this.initialBreak.breakAfter ?? "auto")
      ) {
        result.breakBefore = before;
        result.breakAfter = after;
      }
    }
    return result;
  }
}
/** Original spinPageNumber bounds from textflowpage.ui. @param value - Native spin value. @returns Whole bounded value. */
function boundPage(value: number): number {
  return Math.max(0, Math.min(55535, Math.round(value)));
}
/** Original numeric widget bounds. @param value - Native spin value. @returns Clamped whole count. */
function boundLines(value: number): number {
  return Math.max(1, Math.min(9, Math.round(value)));
}
