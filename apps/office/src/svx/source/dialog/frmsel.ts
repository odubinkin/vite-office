/** @fileoverview Owns represented native frame-border selection, independent of browser geometry. */
import { SvxBorderLine, SvxBorderLineStyle } from "../../../editeng/source/items/borderline";

/** Native frame edge identities, including disabled diagonal keyboard neighbors. */
export enum FrameBorderType {
  NONE,
  Left,
  Right,
  Top,
  Bottom,
  Horizontal,
  Vertical,
  TLBR,
  BLTR,
}
/** Native visible, hidden and indeterminate states. */
export enum FrameBorderState {
  Show,
  Hide,
  DontCare,
}
/** Native selector feature flags. */
export enum FrameSelFlags {
  NONE = 0,
  Left = 1,
  Right = 2,
  Top = 4,
  Bottom = 8,
  InnerHorizontal = 16,
  InnerVertical = 32,
  Outer = 15,
  DontCare = 256,
}
/** One owned native frame-border state. */
interface FrameBorder {
  state: FrameBorderState;
  line: SvxBorderLine;
  selected: boolean;
}
/** Native keyboard adjacency in left/right/up/down order. */
const neighbors = [
  [0, 0, 0, 0],
  [0, 7, 3, 4],
  [8, 0, 3, 4],
  [1, 2, 0, 7],
  [1, 2, 8, 0],
  [1, 2, 7, 8],
  [7, 8, 3, 4],
  [1, 6, 3, 5],
  [6, 2, 5, 4],
] as const;

/** Owns native lines and selection; device hit-testing belongs to the host. */
export class FrameSelector {
  private flags = FrameSelFlags.NONE;
  private readonly borders = new Map<FrameBorderType, FrameBorder>();
  private readonly current = new SvxBorderLine();
  /** Enables native edges and clears prior state. @param flags - Supported frame features. @returns Nothing. */
  public Initialize(flags: FrameSelFlags): void {
    this.flags = flags;
    this.borders.clear();
    for (let edge = FrameBorderType.Left; edge <= FrameBorderType.Vertical; edge++)
      if (flags & (1 << (edge - 1)))
        this.borders.set(edge, {
          state: FrameBorderState.Hide,
          line: new SvxBorderLine(),
          selected: false,
        });
  }
  /** Lists native enabled edges in source order. @returns Native identities. */
  public GetEnabledBorders(): readonly FrameBorderType[] {
    return [...this.borders.keys()];
  }
  /** Reads supported indeterminate cycling. @returns Whether enabled. */
  public SupportsDontCareState(): boolean {
    return Boolean(this.flags & FrameSelFlags.DontCare);
  }
  /** Reads one state. @param edge - Enabled edge. @returns Native state. */
  public GetFrameBorderState(edge: FrameBorderType): FrameBorderState {
    return (this.borders.get(edge) as FrameBorder).state;
  }
  /** Reads the native style pointer policy. @param edge - Enabled edge. @returns Owned line or absence. */
  public GetFrameBorderStyle(edge: FrameBorderType): SvxBorderLine | undefined {
    const line = (this.borders.get(edge) as FrameBorder).line;
    return line.GetOutWidth() ? line : undefined;
  }
  /** Copies a line without selection side effects. @param edge - Enabled edge. @param line - Native input. @returns Nothing. */
  public ShowBorder(edge: FrameBorderType, line: SvxBorderLine | undefined): void {
    const border = this.borders.get(edge) as FrameBorder;
    border.line = line?.Clone() ?? new SvxBorderLine();
    border.state = border.line.isEmpty() ? FrameBorderState.Hide : FrameBorderState.Show;
  }
  /** Sets indeterminate state and clears the line. @param edge - Enabled edge. @returns Nothing. */
  public SetBorderDontCare(edge: FrameBorderType): void {
    this.SetBorderState(edge, FrameBorderState.DontCare);
  }
  /** Reports visible source lines. @returns Whether any visible. */
  public IsAnyBorderVisible(): boolean {
    return [...this.borders.values()].some(
      /** Tests native visible state. @param border - Owned border. @returns Whether visible. */ (
        border,
      ) => border.state === FrameBorderState.Show,
    );
  }
  /** Clears all lines while retaining selection. @returns Nothing. */
  public HideAllBorders(): void {
    for (const edge of this.borders.keys()) this.SetBorderState(edge, FrameBorderState.Hide);
  }
  /** Reads uniform visible native width/style. @returns Uniform pair or absence. */
  public GetVisibleWidth(): readonly [number, SvxBorderLineStyle] | undefined {
    const visible = [...this.borders.values()].filter(
      /** Selects source visible lines. @param border - Owned border. @returns Whether visible. */ (
        border,
      ) => border.state === FrameBorderState.Show,
    );
    const first = visible[0]?.line;
    return first !== undefined &&
      visible.every(
        /** Compares native width and style consensus. @param border - Visible owned line. @returns Whether equal to first. */ (
          border,
        ) =>
          border.line.GetWidth() === first.GetWidth() &&
          border.line.GetBorderLineStyle() === first.GetBorderLineStyle(),
      )
      ? [first.GetWidth(), first.GetBorderLineStyle()]
      : undefined;
  }
  /** Reads uniform visible RGB. @returns Color or absence. */
  public GetVisibleColor(): number | undefined {
    const visible = [...this.borders.values()].filter(
        /** Selects source visible lines. @param border - Owned border. @returns Whether visible. */ (
          border,
        ) => border.state === FrameBorderState.Show,
      ),
      first = visible[0]?.line;
    return first !== undefined &&
      visible.every(
        /** Compares native visible color consensus. @param border - Visible owned line. @returns Whether equal to first. */ (
          border,
        ) => border.line.GetColor() === first.GetColor(),
      )
      ? first.GetColor()
      : undefined;
  }
  /** Reads native edge selection. @param edge - Enabled edge. @returns Selected flag. */
  public IsBorderSelected(edge: FrameBorderType): boolean {
    return (this.borders.get(edge) as FrameBorder).selected;
  }
  /** Selects one edge. @param edge - Enabled edge. @returns Nothing. */
  public SelectBorder(edge: FrameBorderType): void {
    (this.borders.get(edge) as FrameBorder).selected = true;
  }
  /** Clears selection without changing any line. @returns Nothing. */
  public DeselectAllBorders(): void {
    for (const border of this.borders.values()) border.selected = false;
  }
  /** Selects the first native edge when keyboard focus enters an empty selection. @returns Nothing. */
  public GetFocus(): void {
    if (
      ![...this.borders.values()].some(
        /** Tests whether focus already has a selected line. @param border - Owned edge. @returns Selection. */ (
          border,
        ) => border.selected,
      )
    ) {
      const first = this.GetEnabledBorders()[0];
      if (first !== undefined) this.SelectBorder(first);
    }
  }
  /** Selects all visible edges. @returns Nothing. */
  public SelectAllVisibleBorders(): void {
    for (const border of this.borders.values())
      if (border.state === FrameBorderState.Show) border.selected = true;
  }
  /** Changes cached width/style and every selected line. @param width - Native twips. @param style - Native style. @returns Nothing. */
  public SetStyleToSelection(width: number, style: SvxBorderLineStyle): void {
    this.current.SetBorderLineStyle(style);
    this.current.SetWidth(width);
    for (const [edge, border] of this.borders)
      if (border.selected) this.SetBorderState(edge, FrameBorderState.Show);
  }
  /** Changes cached color and every selected line. @param color - Native RGB. @returns Nothing. */
  public SetColorToSelection(color: number): void {
    this.current.SetColor(color);
    for (const [edge, border] of this.borders)
      if (border.selected) this.SetBorderState(edge, FrameBorderState.Show);
  }
  /** Reads the current native style cache. @returns Style. */
  public getCurrentStyleLineStyle(): SvxBorderLineStyle {
    return this.current.GetBorderLineStyle();
  }
  /** Dispatches source mouse selection after host hit-testing. @param clicked - Hit edges, possibly empty. @param extend - Shift/control selection. @returns Nothing. */
  public MouseButtonDown(clicked: readonly FrameBorderType[], extend = false): void {
    let newlySelected = false;
    for (const [edge, border] of this.borders) {
      if (clicked.includes(edge)) {
        newlySelected ||= !border.selected;
        border.selected = true;
      } else {
        if (!this.SupportsDontCareState() && border.state === FrameBorderState.DontCare)
          this.SetBorderState(edge, FrameBorderState.Hide);
      }
    }
    if (clicked.length === 0) return;
    if (!extend)
      for (const [edge, border] of this.borders)
        if (!clicked.includes(edge)) border.selected = false;
    const selected = [...this.borders.values()].filter(
        /** Collects source mouse-selected lines. @param border - Owned edge. @returns Selection. */ (
          border,
        ) => border.selected,
      ),
      first = (selected[0] as FrameBorder).line;
    const equal = selected.every(
      /** Compares all selected native line values before cycling. @param border - Selected edge. @returns Whether equal. */ (
        border,
      ) => border.line.equals(first),
    );
    for (const [edge, border] of this.borders)
      if (border.selected) {
        if (newlySelected || !equal) this.SetBorderState(edge, FrameBorderState.Show);
        else this.ToggleBorderState(edge);
      }
  }
  /** Dispatches source space/arrows without modifiers. @param key - Native key name. @returns Whether handled. */
  public KeyInput(key: string): boolean {
    if (key === " ") {
      for (const [edge, border] of this.borders) if (border.selected) this.ToggleBorderState(edge);
      return true;
    }
    const direction = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].indexOf(key);
    if (direction < 0 || this.borders.size === 0) return false;
    let edge =
      [...this.borders].find(
        /** Finds first selected native keyboard edge. @param entry - Native edge and owned state. @returns Selection. */ ([
          ,
          border,
        ]) => border.selected,
      )?.[0] ?? (this.GetEnabledBorders()[0] as FrameBorderType);
    do {
      edge = (neighbors[edge] as readonly FrameBorderType[])[direction] as FrameBorderType;
    } while (edge !== FrameBorderType.NONE && !this.borders.has(edge));
    if (edge !== FrameBorderType.NONE) {
      this.DeselectAllBorders();
      this.SelectBorder(edge);
    }
    return true;
  }
  /** Implements native show/hide/dontcare storage. @param edge - Enabled edge. @param state - New state. @returns Nothing. */
  private SetBorderState(edge: FrameBorderType, state: FrameBorderState): void {
    if (state === FrameBorderState.Show) this.ShowBorder(edge, this.current);
    else {
      const border = this.borders.get(edge) as FrameBorder;
      border.state = state;
      border.line = new SvxBorderLine();
    }
  }
  /** Cycles the native tristate order. @param edge - Enabled edge. @returns Nothing. */
  private ToggleBorderState(edge: FrameBorderType): void {
    const state = this.GetFrameBorderState(edge);
    this.SetBorderState(
      edge,
      state === FrameBorderState.Show
        ? this.SupportsDontCareState()
          ? FrameBorderState.DontCare
          : FrameBorderState.Hide
        : state === FrameBorderState.Hide
          ? FrameBorderState.Show
          : FrameBorderState.Hide,
    );
  }
}
