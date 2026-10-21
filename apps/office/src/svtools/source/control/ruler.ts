/** @fileoverview Owns represented document ruler tracking from svtools/source/control/ruler.cxx, without a platform window. */

import { FieldUnit } from "../../../tools/inc/fldunit";
import { MapUnit } from "../../../tools/inc/mapunit";
/** Original RulerUnitData columns,including source map unit and four logical tick intervals. */
export interface RulerUnitData {
  readonly eMapUnit: MapUnit;
  readonly nTickUnit: number;
  readonly nTick1: number;
  readonly nTick2: number;
  readonly nTick3: number;
  readonly nTick4: number;
  readonly aUnitStr: string;
}
/** Original aImplRulerUnitTab order and values;CHAR/LINE device overrides remain with formatting. */
export const RULER_UNIT_DATA = [
  [
    FieldUnit.MM,
    {
      eMapUnit: MapUnit.Map100thMM,
      nTickUnit: 100,
      nTick1: 25,
      nTick2: 25,
      nTick3: 50,
      nTick4: 100,
      aUnitStr: " mm",
    },
  ],
  [
    FieldUnit.CM,
    {
      eMapUnit: MapUnit.Map100thMM,
      nTickUnit: 1000,
      nTick1: 100,
      nTick2: 500,
      nTick3: 1000,
      nTick4: 1000,
      aUnitStr: " cm",
    },
  ],
  [
    FieldUnit.M,
    {
      eMapUnit: MapUnit.MapMM,
      nTickUnit: 1000,
      nTick1: 10,
      nTick2: 250,
      nTick3: 500,
      nTick4: 1000,
      aUnitStr: " m",
    },
  ],
  [
    FieldUnit.KM,
    {
      eMapUnit: MapUnit.MapCM,
      nTickUnit: 100000,
      nTick1: 12500,
      nTick2: 25000,
      nTick3: 50000,
      nTick4: 100000,
      aUnitStr: " km",
    },
  ],
  [
    FieldUnit.INCH,
    {
      eMapUnit: MapUnit.Map1000thInch,
      nTickUnit: 1000,
      nTick1: 62.5,
      nTick2: 125,
      nTick3: 500,
      nTick4: 1000,
      aUnitStr: '"',
    },
  ],
  [
    FieldUnit.FOOT,
    {
      eMapUnit: MapUnit.Map100thInch,
      nTickUnit: 1200,
      nTick1: 120,
      nTick2: 120,
      nTick3: 600,
      nTick4: 1200,
      aUnitStr: "'",
    },
  ],
  [
    FieldUnit.MILE,
    {
      eMapUnit: MapUnit.Map10thInch,
      nTickUnit: 633600,
      nTick1: 63360,
      nTick2: 63360,
      nTick3: 316800,
      nTick4: 633600,
      aUnitStr: " miles",
    },
  ],
  [
    FieldUnit.POINT,
    {
      eMapUnit: MapUnit.MapPoint,
      nTickUnit: 1,
      nTick1: 12,
      nTick2: 12,
      nTick3: 12,
      nTick4: 36,
      aUnitStr: " pt",
    },
  ],
  [
    FieldUnit.PICA,
    {
      eMapUnit: MapUnit.Map100thMM,
      nTickUnit: 423,
      nTick1: 423,
      nTick2: 423,
      nTick3: 423,
      nTick4: 846,
      aUnitStr: " pc",
    },
  ],
  [
    FieldUnit.CHAR,
    {
      eMapUnit: MapUnit.Map100thMM,
      nTickUnit: 371,
      nTick1: 371,
      nTick2: 371,
      nTick3: 371,
      nTick4: 743,
      aUnitStr: " ch",
    },
  ],
  [
    FieldUnit.LINE,
    {
      eMapUnit: MapUnit.Map100thMM,
      nTickUnit: 551,
      nTick1: 551,
      nTick2: 551,
      nTick3: 551,
      nTick4: 1102,
      aUnitStr: " li",
    },
  ],
] as const satisfies readonly (readonly [FieldUnit, RulerUnitData])[];
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
  private meUnit = FieldUnit.CM;
  private mnUnitIndex = 1;
  /** Original SetUnit preserves the previous table index for an unsupported enum while retaining the requested unit. @param unit - Native unit. @returns Nothing. */
  public SetUnit(unit: FieldUnit): void {
    if (this.meUnit === unit) return;
    this.meUnit = unit;
    const index = RULER_UNIT_DATA.findIndex(
      /** Original unit-to-table switch projection. @param entry - Native table row. @returns Matching enum. */ (
        entry,
      ) => entry[0] === unit,
    );
    if (index !== -1) this.mnUnitIndex = index;
  }
  /** Original current unit query. @returns Field unit. */
  public GetUnit(): FieldUnit {
    return this.meUnit;
  }
  /** Original borrowed unit table row. @returns Native unit data. */
  public GetCurrentRulerUnit(): RulerUnitData {
    return (RULER_UNIT_DATA[this.mnUnitIndex] as readonly [FieldUnit, RulerUnitData])[1];
  }
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
