/** @fileoverview Owns represented native table ruler item policy from svx/source/dialog/svxruler.cxx, independently of Writer. */
import {
  Ruler,
  RulerType,
  RulerBorderStyle,
  type RulerPoint,
  type RulerSelection,
  type RulerBorder,
} from "../../../svtools/source/control/ruler";
import { KEY_SHIFT, KEY_MOD1, KEY_MOD2 } from "../../../vcl/keycodes";
import { SID_RULER_ROWS, SID_RULER_ROWS_VERTICAL } from "../../inc/svxids";
import type { SvxColumnItem } from "./rulritem";

/** Native SvxRuler drag flag values. */
export const SvxRulerDragFlags = {
  NONE: 0x00,
  OBJECT: 0x01,
  OBJECT_SIZE_LINEAR: 0x02,
  OBJECT_SIZE_PROPORTIONAL: 0x04,
  OBJECT_ACTLINE_ONLY: 0x08,
  OBJECT_LEFT_INDENT_ONLY: 0x04,
} as const;
/** Native flag values, including the source alias for proportional/left-indent-only. */
export type SvxRulerDragFlags = (typeof SvxRulerDragFlags)[keyof typeof SvxRulerDragFlags];

/** Current represented frame/device state, supplied by the owning view instead of a VCL window. */
export interface SvxRulerFrame {
  readonly left: number;
  readonly right: number;
  readonly rightMax: number;
  readonly origin: number;
  readonly scale: number;
  readonly margin1: boolean;
  readonly margin2: boolean;
}

/** Source-owned unsigned per-thousand proportional buffers. */
class SvxRuler_Impl {
  public pPercBuf: number[] = [];
  public pBlockBuf: number[] = [];
  public nTotalDist = 0;
  public bIsTableRows = false;
  /** Clears native proportional buffers for a new admission. @param size - Native column count. @returns Nothing. */
  public SetPercSize(size: number): void {
    this.pPercBuf = Array<number>(size).fill(0);
    this.pBlockBuf = Array<number>(size).fill(0);
  }
}

/** Owns table modifiers, constraints, transient borders and native column values. */
export class SvxRuler extends Ruler {
  private readonly mxRulerImpl = new SvxRuler_Impl();
  private mxColumnItem: SvxColumnItem | undefined;
  private frame: SvxRulerFrame | undefined;
  private originalBorders: RulerBorder[] = [];
  private m_nDragType: SvxRulerDragFlags = SvxRulerDragFlags.NONE;
  private mbSnapping = true;
  private mbCoarseSnapping = false;
  private m_nMaxLeft = 0;
  private m_nMaxRight = 0;
  private initialPosition = 0;
  private margin1 = 0;
  private margin2 = 0;
  private changed = false;

  /** Creates one persistent native ruler. @param horizontal - Physical axis. @returns Nothing. */
  public constructor(horizontal: boolean) {
    super(horizontal);
  }

  /** Owns a value copy and updates represented borders/device state. @param item - Borrowed native column item. @param frame - Borrowed current frame/device values. @returns Nothing. */
  public Update(item: SvxColumnItem, frame: SvxRulerFrame): void {
    this.mxColumnItem = item.Clone();
    this.frame = { ...frame };
    this.SetDocTransform(frame.origin, frame.scale);
    this.mxRulerImpl.bIsTableRows =
      item.Which() === SID_RULER_ROWS || item.Which() === SID_RULER_ROWS_VERTICAL;
    this.margin1 = frame.left;
    this.margin2 = frame.right;
    this.UpdateColumns();
  }

  /** Copies source column descriptions into independent native border state. @returns Nothing. */
  private UpdateColumns(): void {
    const item = this.mxColumnItem as SvxColumnItem,
      frame = this.frame as SvxRulerFrame;
    this.mpBorders = Array.from(
      { length: Math.max(0, item.Count() - 1) },
      /** Converts one native description without importing a document carrier. @param _unused - Empty value. @param i - Native index. @returns Owned border. */ (
        _unused,
        i,
      ) => ({
        nPos: item.At(i).nEnd + frame.left,
        nWidth: item.At(i + 1).nStart - item.At(i).nEnd,
        nStyle:
          RulerBorderStyle.Variable |
          RulerBorderStyle.Moveable |
          (item.At(i).bVisible ? 0 : RulerBorderStyle.Invisible),
        nMinPos: item.At(i).nEndMin + frame.left,
        nMaxPos: item.At(i).nEndMax + frame.left,
      }),
    );
  }

  /** Resolves requested source Border/Margin hits with device tolerance. @param point - Device point. @param type - Native kind. @param tolerance - Device tolerance. @returns Independent native hit. */
  protected override ImplDocHitTest(
    point: RulerPoint,
    type: RulerType,
    tolerance: number,
  ): RulerSelection | undefined {
    if (this.frame === undefined) return undefined;
    const position = this.m_bHorz ? point.x : point.y;
    if (type === RulerType.Border) {
      let hit: RulerSelection | undefined,
        distance = Infinity;
      for (let i = 0; i < this.mpBorders.length; i++) {
        const border = this.mpBorders[i] as RulerBorder,
          difference = Math.abs(this.origin + border.nPos / this.scale - position);
        if (
          !(border.nStyle & RulerBorderStyle.Invisible) &&
          difference <= tolerance &&
          difference < distance
        ) {
          hit = { nPos: border.nPos, nAryPos: i };
          distance = difference;
        }
      }
      return hit;
    }
    const allowed =
      type === RulerType.Margin1
        ? this.frame.margin1
        : type === RulerType.Margin2 && this.frame.margin2;
    const margin = type === RulerType.Margin1 ? this.margin1 : this.margin2;
    return allowed && Math.abs(this.origin + margin / this.scale - position) <= tolerance
      ? { nPos: margin, nAryPos: 0 }
      : undefined;
  }

  /** Captures source-owned border values and exact modifier policy. @returns Whether supported table state exists. */
  protected override StartDrag(): boolean {
    if (this.mxColumnItem === undefined || !this.mxColumnItem.IsTable()) return false;
    // Vertical document writing and frame-column rulers need additional native frame/paragraph state.
    if (this.mxRulerImpl.bIsTableRows === this.m_bHorz) return false;
    this.initialPosition = this.GetDragPos();
    this.originalBorders = this.mpBorders.map(
      /** Copies one transient source border. @param border - Native value. @returns Independent copy. */ (
        border,
      ) => ({ ...border }),
    );
    this.m_nDragType = SvxRulerDragFlags.NONE;
    this.mbSnapping = true;
    this.mbCoarseSnapping = false;
    this.changed = false;
    this.EvalModifier();
    this.CalcMinMax();
    return true;
  }

  /** Evaluates native exact masks; row Shift and margin current-line exceptions are source policy. @returns Nothing. */
  private EvalModifier(): void {
    let modifier = this.GetDragModifier();
    if (this.mxRulerImpl.bIsTableRows && modifier === KEY_SHIFT) modifier = 0;
    switch (modifier) {
      case KEY_SHIFT:
        this.m_nDragType = SvxRulerDragFlags.OBJECT_SIZE_LINEAR;
        break;
      case KEY_MOD2 | KEY_SHIFT:
        this.mbCoarseSnapping = true;
        break;
      case KEY_MOD2:
        this.mbSnapping = false;
        break;
      case KEY_MOD1:
        this.m_nDragType = SvxRulerDragFlags.OBJECT_SIZE_PROPORTIONAL;
        if (this.mxRulerImpl.bIsTableRows || this.GetDragType() === RulerType.Border)
          this.PrepareProportional_Impl();
        break;
      case KEY_MOD1 | KEY_SHIFT:
        if (this.GetDragType() === RulerType.Border)
          this.m_nDragType = SvxRulerDragFlags.OBJECT_ACTLINE_ONLY;
        break;
    }
  }

  /** Prepares the represented table per-thousand shares in integer device pixels. @returns Nothing. */
  private PrepareProportional_Impl(): void {
    const rows = this.mxRulerImpl.bIsTableRows,
      index = this.GetDragAryPos(),
      border = this.GetDragType() === RulerType.Border,
      first = rows
        ? 0
        : Math.round(
            ((this.mpBorders[index] as RulerBorder).nPos +
              (this.mpBorders[index] as RulerBorder).nWidth) /
              this.scale,
          ),
      limit = rows && border ? index : this.mpBorders.length,
      right = Math.round((rows && border ? this.initialPosition : this.margin2) / this.scale);
    this.mxRulerImpl.SetPercSize((this.mxColumnItem as SvxColumnItem).Count());
    this.mxRulerImpl.nTotalDist = right - first;
    const start = rows ? 0 : index + 1;
    if (!rows)
      for (let i = start; i < limit; i++)
        this.mxRulerImpl.nTotalDist -= Math.round(
          (this.mpBorders[i] as RulerBorder).nWidth / this.scale,
        );
    let previous = first,
      width = 0,
      blocks = border ? Math.round((this.mpBorders[index] as RulerBorder).nWidth / this.scale) : 0;
    for (let i = start; i < limit; i++) {
      const value = this.mpBorders[i] as RulerBorder,
        edge = Math.round(value.nPos / this.scale),
        fence = Math.round(value.nWidth / this.scale);
      width = rows ? edge : width + edge - previous;
      this.mxRulerImpl.pPercBuf[i] =
        Math.trunc((width * 1000) / this.mxRulerImpl.nTotalDist) & 0xffff;
      this.mxRulerImpl.pBlockBuf[i] = blocks & 0xffff;
      blocks += fence;
      previous = edge + fence;
    }
  }

  /** Computes the represented source table right limiter in device pixels. @param index - Admitted native border. @returns Logical right limit. */
  private CalcPropMaxRight(index: number): number {
    if (this.m_nDragType & SvxRulerDragFlags.OBJECT_SIZE_LINEAR) {
      let visible = 1;
      for (let i = index + 1; i < this.mpBorders.length; i++)
        if (!((this.mpBorders[i] as RulerBorder).nStyle & RulerBorderStyle.Invisible)) visible++;
      return this.margin2 - visible * 5 * this.scale;
    }
    const first = Math.round((this.mpBorders[index] as RulerBorder).nPos / this.scale),
      right = Math.round(this.margin2 / this.scale),
      total = right - first;
    let previous = first,
      smallest = 65535;
    for (let i = index + 1; i <= this.mpBorders.length; i++) {
      const edge =
        i === this.mpBorders.length
          ? right
          : Math.round((this.mpBorders[i] as RulerBorder).nPos / this.scale);
      smallest = Math.min(smallest, edge - previous);
      previous = edge;
    }
    return (
      this.margin2 -
      Math.trunc(Math.fround(Math.fround(5 / Math.fround(smallest)) * total)) * this.scale
    );
  }

  /** Computes source table Border/Margin limits for represented horizontal-writing geometry. @returns Nothing. */
  private CalcMinMax(): void {
    const index = this.GetDragAryPos(),
      count = this.mpBorders.length,
      frame = this.frame as SvxRulerFrame,
      gap = 5 * this.scale,
      rows = this.mxRulerImpl.bIsTableRows,
      proportional = !!(this.m_nDragType & SvxRulerDragFlags.OBJECT_SIZE_PROPORTIONAL);
    if (this.GetDragType() === RulerType.Margin1) {
      this.m_nMaxLeft = 0;
      // Column margins retain the existing ordinary represented range until paragraph/frame margin state is implemented.
      this.m_nMaxRight =
        (count === 0 ? this.margin2 : (this.mpBorders[0] as RulerBorder).nPos) - gap;
    } else if (this.GetDragType() === RulerType.Margin2) {
      this.m_nMaxLeft =
        (rows && proportional
          ? count * gap
          : count === 0
            ? rows
              ? 0
              : this.margin1
            : (this.mpBorders[count - 1] as RulerBorder).nPos) + gap;
      this.m_nMaxRight =
        rows && count > 0 ? (this.mpBorders[count - 1] as RulerBorder).nMaxPos : frame.rightMax;
    } else {
      const border = this.mpBorders[index] as RulerBorder;
      this.m_nMaxLeft = rows && proportional ? (index + 1) * gap : border.nMinPos;
      this.m_nMaxRight =
        !rows && (proportional || this.m_nDragType & SvxRulerDragFlags.OBJECT_SIZE_LINEAR)
          ? this.CalcPropMaxRight(index)
          : border.nMaxPos;
      if (this.m_nDragType & SvxRulerDragFlags.OBJECT_ACTLINE_ONLY) {
        let previous = index - 1,
          following = index + 1;
        while (
          previous >= 0 &&
          (this.mpBorders[previous] as RulerBorder).nStyle & RulerBorderStyle.Invisible
        )
          previous--;
        while (
          following < count &&
          (this.mpBorders[following] as RulerBorder).nStyle & RulerBorderStyle.Invisible
        )
          following++;
        this.m_nMaxLeft = previous < 0 ? 0 : (this.mpBorders[previous] as RulerBorder).nPos;
        if (!rows)
          this.m_nMaxRight =
            following === count ? this.margin2 : (this.mpBorders[following] as RulerBorder).nPos;
      }
      this.m_nMaxLeft += gap;
      this.m_nMaxRight -= gap;
    }
  }

  /** Updates captured transient borders without mutating the application item. @returns Nothing. */
  protected override Drag(): void {
    let position = Math.round(
      Math.max(this.m_nMaxLeft, Math.min(this.m_nMaxRight, this.GetDragPos())),
    );
    const proportional = !!(this.m_nDragType & SvxRulerDragFlags.OBJECT_SIZE_PROPORTIONAL);
    if (proportional && (this.mxRulerImpl.bIsTableRows || this.GetDragType() === RulerType.Border))
      position = Math.round(Math.round(position / this.scale) * this.scale);
    this.SetDragPos(position);
    this.mpBorders = this.originalBorders.map(
      /** Restores the admission snapshot before applying the new absolute drag position. @param border - Original value. @returns Owned copy. */ (
        border,
      ) => ({ ...border }),
    );
    this.margin1 = (this.frame as SvxRulerFrame).left;
    this.margin2 = (this.frame as SvxRulerFrame).right;
    this.DragBorders(position);
  }

  /** Ports represented native linear/proportional/row Border and margin branches. @param position - Source-limited logical position. @returns Nothing. */
  private DragBorders(position: number): void {
    const rows = this.mxRulerImpl.bIsTableRows,
      type = this.GetDragType(),
      count = this.mpBorders.length,
      index = type === RulerType.Border ? this.GetDragAryPos() : count,
      delta = position - this.initialPosition,
      proportional = !!(this.m_nDragType & SvxRulerDragFlags.OBJECT_SIZE_PROPORTIONAL);
    if (rows) {
      if (proportional) {
        const total =
          this.mxRulerImpl.nTotalDist +
          Math.round(position / this.scale) -
          Math.round(this.initialPosition / this.scale);
        for (let i = 0; i < index; i++)
          (this.mpBorders[i] as RulerBorder).nPos = Math.round(
            (Math.trunc((total * (this.mxRulerImpl.pPercBuf[i] as number)) / 1000) +
              (this.mxRulerImpl.pBlockBuf[i] as number)) *
              this.scale,
          );
        // Native Margin2 initializes nIndex=0, so its following translation also visits shares after0.
        if (type === RulerType.Margin2)
          for (let i = 1; i < count; i++) (this.mpBorders[i] as RulerBorder).nPos += delta;
      }
      for (let i = index; i < count; i++)
        (this.mpBorders[i] as RulerBorder).nPos =
          i === index ? position : (this.originalBorders[i] as RulerBorder).nPos + delta;
      this.margin2 += delta;
    } else if (
      type === RulerType.Border &&
      this.m_nDragType & SvxRulerDragFlags.OBJECT_SIZE_LINEAR
    ) {
      let right = this.margin2 - 5 * this.scale;
      for (let i = count - 1; i >= index; i--) {
        const border = this.mpBorders[i] as RulerBorder;
        border.nPos = Math.min(border.nPos + delta, right - border.nWidth);
        right = border.nPos - 5 * this.scale;
      }
    } else if (type === RulerType.Margin1) this.margin1 = position;
    else if (type === RulerType.Margin2) this.margin2 = position;
    else if (proportional) {
      const left = Math.round(position / this.scale),
        total =
          this.mxRulerImpl.nTotalDist - (left - Math.round(this.initialPosition / this.scale));
      (this.mpBorders[index] as RulerBorder).nPos = position;
      for (let i = count - 1; i > index; i--)
        (this.mpBorders[i] as RulerBorder).nPos = Math.round(
          (left +
            Math.trunc((total * (this.mxRulerImpl.pPercBuf[i] as number)) / 1000) +
            (this.mxRulerImpl.pBlockBuf[i] as number)) *
            this.scale,
        );
    } else (this.mpBorders[index] as RulerBorder).nPos = position;
  }

  /** Applies accepted native borders into an independently owned column item. @returns Nothing. */
  private ApplyBorders(): void {
    const item = this.mxColumnItem as SvxColumnItem,
      frame = this.frame as SvxRulerFrame,
      rows = this.mxRulerImpl.bIsTableRows,
      left = rows ? frame.left : this.margin1;
    if (!rows) item.SetLeft(item.GetLeft() + this.margin1 - frame.left);
    item.SetRight(item.GetRight() - (this.margin2 - frame.right));
    for (let i = 0; i < this.mpBorders.length; i++) {
      const border = this.mpBorders[i] as RulerBorder;
      item.At(i).nEnd = border.nPos - left;
      item.At(i + 1).nStart = Math.max(item.At(i).nEnd, border.nPos + border.nWidth - left);
    }
    if (!rows) item.At(item.Count() - 1).nEnd = this.margin2 - left;
  }

  /** Applies accepted changed tracking or restores canceled transient geometry. @returns Nothing. */
  protected override EndDrag(): void {
    this.changed = !this.IsDragCanceled() && this.GetDragPos() !== this.initialPosition;
    if (this.changed) this.ApplyBorders();
    else {
      this.mpBorders = this.originalBorders;
      this.margin1 = (this.frame as SvxRulerFrame).left;
      this.margin2 = (this.frame as SvxRulerFrame).right;
    }
  }
  /** Returns whether the accepted release changed geometry. @returns Source apply decision. */
  public HasChanged(): boolean {
    return this.changed;
  }
  /** Returns the accepted native item without lending internal ownership. @returns Independent column item. */
  public GetColumnItem(): SvxColumnItem {
    return (this.mxColumnItem as SvxColumnItem).Clone();
  }
  /** Reads source current-line apply policy captured at admission. @returns Native boolean flag. */
  public IsActLineOnly(): boolean {
    return !!(this.m_nDragType & SvxRulerDragFlags.OBJECT_ACTLINE_ONLY);
  }
  /** Reads native snapping modifier state for subsequent source tick policy. @returns Native enabled flag. */
  public IsSnapping(): boolean {
    return this.mbSnapping;
  }
  /** Reads native coarse snapping modifier state. @returns Native coarse flag. */
  public IsCoarseSnapping(): boolean {
    return this.mbCoarseSnapping;
  }
}
