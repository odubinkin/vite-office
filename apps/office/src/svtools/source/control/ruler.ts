/** @fileoverview Owns represented document ruler tracking from svtools/source/control/ruler.cxx, without a platform window. */

/** Native ruler hit kinds in their source declaration order. */
export enum RulerType {
  DontKnow,
  Outside,
  Margin1,
  Margin2,
  Border,
  Indent,
  Tab,
  TabAlign,
}

/** Native table border style bits. */
export enum RulerBorderStyle {
  Sizeable = 0x0001,
  Moveable = 0x0002,
  Variable = 0x0004,
  Invisible = 0x0008,
}

/** A device position borrowed from the document window. */
export interface RulerPoint {
  readonly x: number;
  readonly y: number;
}

/** Native ruler border values; logical positions are converted by the injected device scale. */
export interface RulerBorder {
  nPos: number;
  nWidth: number;
  nStyle: RulerBorderStyle;
  nMinPos: number;
  nMaxPos: number;
}

/** Native document hit result, before drag admission. */
export interface RulerSelection {
  readonly nPos: number;
  readonly nAryPos: number;
}

/** Owns start/move/end/cancel state; source-derived subclasses own their item policy. */
export abstract class Ruler {
  protected mpBorders: RulerBorder[] = [];
  protected scale = 1;
  protected origin = 0;
  private meDragType = RulerType.DontKnow;
  private mnDragAryPos = 0;
  private mnDragModifier = 0;
  private mnDragPos = 0;
  private mnStartDragPos = 0;
  private startDevicePosition = 0;
  private mbDrag = false;
  private mbDragCanceled = false;

  /** Creates one physical ruler owner. @param m_bHorz - Horizontal physical axis. @returns Nothing. */
  protected constructor(protected readonly m_bHorz: boolean) {}

  /** Installs current platform device conversion without borrowing document owners. @param origin - Device zero. @param scale - Logical units per device pixel. @returns Nothing. */
  protected SetDocTransform(origin: number, scale: number): void {
    this.origin = origin;
    this.scale = scale;
  }

  /** Admits a represented single-click document hit, then calls the native StartDrag hook. @param point - Document device position. @param eDragType - Requested native hit kind. @param nTolerance - Device hit tolerance. @param modifier - Native key mask. @returns Whether this ruler captured tracking. */
  public StartDocDrag(
    point: RulerPoint,
    eDragType: RulerType,
    nTolerance = 0,
    modifier = 0,
  ): boolean {
    if (this.mbDrag) return false;
    const hit = this.ImplDocHitTest(point, eDragType, nTolerance);
    if (hit === undefined) return false;
    this.meDragType = eDragType;
    this.mnDragAryPos = hit.nAryPos;
    this.mnDragModifier = modifier;
    this.mnDragPos = hit.nPos;
    this.mbDragCanceled = false;
    if (!this.StartDrag()) {
      this.ResetDrag();
      return false;
    }
    this.mbDrag = true;
    this.mnStartDragPos = this.mnDragPos;
    this.startDevicePosition = this.m_bHorz ? point.x : point.y;
    return true;
  }

  /** Advances the captured physical axis and calls the native item policy. @param point - Current device point. @returns Whether tracking handled the point. */
  public Tracking(point: RulerPoint): boolean {
    if (!this.mbDrag) return false;
    const position = this.m_bHorz ? point.x : point.y;
    this.mnDragPos = this.mnStartDragPos + (position - this.startDevicePosition) * this.scale;
    this.Drag();
    return true;
  }

  /** Ends tracking while keeping native drag metadata available to EndDrag. @param cancelled - Restore original ruler values. @returns Whether a capture ended. */
  public EndTracking(cancelled = false): boolean {
    if (!this.mbDrag) return false;
    this.mbDragCanceled = cancelled;
    this.mbDrag = false;
    this.EndDrag();
    this.ResetDrag();
    return true;
  }

  /** Cancels the current source-owned ruler capture. @returns Nothing. */
  public CancelDrag(): void {
    this.EndTracking(true);
  }
  /** Returns native capture state. @returns Whether tracking is active. */
  public IsDrag(): boolean {
    return this.mbDrag;
  }
  /** Returns native release/cancel state to the subclass. @returns Whether canceled. */
  protected IsDragCanceled(): boolean {
    return this.mbDragCanceled;
  }
  /** Returns the admitted native hit kind. @returns Drag kind. */
  public GetDragType(): RulerType {
    return this.meDragType;
  }
  /** Returns the admitted border index. @returns Native array position. */
  protected GetDragAryPos(): number {
    return this.mnDragAryPos;
  }
  /** Returns the exact captured native modifier mask. @returns Native mask. */
  protected GetDragModifier(): number {
    return this.mnDragModifier;
  }
  /** Returns the current logical drag coordinate. @returns Current position. */
  protected GetDragPos(): number {
    return this.mnDragPos;
  }
  /** Replaces the position after source limit/device correction. @param position - Corrected logical coordinate. @returns Nothing. */
  protected SetDragPos(position: number): void {
    this.mnDragPos = position;
  }
  /** Returns the admitted logical coordinate. @returns Initial position. */
  protected GetStartDragPos(): number {
    return this.mnStartDragPos;
  }
  /** Returns the transient guide on this ruler's device axis. @returns Device coordinate or no capture. */
  public GetDragPosition(): number | undefined {
    return this.mbDrag ? this.origin + this.mnDragPos / this.scale : undefined;
  }
  /** Resets native metadata after rejected admission or release. @returns Nothing. */
  private ResetDrag(): void {
    this.meDragType = RulerType.DontKnow;
    this.mnDragAryPos = 0;
    this.mnDragModifier = 0;
    this.mnDragPos = 0;
    this.mbDragCanceled = false;
  }
  /** Resolves a source-owned ruler hit. @param point - Device point. @param type - Requested kind. @param tolerance - Device tolerance. @returns Native hit or none. */
  protected abstract ImplDocHitTest(
    point: RulerPoint,
    type: RulerType,
    tolerance: number,
  ): RulerSelection | undefined;
  /** Initializes subclass policy before tracking. @returns Whether admitted. */
  protected abstract StartDrag(): boolean;
  /** Updates transient item geometry. @returns Nothing. */
  protected abstract Drag(): void;
  /** Applies or restores subclass values before metadata reset. @returns Nothing. */
  protected abstract EndDrag(): void;
}
