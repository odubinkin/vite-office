/** @fileoverview Original table data hierarchy uses genuine range References, intrusive cell/row/map aliases and source start-only validity; no table manager or document model is substituted. */
import { expect, it } from "vitest";
import { CellData, RowData, TableData } from "./TableData";
import { TablePropertyMap } from "./PropertyMap";
import { PropertyIds as P } from "./PropertyIds";
import { SvRef } from "../../../../tools/inc/ref";
import { Reference } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { RuntimeException } from "../../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { DisposedException } from "../../../../cppu/inc/com/sun/star/lang/DisposedException";
import { WeakImplHelper } from "../../../../cppuhelper/inc/implbase";
import { WeakReferenceHelper } from "../../../../cppuhelper/inc/weakref";
import { XTextRange } from "../../../../offapi/com/sun/star/text/XTextRange";
import type { XText } from "../../../../offapi/com/sun/star/text/XText";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";

/** Concrete native virtual caller chooses getStart outcomes; it supplies no library query/default/range-model provider. */
class RangeCaller extends WeakImplHelper.specialize(XTextRange) implements XTextRange {
  mode: "normal" | "empty" | "runtime" | "disposed" | "error" = "normal";
  calls = 0;
  /** Actual external destructor observer. @param name - Caller label. @param destroyed - External observations. @returns Caller. */
  constructor(
    readonly name: string,
    private readonly destroyed: string[],
  ) {
    super();
  }
  /** Original caller-selected virtual result. @returns Acquired range or controlled failure. */
  getStart(): Reference<XTextRange> {
    ++this.calls;
    if (this.mode === "runtime") throw new RuntimeException();
    if (this.mode === "disposed") throw new DisposedException();
    if (this.mode === "error") throw new Error("caller");
    return this.mode === "empty" ? new Reference() : new Reference(this);
  }
  /** Unused caller virtual slot returns its actual own interface. @returns Acquired end. */
  getEnd(): Reference<XTextRange> {
    return new Reference(this);
  }
  /** Caller has no containing document and returns a genuine empty typed reference. @returns Empty text pointer. */
  getText(): Reference<XText> {
    return new Reference();
  }
  /** Unused caller string slot. @returns Owned original string. */
  getString(): OUString {
    return new OUString();
  }
  /** This concrete probe does not model text replacement. @param value - Ignored source. @returns Nothing. */
  setString(value: OUStringConstReference): void {
    void value;
  }
  /** Original virtual destruction observed externally before base destruction. @returns Nothing. */
  protected override destroy(): void {
    this.destroyed.push(this.name);
    super.destroy();
  }
}
/** Inserts actual typed map fields. @param map - Real map. @param id - Property ID. @param value - Original long. @returns Nothing. */
function put(map: TablePropertyMap, id: P, value: number): void {
  const any = new Any([value], "sal_Int32");
  try {
    map.Insert(id, any);
  } finally {
    any.dispose();
  }
}
/** Reads a copied map property. @param map - Actual map. @param id - Required ID. @returns Long. */
function scalar(map: TablePropertyMap, id: P): number {
  const entry = map.getProperty(id),
    value: [number] = [0];
  if (!entry) throw new Error("missing property");
  try {
    expect(entry[1].extract(value, "sal_Int32")).toBe(true);
    return value[0];
  } finally {
    entry[1].dispose();
  }
}

it("retains independent start/end owners, map identity and original cell state", /** Checks actual source constructors, unsigned fields and member references. @returns Nothing. */ () => {
  const destroyed: string[] = [],
    range = new Reference<XTextRange>(new RangeCaller("range", destroyed)),
    weak = new WeakReferenceHelper(range),
    properties = new SvRef(new TablePropertyMap()),
    cell = new SvRef(new CellData(range, properties)),
    object = cell.operatorArrow(),
    nil = new Reference<XTextRange>();
  expect(object.getStart().get()).toBe(range.get());
  expect(object.getEnd().get()).toBe(range.get());
  expect(object.getStart()).not.toBe(object.getEnd());
  expect(object.getProperties().get()).toBe(properties.get());
  expect(properties.operatorArrow().GetRefCount()).toBe(2);
  expect(object.isOpen()).toBe(true);
  expect(object.getGridSpan()).toBe(1);
  object.setGridSpan(-1);
  expect(object.getGridSpan()).toBe(0xffffffff);
  object.setGridSpan(0x100000000);
  expect(object.getGridSpan()).toBe(0);
  expect(object.IsValid()).toBe(true);
  expect((range.get() as RangeCaller).calls).toBe(1);
  object.setEnd(nil);
  expect(object.isOpen()).toBe(false);
  expect(object.IsValid()).toBe(true);
  object.SetStart(range);
  expect(object.isOpen()).toBe(false);
  put(properties.operatorArrow(), P.PROP_HEIGHT, 12);
  const next = new SvRef(new TablePropertyMap());
  put(next.operatorArrow(), P.PROP_WIDTH, 34);
  object.insertProperties(next);
  expect(object.getProperties().get()).toBe(properties.get());
  expect(scalar(properties.operatorArrow(), P.PROP_WIDTH)).toBe(34);
  next.dispose();
  range.clear();
  properties.clear();
  const live = weak.get();
  expect(live.is()).toBe(true);
  live.dispose();
  cell.clear();
  expect(destroyed).toEqual(["range"]);
  const dead = weak.get();
  expect(dead.is()).toBe(false);
  dead.dispose();
  weak.dispose();
  nil.dispose();
  cell.dispose();
  properties.dispose();
  range.dispose();
});

it("checks only stored start and catches only actual RuntimeException", /** Preserves empty-end acceptance, ignored returned pointer and foreign failure propagation. @returns Nothing. */ () => {
  const destroyed: string[] = [],
    nil = new Reference<XTextRange>(),
    none = new SvRef<TablePropertyMap>(),
    range = new Reference<XTextRange>(new RangeCaller("caller", destroyed)),
    cell = new SvRef(new CellData(nil, none)),
    object = cell.operatorArrow(),
    caller = range.get() as RangeCaller;
  expect(object.IsValid()).toBe(false);
  object.SetStart(range);
  expect(object.getEnd().is()).toBe(false);
  expect(object.IsValid()).toBe(true);
  caller.mode = "empty";
  expect(object.IsValid()).toBe(true);
  caller.mode = "runtime";
  expect(object.IsValid()).toBe(false);
  caller.mode = "disposed";
  expect(object.IsValid()).toBe(false);
  caller.mode = "error";
  expect(
    /** Original concrete caller failure is not swallowed. @returns Validity. */ () =>
      object.IsValid(),
  ).toThrow("caller");
  object.insertProperties(none);
  expect(object.getProperties().is()).toBe(false);
  const props = new SvRef(new TablePropertyMap());
  object.insertProperties(props);
  object.insertProperties(none);
  expect(object.getProperties().get()).toBe(props.get());
  cell.dispose();
  props.dispose();
  none.dispose();
  nil.dispose();
  range.dispose();
  expect(destroyed).toEqual(["caller"]);
});

it("keeps empty-row no-ops, closed front cells, copied scalar spans and shallow row aliases", /** Exercises original row pointer copies without replacing them with deep clones. @returns Nothing. */ () => {
  const destroyed: string[] = [],
    a = new Reference<XTextRange>(new RangeCaller("a", destroyed)),
    b = new Reference<XTextRange>(new RangeCaller("b", destroyed)),
    none = new SvRef<TablePropertyMap>(),
    row = new SvRef(new RowData()),
    object = row.operatorArrow();
  expect(object.getCellCount()).toBe(0);
  expect(object.isCellOpen()).toBe(false);
  expect(object.IsCellValid()).toBe(false);
  object.endCell(a);
  object.SetCellStart(a);
  object.setCurrentGridSpan(9);
  object.setCurrentGridSpan(9, true);
  object.insertCellProperties(none);
  object.insertProperties(none);
  object.addCell(a, none);
  expect(object.isCellOpen()).toBe(true);
  object.addCell(b, none, true);
  expect(object.getCellStart(0).get()).toBe(b.get());
  expect(object.getCellEnd(0).get()).toBe(b.get());
  expect(object.getCellStart(1).get()).toBe(a.get());
  expect(object.getCellEnd(1).get()).toBe(a.get());
  expect(object.IsCellValid()).toBe(true);
  object.endCell(b);
  expect(object.isCellOpen()).toBe(false);
  object.SetCellStart(b);
  expect(object.getCellStart(1).get()).toBe(b.get());
  object.setCurrentGridSpan(2, true);
  object.setCurrentGridSpan(3);
  expect(object.getGridSpan(0)).toBe(2);
  const spans = object.getGridSpans();
  expect(spans).toEqual([2, 3]);
  spans[0] = 99;
  expect(object.getGridSpans()).toEqual([2, 3]);
  object.setGridBefore(-1);
  object.setGridAfter(0x100000001);
  expect(object.getGridBefore()).toBe(0xffffffff);
  expect(object.getGridAfter()).toBe(1);
  const props = new SvRef(new TablePropertyMap()),
    extra = new SvRef(new TablePropertyMap());
  put(props.operatorArrow(), P.PROP_HEIGHT, 56);
  put(extra.operatorArrow(), P.PROP_WIDTH, 78);
  object.insertProperties(props);
  object.insertProperties(extra);
  object.insertCellProperties(props);
  expect(object.getProperties().get()).toBe(props.get());
  expect(object.getCellProperties(1).get()).toBe(props.get());
  expect(scalar(props.operatorArrow(), P.PROP_WIDTH)).toBe(78);
  const copy = new SvRef(new RowData(object));
  expect(copy.operatorArrow().getGridBefore()).toBe(0xffffffff);
  expect(copy.operatorArrow().getGridAfter()).toBe(1);
  copy.operatorArrow().setGridBefore(0);
  expect(object.getGridBefore()).toBe(0xffffffff);
  copy.operatorArrow().setCurrentGridSpan(7);
  expect(object.getGridSpans()).toEqual([2, 7]);
  expect(copy.operatorArrow().getProperties().get()).toBe(props.get());
  row.clear();
  expect(copy.operatorArrow().getCellCount()).toBe(2);
  copy.clear();
  props.dispose();
  extra.dispose();
  none.dispose();
  a.dispose();
  b.dispose();
  expect(destroyed).toEqual(["a", "b"]);
  row.dispose();
  copy.dispose();
});

it("retains completed rows and starts independent current rows, including empty rows", /** Checks actual table forwarding, row finalization and explicit borrowed-pointer copies. @returns Nothing. */ () => {
  const destroyed: string[] = [],
    start = new Reference<XTextRange>(new RangeCaller("start", destroyed)),
    end = new Reference<XTextRange>(new RangeCaller("end", destroyed)),
    none = new SvRef<TablePropertyMap>(),
    properties = new SvRef(new TablePropertyMap()),
    table = new SvRef(new TableData(0x100000002)),
    object = table.operatorArrow();
  expect(object.getDepth()).toBe(2);
  expect(object.getRowCount()).toBe(0);
  expect(object.isCellOpen()).toBe(false);
  expect(object.IsCellValid()).toBe(false);
  object.insertCellProperties(none);
  object.SetCellStart(start);
  object.addCell(start, none);
  object.insertCellProperties(properties);
  expect(object.isCellOpen()).toBe(true);
  object.endCell(end);
  expect(object.isCellOpen()).toBe(false);
  object.SetCellStart(end);
  expect(object.IsCellValid()).toBe(true);
  const retained = new SvRef(object.getCurrentRow());
  object.endRow(properties);
  expect(object.getRowCount()).toBe(1);
  expect(object.getRow(0).get()).toBe(retained.get());
  expect(object.getCurrentRow().get()).not.toBe(retained.get());
  expect(object.getCurrentRow().operatorArrow().getCellCount()).toBe(0);
  expect(retained.operatorArrow().getCellProperties(0).get()).toBe(properties.get());
  expect(retained.operatorArrow().getProperties().get()).toBe(properties.get());
  object.endRow(none);
  expect(object.getRowCount()).toBe(2);
  expect(object.getRow(1).operatorArrow().getCellCount()).toBe(0);
  table.clear();
  expect(retained.operatorArrow().getCellEnd(0).get()).toBe(end.get());
  retained.clear();
  table.dispose();
  retained.dispose();
  properties.dispose();
  none.dispose();
  start.dispose();
  end.dispose();
  expect(destroyed).toEqual(["start", "end"]);
});

it("destroys the current row before completed rows in the pinned native vector order", /** Observes only external range destructors; no object is inspected after its native lifetime. @returns Nothing. */ () => {
  const destroyed: string[] = [],
    none = new SvRef<TablePropertyMap>(),
    table = new SvRef(new TableData(1)),
    a = new Reference<XTextRange>(new RangeCaller("a", destroyed)),
    b = new Reference<XTextRange>(new RangeCaller("b", destroyed)),
    c = new Reference<XTextRange>(new RangeCaller("c", destroyed)),
    d = new Reference<XTextRange>(new RangeCaller("d", destroyed));
  table.operatorArrow().addCell(a, none);
  table.operatorArrow().endRow(none);
  table.operatorArrow().addCell(b, none);
  table.operatorArrow().addCell(d, none);
  table.operatorArrow().endRow(none);
  table.operatorArrow().addCell(c, none);
  a.clear();
  b.clear();
  c.clear();
  d.clear();
  table.clear();
  expect(destroyed).toEqual(["c", "d", "b", "a"]);
  table.dispose();
  none.dispose();
  a.dispose();
  b.dispose();
  c.dispose();
  d.dispose();
});
