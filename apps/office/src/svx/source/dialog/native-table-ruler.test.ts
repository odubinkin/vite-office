/** @fileoverview Checks literal native ruler values and ownership without reading upstream. */
import { expect, it } from "vitest";
import {
  Ruler,
  RulerType,
  type RulerPoint,
  type RulerSelection,
} from "../../../svtools/source/control/ruler";
import { SvxRuler, SvxRulerDragFlags } from "./svxruler";
import { SvxColumnDescription, SvxColumnItem } from "./rulritem";
import { KEY_SHIFT, KEY_MOD1, KEY_MOD2, KEY_MOD3 } from "../../../vcl/keycodes";
import { SID_RULER_ROWS_VERTICAL } from "../../inc/svxids";

/** Builds independent literal flat native descriptions. @param ends - Logical separator positions. @param rows - Native row slot. @returns Borrowable native item. */
function item(ends: readonly number[] = [750, 1500], rows = false): SvxColumnItem {
  const value = new SvxColumnItem(0, 0, 3000);
  let start = 0;
  for (const end of ends) {
    value.Append(new SvxColumnDescription(start, end, start, 9000, true));
    start = end;
  }
  value.Append(new SvxColumnDescription(start, rows ? 0 : 2250, 2250, 2250, !rows));
  if (rows) value.SetWhich(SID_RULER_ROWS_VERTICAL);
  return value;
}
/** Supplies native frame/device values independently of Writer. @param rows - Physical row ruler. @param ends - Logical separators. @returns Native ruler and borrowed item. */
function fixture(rows = false, ends?: readonly number[]) {
  const value = item(ends, rows),
    ruler = new SvxRuler(!rows);
  ruler.Update(value, {
    left: 0,
    right: 2250,
    rightMax: 9000,
    origin: 100,
    scale: 15,
    margin1: !rows,
    margin2: true,
  });
  return { ruler, value };
}
/** Reads independent native separator values. @param ruler - Native owner. @returns Column ends excluding tail. */
function ends(ruler: SvxRuler): number[] {
  const value = ruler.GetColumnItem();
  return Array.from(
    { length: value.Count() - 1 },
    /** Reads one native end. @param _unused - Empty value. @param i - Native index. @returns Logical end. */ (
      _unused,
      i,
    ) => value.At(i).nEnd,
  );
}

it("native table ruler owns borrowed values and exact5px hit tolerance", /** Checks persistent data isolation, unsupported hits and repeated tracking admission. @returns Nothing. */ () => {
  const { ruler, value } = fixture();
  value.At(0).nEnd = 99;
  expect(ruler.GetColumnItem().At(0).nEnd).toBe(750);
  expect(ruler.StartDocDrag({ x: 156, y: 999 }, RulerType.Border, 5)).toBe(false);
  expect(ruler.StartDocDrag({ x: 155, y: -999 }, RulerType.Border, 5)).toBe(true);
  expect(ruler.GetDragType()).toBe(RulerType.Border);
  expect(ruler.IsDrag()).toBe(true);
  expect(ruler.StartDocDrag({ x: 200, y: 0 }, RulerType.Border, 5)).toBe(false);
  expect(ruler.Tracking({ x: 185, y: 10000 })).toBe(true);
  expect(ruler.GetDragPosition()).toBe(180);
  expect(ruler.GetColumnItem().At(0).nEnd).toBe(750);
  expect(ruler.EndTracking()).toBe(true);
  expect(ends(ruler)).toEqual([1200, 1500]);
  const published = ruler.GetColumnItem();
  published.At(0).nEnd = -999;
  expect(ends(ruler)).toEqual([1200, 1500]);
  expect(ruler.GetDragType()).toBe(RulerType.DontKnow);
  expect(ruler.GetDragPosition()).toBeUndefined();
  expect(ruler.Tracking({ x: 200, y: 0 })).toBe(false);
  expect(ruler.EndTracking()).toBe(false);
});

it("requires an exact separator hit when document drag tolerance is omitted", /** Checks the zero tolerance default through a real ruler. @returns Nothing. */ () => {
  const { ruler } = fixture();
  expect(ruler.StartDocDrag({ x: 151, y: 0 }, RulerType.Border)).toBe(false);
  expect(ruler.StartDocDrag({ x: 150, y: 0 }, RulerType.Border)).toBe(true);
  expect(ruler.EndTracking()).toBe(true);
  expect(ends(ruler)).toEqual([750, 1500]);
});
it.each([
  [0, false, true, false],
  [KEY_SHIFT, false, true, false],
  [KEY_MOD1, false, true, false],
  [KEY_MOD1 | KEY_SHIFT, true, true, false],
  [KEY_MOD2, false, false, false],
  [KEY_MOD2 | KEY_SHIFT, false, true, true],
  [KEY_MOD1 | KEY_MOD2, false, true, false],
  [KEY_MOD3, false, true, false],
] as const)(
  "native exact mask%s retains active=%s snapping=%s coarse=%s",
  /** Checks source modifier defaults and exact switches. @param modifier - Native mask. @param active - Literal current-line flag. @param snapping - Literal enabled flag. @param coarse - Literal coarse flag. @returns Nothing. */ (
    modifier,
    active,
    snapping,
    coarse,
  ) => {
    const { ruler } = fixture();
    expect(ruler.StartDocDrag({ x: 150, y: 0 }, RulerType.Border, 5, modifier)).toBe(true);
    expect(ruler.IsActLineOnly()).toBe(active);
    expect(ruler.IsSnapping()).toBe(snapping);
    expect(ruler.IsCoarseSnapping()).toBe(coarse);
    ruler.CancelDrag();
    expect(ruler.HasChanged()).toBe(false);
    expect(ends(ruler)).toEqual([750, 1500]);
  },
);
it.each([
  [0, [1200, 1500]],
  [KEY_SHIFT, [1200, 1950]],
  [KEY_MOD1, [1200, 1725]],
  [KEY_MOD1 | KEY_SHIFT, [1200, 1500]],
] as const)(
  "native column mask%s uses independently specified geometry",
  /** Checks native ordinary/linear/proportional/current-line values. @param modifier - Native mask. @param expected - Literal ends. @returns Nothing. */ (
    modifier,
    expected,
  ) => {
    const { ruler } = fixture();
    ruler.StartDocDrag({ x: 150, y: 0 }, RulerType.Border, 5, modifier);
    ruler.Tracking({ x: 180, y: 0 });
    ruler.EndTracking();
    expect(ends(ruler)).toEqual(expected);
    expect(ruler.HasChanged()).toBe(true);
  },
);
it.each([
  [0, [750, 1950], 2550],
  [KEY_SHIFT, [750, 1950], 2550],
  [KEY_MOD1, [975, 1950], 2550],
  [KEY_MOD1 | KEY_SHIFT, [750, 1950], 2550],
] as const)(
  "native row mask%s retains source preceding/following policy",
  /** Checks physical vertical ownership and literal independent values. @param modifier - Native mask. @param expected - Literal ends. @param right - Literal right frame distance. @returns Nothing. */ (
    modifier,
    expected,
    right,
  ) => {
    const { ruler } = fixture(true);
    ruler.StartDocDrag({ x: 0, y: 200 }, RulerType.Border, 5, modifier);
    ruler.Tracking({ x: -99999, y: 230 });
    expect(ruler.GetDragPosition()).toBe(230);
    ruler.EndTracking();
    expect(ends(ruler)).toEqual(expected);
    expect(ruler.GetColumnItem().GetRight()).toBe(right);
  },
);
it("native bottom row Ctrl preserves Margin2 nIndex0 following translation", /** Checks the source margin exception using literal unequal final heights. @returns Nothing. */ () => {
  const { ruler } = fixture(true);
  ruler.StartDocDrag({ x: 0, y: 250 }, RulerType.Margin2, 5, KEY_MOD1);
  ruler.Tracking({ x: 0, y: 280 });
  ruler.EndTracking();
  expect(ends(ruler)).toEqual([885, 2235]);
  expect(ruler.GetColumnItem().GetRight()).toBe(2550);
  expect(ruler.IsActLineOnly()).toBe(false);
});
it.each([RulerType.Margin1, RulerType.Margin2])(
  "native column margin%s keeps its represented ordinary policy",
  /** Checks existing partial margin contract and independent native edge distances. @param type - Native margin. @returns Nothing. */ (
    type,
  ) => {
    const { ruler } = fixture(),
      x = type === RulerType.Margin1 ? 100 : 250;
    ruler.StartDocDrag({ x, y: 0 }, type, 5, KEY_MOD1);
    ruler.Tracking({ x: x + 20, y: 0 });
    ruler.EndTracking();
    expect(ends(ruler)).toEqual(type === RulerType.Margin1 ? [450, 1200] : [750, 1500]);
    expect([ruler.GetColumnItem().GetLeft(), ruler.GetColumnItem().GetRight()]).toEqual(
      type === RulerType.Margin1 ? [300, 3000] : [0, 2700],
    );
  },
);
it("native ruler cancellation and unchanged releases keep original items", /** Checks uncommitted transient state restoration and flags after a second admission. @returns Nothing. */ () => {
  const { ruler } = fixture();
  ruler.StartDocDrag({ x: 150, y: 0 }, RulerType.Border, 5, KEY_MOD2);
  ruler.Tracking({ x: 170, y: 0 });
  ruler.CancelDrag();
  expect(ends(ruler)).toEqual([750, 1500]);
  ruler.StartDocDrag({ x: 150, y: 0 }, RulerType.Border, 5);
  expect(ruler.IsSnapping()).toBe(true);
  ruler.EndTracking();
  expect(ruler.HasChanged()).toBe(false);
  expect(ends(ruler)).toEqual([750, 1500]);
});
it("native hidden-border current-line limits use the previous and following visible fences", /** Checks both source sentinel paths without document DTOs. @returns Nothing. */ () => {
  const { ruler, value } = fixture(false, [450, 900, 1350, 1800]);
  value.At(0).bVisible = false;
  value.At(2).bVisible = false;
  ruler.Update(value, {
    left: 0,
    right: 2250,
    rightMax: 9000,
    origin: 100,
    scale: 15,
    margin1: true,
    margin2: true,
  });
  expect(ruler.StartDocDrag({ x: 130, y: 0 }, RulerType.Border, 5)).toBe(false);
  ruler.StartDocDrag({ x: 160, y: 0 }, RulerType.Border, 5, KEY_MOD1 | KEY_SHIFT);
  ruler.Tracking({ x: -1000, y: 0 });
  expect(ruler.GetDragPosition()).toBe(105);
  ruler.Tracking({ x: 9999, y: 0 });
  expect(ruler.GetDragPosition()).toBe(215);
  ruler.CancelDrag();
  ruler.StartDocDrag({ x: 220, y: 0 }, RulerType.Border, 5, KEY_MOD1 | KEY_SHIFT);
  ruler.Tracking({ x: 9999, y: 0 });
  expect(ruler.GetDragPosition()).toBe(245);
  ruler.CancelDrag();
});
it("native proportional buffers include independent fence widths", /** Checks source unsigned width-block storage in owned SvxColumnItem descriptions. @returns Nothing. */ () => {
  const { ruler, value } = fixture();
  value.At(1).nStart = 900;
  value.At(2).nStart = 1650;
  ruler.Update(value, {
    left: 0,
    right: 2250,
    rightMax: 9000,
    origin: 100,
    scale: 15,
    margin1: true,
    margin2: true,
  });
  ruler.StartDocDrag({ x: 150, y: 0 }, RulerType.Border, 5, KEY_MOD1);
  ruler.Tracking({ x: 170, y: 0 });
  ruler.EndTracking();
  expect(ends(ruler)).toEqual([1050, 1650]);
  expect(ruler.GetColumnItem().At(1).nStart).toBe(1200);
});
it("native ruler declines absent, non-table and unrepresented writing contexts", /** Checks admission boundaries instead of treating omitted source contexts as implemented. @returns Nothing. */ () => {
  const ruler = new SvxRuler(true),
    frame = {
      left: 0,
      right: 2250,
      rightMax: 9000,
      origin: 100,
      scale: 15,
      margin1: true,
      margin2: true,
    };
  expect(ruler.StartDocDrag({ x: 100, y: 0 }, RulerType.Margin1, 5)).toBe(false);
  ruler.Update(new SvxColumnItem(), frame);
  expect(ruler.StartDocDrag({ x: 100, y: 0 }, RulerType.Margin1, 5)).toBe(false);
  ruler.Update(item(undefined, true), frame);
  expect(ruler.StartDocDrag({ x: 150, y: 0 }, RulerType.Border, 5)).toBe(false);
  expect(ruler.GetDragType()).toBe(RulerType.DontKnow);
  const vertical = new SvxRuler(false);
  vertical.Update(item(), { ...frame, margin1: false, margin2: false });
  expect(vertical.StartDocDrag({ x: 0, y: 150 }, RulerType.Border, 5)).toBe(false);
  expect(vertical.StartDocDrag({ x: 0, y: 100 }, RulerType.Margin1, 5)).toBe(false);
  expect(vertical.StartDocDrag({ x: 0, y: 250 }, RulerType.Margin2, 5)).toBe(false);
  expect(vertical.StartDocDrag({ x: 0, y: 150 }, RulerType.Indent, 5)).toBe(false);
  expect(SvxRulerDragFlags.OBJECT_LEFT_INDENT_ONLY).toBe(4);
});

/** A direct native tracking hook probe, with no platform or item-policy adapter. */
class TrackingProbe extends Ruler {
  public starts: number[] = [];
  public moved: number[] = [];
  public canceled: boolean[] = [];
  public accept = true;
  /** Creates an independently scaled native axis. @param horizontal - Physical axis. @returns Nothing. */
  public constructor(horizontal: boolean) {
    super(horizontal);
    this.SetDocTransform(10, 2);
  }
  /** Supplies a literal native hit. @param _point - Borrowed position. @param type - Native kind. @returns Literal hit or none. */
  protected override ImplDocHitTest(
    _point: RulerPoint,
    type: RulerType,
  ): RulerSelection | undefined {
    return type === RulerType.Border ? { nPos: 20, nAryPos: 3 } : undefined;
  }
  /** Observes source drag metadata before admission. @returns Configured native hook decision. */
  protected override StartDrag(): boolean {
    this.starts.push(this.GetDragAryPos(), this.GetDragModifier(), this.GetDragPos());
    return this.accept;
  }
  /** Observes native initial and current positions. @returns Nothing. */
  protected override Drag(): void {
    this.moved.push(this.GetStartDragPos(), this.GetDragPos());
  }
  /** Observes cancellation before the metadata reset. @returns Nothing. */
  protected override EndDrag(): void {
    this.canceled.push(this.IsDragCanceled());
  }
}
it.each([false, true])(
  "native Ruler hook lifecycle owns physical axis horizontal=%s",
  /** Checks original start metadata, rejection, same-handle movement, reset and cancel semantics. @param horizontal - Literal axis. @returns Nothing. */ (
    horizontal,
  ) => {
    const ruler = new TrackingProbe(horizontal);
    ruler.accept = false;
    expect(ruler.StartDocDrag({ x: 50, y: 50 }, RulerType.Border, 5, 123)).toBe(false);
    expect(ruler.GetDragType()).toBe(RulerType.DontKnow);
    ruler.accept = true;
    expect(ruler.StartDocDrag({ x: 50, y: 50 }, RulerType.Border, 5, 456)).toBe(true);
    expect(ruler.starts).toEqual([3, 123, 20, 3, 456, 20]);
    ruler.Tracking({ x: horizontal ? 60 : 999, y: horizontal ? 999 : 60 });
    expect(ruler.moved).toEqual([20, 40]);
    expect(ruler.GetDragPosition()).toBe(30);
    ruler.CancelDrag();
    expect(ruler.canceled).toEqual([true]);
    ruler.CancelDrag();
    expect(ruler.canceled).toEqual([true]);
  },
);

it.each([
  [KEY_SHIFT, [2025, 2100, 2175], 235],
  [KEY_MOD1, [1935, 2055, 2145], 229],
] as const)(
  "native unequal hidden column fences retain source limit for mask%s",
  /** Checks new unequal/hidden native value geometry, fractional input and source minimum-space bounds. @param modifier - Exact native mask. @param expected - Literal ends after maximum clamp. @param guide - Literal device guide. @returns Nothing. */ (
    modifier,
    expected,
    guide,
  ) => {
    const { ruler, value } = fixture(false, [300, 1050, 1650]);
    value.At(1).bVisible = false;
    ruler.Update(value, {
      left: 0,
      right: 2250,
      rightMax: 9000,
      origin: 100,
      scale: 15,
      margin1: true,
      margin2: true,
    });
    ruler.StartDocDrag({ x: 120, y: 0 }, RulerType.Border, 5, modifier);
    ruler.Tracking({ x: 155.6, y: 9999 });
    expect(ruler.GetDragPosition()).toBe(modifier === KEY_SHIFT ? 155.6 : 156);
    ruler.Tracking({ x: 9999, y: 0 });
    expect(ruler.GetDragPosition()).toBe(guide);
    ruler.EndTracking();
    expect(ends(ruler)).toEqual(expected);
    expect(ruler.GetColumnItem().At(1).bVisible).toBe(false);
  },
);
it("native unequal row shares survive fractional backtracking and distinct bottom admission", /** Checks new direct-owner integer-device source shares on unequal rows for Border and Margin2. @returns Nothing. */ () => {
  const { ruler } = fixture(true, [300, 1050]);
  ruler.StartDocDrag({ x: 0, y: 170 }, RulerType.Border, 5, KEY_MOD1);
  ruler.Tracking({ x: 9999, y: 198.4 });
  expect(ruler.GetDragPosition()).toBe(198);
  ruler.Tracking({ x: 0, y: 205 });
  ruler.EndTracking();
  expect(ends(ruler)).toEqual([435, 1575]);
  expect(ruler.GetColumnItem().GetRight()).toBe(2475);
  const bottom = fixture(true, [300, 1050]).ruler;
  bottom.StartDocDrag({ x: 0, y: 250 }, RulerType.Margin2, 5, KEY_MOD1);
  bottom.Tracking({ x: 0, y: 280 });
  bottom.EndTracking();
  expect(ends(bottom)).toEqual([345, 1695]);
  expect(bottom.GetColumnItem().GetRight()).toBe(2550);
});
