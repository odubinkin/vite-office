/** @fileoverview Actual constructor/removal registry, live node indices, destruction and layout-first content-box selection from pinned swtable.cxx. */
import { assert, expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwPosition } from "../crsr/pam";
import { SwTableBox, SwTableLine, SwTableSortBoxes } from "./swtable";
import { SwInsertTableFlags } from "../../../inc/itabenum";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwTabFrame, SwCellFrame, SwRowFrame } from "../layout/tabfrm";
import { SwTextFrame } from "../text/txtfrm";
/** Owns a real native inserted table and its source pointer registry. @returns Actual model fixture. */
function fixture() {
  const doc = new SwDoc(),
    first = doc.paragraphs[0];
  assert(first);
  const pos = new SwPosition(first),
    table = doc.InsertTable(
      { mnInsMode: SwInsertTableFlags.All, mnRowsToRepeat: 1 },
      pos,
      1,
      2,
      HoriOrientation.FULL,
    );
  pos.Dispose();
  assert(table);
  const row = table.GetTabLines()[0];
  assert(row);
  const [a, b] = row.GetTabBoxes();
  assert(a && b);
  return {
    doc,
    table,
    row,
    a,
    b,
    /** Removes actual source table while its document and formats are alive. @returns Nothing. */ close() {
      doc.nodes.DeleteTable(table.GetTableNode());
      doc.Dispose();
    },
  };
}
it("registers distinct content pointers and excludes anonymous boxes", /** Pointer equality is independent of section-index equality or graph placement. @returns Nothing. */ () => {
  const x = fixture(),
    boxes = x.table.GetTabSortBoxes(),
    copy = new SwTableBox(x.a.GetFrameFormat(), x.a.GetStartNode()),
    anonymous = new SwTableBox(x.doc.MakeTableBoxFormat(), 3);
  expect(boxes).toBeInstanceOf(SwTableSortBoxes);
  expect(boxes.size()).toBe(3);
  expect(boxes.find(copy)).toBeGreaterThanOrEqual(0);
  expect(boxes.find(anonymous)).toBe(-1);
  expect(boxes.insert(copy)[1]).toBe(false);
  expect(boxes.size()).toBe(3);
  copy.Dispose();
  anonymous.Dispose();
  x.close();
});
it("resolves a registered content pointer independently of owned row-vector placement", /** Source construction registers before row publication and vector erase does not deregister content. @returns Nothing. */ () => {
  const x = fixture(),
    index = x.a.GetSttIdx();
  x.row.RemoveBox(x.a);
  expect(x.table.GetTableBox(index)).toBe(x.a);
  x.row.AddBox(x.a, 0);
  x.close();
});
it("removes only the original pointer and clears its start exactly once", /** Actual registry erase leaves independently registered boxes alive. @returns Nothing. */ () => {
  const x = fixture(),
    copy = new SwTableBox(x.a.GetFrameFormat(), x.a.GetStartNode()),
    boxes = x.table.GetTabSortBoxes();
  copy.RemoveFromTable();
  expect(copy.GetSttNd()).toBeNull();
  expect(copy.GetSttIdx()).toBe(0);
  expect(boxes.find(copy)).toBe(-1);
  expect(boxes.find(x.a)).toBeGreaterThanOrEqual(0);
  expect(boxes.size()).toBe(2);
  copy.RemoveFromTable();
  expect(boxes.size()).toBe(2);
  copy.Dispose();
  x.close();
});
it("uses live section indices after node insertion without rebuilding pointer order", /** No cached node-offset map or node-order comparator is substituted. @returns Nothing. */ () => {
  const x = fixture(),
    old = x.a.GetSttIdx(),
    order = [...x.table.GetTabSortBoxes()];
  x.doc.nodes.MakeTextNode(x.table.GetTableNode(), x.doc.GetDfltTextFormatColl());
  expect(x.a.GetSttIdx()).toBe(old + 1);
  expect([...x.table.GetTabSortBoxes()]).toEqual(order);
  expect(x.table.GetTableBox(x.a.GetSttIdx())).toBe(x.a);
  expect(x.table.GetTableBox(x.b.GetSttIdx())).toBe(x.b);
  x.close();
});
it("uses the original reverse pointer-registry fallback for equal section indices", /** Native pointer ordering is opaque, so expected identity comes from the actual ordered container, not a guessed allocator address. @returns Nothing. */ () => {
  const x = fixture(),
    copy = new SwTableBox(x.a.GetFrameFormat(), x.a.GetStartNode()),
    index = x.a.GetSttIdx();
  const matches = [...x.table.GetTabSortBoxes()].filter(
    /** Selects actual same-start pointers. @param box - Real registry pointer. @returns Match. */ (
      box,
    ) => box.GetSttIdx() === index,
  );
  expect(matches).toHaveLength(2);
  expect(x.table.GetTableBox(index)).toBe(matches.at(-1));
  copy.Dispose();
  x.close();
});
it("retains registered ownership through nested line moves and detects source table complexity", /** Native complexity is a nested upper box, not a count of document table nodes. @returns Nothing. */ () => {
  const x = fixture();
  expect(x.table.IsTableComplex()).toBe(false);
  const group = new SwTableBox(x.doc.MakeTableBoxFormat(), 1, x.row),
    nested = new SwTableLine(x.doc.MakeTableLineFormat(), 1, group);
  x.row.RemoveBox(x.b);
  group.AddLine(nested);
  nested.AddBox(x.b);
  x.row.AddBox(group);
  expect(x.table.GetTabSortBoxes().size()).toBe(2);
  expect(x.table.IsTableComplex()).toBe(true);
  expect(x.table.GetTableBox(x.b.GetSttIdx())).toBe(x.b);
  x.close();
});
it("clears all starts and the borrowed registry before owned child destruction", /** Spies call through to actual source owners; no returned table or destructor is replaced. @returns Nothing. */ () => {
  const x = fixture(),
    boxes = x.table.GetTabSortBoxes(),
    clear = vi.spyOn(x.a, "SourceClearStartNode"),
    removed = vi.spyOn(x.a, "RemoveFromTable"),
    destroyed = vi.spyOn(x.a, "Dispose"),
    registryClear = vi.spyOn(boxes, "clear");
  x.doc.nodes.DeleteTable(x.table.GetTableNode());
  expect(clear).toHaveBeenCalledOnce();
  expect(destroyed).toHaveBeenCalledOnce();
  expect(clear.mock.invocationCallOrder[0]).toBeLessThan(
    destroyed.mock.invocationCallOrder[0] as number,
  );
  expect(removed).toHaveBeenCalledOnce();
  expect(registryClear).toHaveBeenCalledOnce();
  expect(registryClear.mock.invocationCallOrder[0]).toBeLessThan(
    destroyed.mock.invocationCallOrder[0] as number,
  );
  x.doc.Dispose();
});
it("takes the actual content layout cell before consulting the pointer registry", /** Actual text/table/cell frames provide original ownership, not a mocked layout result. @returns Nothing. */ () => {
  const x = fixture(),
    frame = new SwTabFrame(x.table),
    row = frame.Lower();
  assert(row instanceof SwRowFrame);
  const cell = row.Lower();
  assert(cell instanceof SwCellFrame);
  const node = x.a.GetParagraphs()[0];
  assert(node);
  const text = new SwTextFrame(node, "native", 0, 0, 0, []);
  text.InsertBehind(cell);
  const registry = vi.spyOn(x.table.GetTabSortBoxes(), "size");
  expect(x.table.GetTableBox(x.a.GetSttIdx())).toBe(x.a);
  expect(registry).not.toHaveBeenCalled();
  frame.Dispose();
  x.close();
});
it("falls back to registered content when the first real content frame has no cell parent", /** Source lookup does not require or fabricate a current layout root. @returns Nothing. */ () => {
  const x = fixture(),
    node = x.a.GetParagraphs()[0];
  assert(node);
  const text = new SwTextFrame(node, "detached", 0, 0, 0, []),
    registry = vi.spyOn(x.table.GetTabSortBoxes(), "size");
  expect(x.table.GetTableBox(x.a.GetSttIdx())).toBe(x.a);
  expect(registry).toHaveBeenCalledOnce();
  text.Dispose();
  x.close();
});
it("uses a nested table's real frame registration to find its outer content cell", /** Pins the original nested-table scan branch and actual upper-cell ownership. @returns Nothing. */ () => {
  const x = fixture(),
    node = x.a.GetParagraphs()[0];
  assert(node);
  const pos = new SwPosition(node),
    inner = x.doc.InsertTable(
      { mnInsMode: SwInsertTableFlags.All, mnRowsToRepeat: 1 },
      pos,
      1,
      1,
      HoriOrientation.FULL,
    );
  pos.Dispose();
  assert(inner);
  const outerFrame = new SwTabFrame(x.table),
    row = outerFrame.Lower();
  assert(row instanceof SwRowFrame);
  const cell = row.Lower();
  assert(cell instanceof SwCellFrame);
  const innerFrame = new SwTabFrame(inner);
  innerFrame.InsertBehind(cell);
  const registry = vi.spyOn(x.table.GetTabSortBoxes(), "size");
  expect(x.table.GetTableBox(x.a.GetSttIdx())).toBe(x.a);
  expect(registry).not.toHaveBeenCalled();
  innerFrame.RemoveFromLayout();
  innerFrame.Dispose();
  x.doc.nodes.DeleteTable(inner.GetTableNode());
  outerFrame.Dispose();
  x.close();
});
it("preserves the native layout-dependent result for an index from another table", /** WRITER344: real same-document foreign table/index shows the source asymmetry; caller reachability in compiled Writer is not asserted. @returns Nothing. */ () => {
  const x = fixture(),
    body = x.doc.paragraphs[0];
  assert(body);
  const pos = new SwPosition(body),
    other = x.doc.InsertTable(
      { mnInsMode: SwInsertTableFlags.All, mnRowsToRepeat: 1 },
      pos,
      1,
      1,
      HoriOrientation.FULL,
    );
  pos.Dispose();
  assert(other);
  const box = other.GetTabLines()[0]?.GetTabBoxes()[0],
    node = box?.GetParagraphs()[0];
  assert(box && node);
  const index = box.GetSttIdx();
  expect(x.table.GetTableBox(index)).toBeUndefined();
  const frame = new SwTabFrame(other),
    row = frame.Lower();
  assert(row instanceof SwRowFrame);
  const cell = row.Lower();
  assert(cell instanceof SwCellFrame);
  const text = new SwTextFrame(node, "foreign table", 0, 0, 0, []);
  text.InsertBehind(cell);
  expect(x.table.GetTableBox(index)).toBe(box);
  frame.Dispose();
  x.doc.nodes.DeleteTable(other.GetTableNode());
  x.close();
});
