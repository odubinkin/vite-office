/** @fileoverview Actual content/anonymous box hierarchy exercises native parent identity, previous-content traversal and recursive owned lifetimes required by HTML table materialization. */
import { assert, expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwPosition } from "../crsr/pam";
import { SwInsertTableFlags } from "../../../inc/itabenum";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwTableBox, SwTableLine } from "./swtable";
/** Reparents actual native content cells into a real anonymous box; no document node or table result is fabricated. @returns Owned real graph. */
function fixture() {
  const doc = new SwDoc(),
    first = doc.paragraphs[0];
  assert(first);
  const pos = new SwPosition(first),
    table = doc.InsertTable(
      { mnInsMode: SwInsertTableFlags.All, mnRowsToRepeat: 1 },
      pos,
      2,
      3,
      HoriOrientation.FULL,
    );
  pos.Dispose();
  assert(table);
  const [top, bottom] = table.GetTabLines();
  assert(top && bottom);
  const [a, b, c] = top.GetTabBoxes(),
    [d, e, f] = bottom.GetTabBoxes();
  assert(a && b && c && d && e && f);
  top.RemoveBox(b);
  top.RemoveBox(c);
  bottom.RemoveBox(d);
  const group = new SwTableBox(doc.MakeTableBoxFormat(), 2, top),
    one = new SwTableLine(doc.MakeTableLineFormat(), 1, group),
    two = new SwTableLine(doc.MakeTableLineFormat(), 1, group);
  group.AddLine(one);
  group.AddLine(two);
  one.AddBox(b);
  two.AddBox(c);
  top.AddBox(group);
  top.AddBox(d);
  return {
    doc,
    table,
    top,
    bottom,
    a,
    b,
    c,
    d,
    e,
    f,
    group,
    one,
    two,
    /** Removes the real table while its document and formats remain live. @returns Nothing. */ close() {
      doc.nodes.DeleteTable(table.GetTableNode());
      doc.Dispose();
    },
  };
}
it("reserves native anonymous capacity without allocating content nodes or child rows", /** Native reserve counts do not produce dummy rows/cells. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    count = doc.nodes.entries().length,
    box = new SwTableBox(doc.MakeTableBoxFormat(), 3),
    row = new SwTableLine(doc.MakeTableLineFormat(), 4, box);
  expect(box.GetSttNd()).toBeNull();
  expect(box.GetUpper()).toBeNull();
  expect(box.GetTabLines()).toHaveLength(0);
  expect(row.GetUpper()).toBe(box);
  expect(row.GetTabBoxes()).toHaveLength(0);
  expect(doc.nodes.entries()).toHaveLength(count);
  expect(
    /** Reads the required leaf-only boundary. @returns Actual start. */ () => box.GetStartNode(),
  ).toThrow("content box has a start node");
  row.Dispose();
  box.Dispose();
  doc.Dispose();
});
it("preserves actual source upper identities through content and anonymous ownership", /** Tests actual graph owners, including normal document insertion builders. @returns Nothing. */ () => {
  const x = fixture();
  expect(x.top.GetUpper()).toBeNull();
  expect(x.a.GetUpper()).toBe(x.top);
  expect(x.group.GetUpper()).toBe(x.top);
  expect(x.one.GetUpper()).toBe(x.group);
  expect(x.b.GetUpper()).toBe(x.one);
  expect(x.c.GetUpper()).toBe(x.two);
  expect(x.b.GetSttNd()).toBe(x.b.GetStartNode());
  expect(x.table.GetTableBox(x.b.GetStartNode().GetIndex())).toBe(x.b);
  expect(x.b.GetParagraphs()[0]?.GetTableBox()).toBe(x.b);
  x.close();
});
it("descends the previous anonymous sibling to its last real content box", /** Source LastBox path uses the actual last nested line and box. @returns Nothing. */ () => {
  const x = fixture();
  expect(x.d.FindPreviousBox(x.table, x.d)).toBe(x.c);
  expect(x.top.FindPreviousBox(x.table, x.d, false)).toBe(x.c);
  expect(x.group.FindPreviousBox(x.table, null)).toBe(x.a);
  expect(x.c.FindPreviousBox(x.table, null)).toBe(x.c);
  x.close();
});
it("ascends from the first nested row while row-only mode suppresses only base-line crossing", /** Native false flag does not disable parent-box traversal. @returns Nothing. */ () => {
  const x = fixture();
  expect(x.one.FindPreviousBox(x.table, x.b, false)).toBe(x.a);
  expect(x.two.FindPreviousBox(x.table, x.c, false)).toBe(x.b);
  expect(x.bottom.FindPreviousBox(x.table, x.e, false)).toBeNull();
  expect(x.bottom.FindPreviousBox(x.table, x.e)).toBe(x.d);
  x.close();
});
it("skips empty preceding nested rows using the original recursive line path", /** Does not invent a fallback last leaf for a nonempty anonymous box with an empty terminal row. @returns Nothing. */ () => {
  const x = fixture(),
    empty = new SwTableLine(x.doc.MakeTableLineFormat(), 0, x.group);
  x.group.AddLine(empty, 1);
  expect(x.two.FindPreviousBox(x.table, x.c, false)).toBe(x.b);
  x.close();
});
it("erases an owned vector entry without changing its source upper pointer", /** Original vector erase and SetUpper are separate operations. @returns Nothing. */ () => {
  const x = fixture();
  x.group.RemoveLine(x.two);
  expect(x.two.GetUpper()).toBe(x.group);
  expect(x.group.GetTabLines()).toEqual([x.one]);
  x.group.AddLine(x.two);
  x.top.RemoveBox(x.group);
  expect(x.group.GetUpper()).toBe(x.top);
  x.top.AddBox(x.group, 1);
  x.close();
});
it("destroys every actual nested row and box once when the document removes its table", /** Call-through spies observe the original model owners; no destructor return is replaced. @returns Nothing. */ () => {
  const x = fixture(),
    owners = [x.top, x.bottom, x.group, x.one, x.two, x.a, x.b, x.c, x.d, x.e, x.f],
    calls = owners.map(
      /** Observes actual destructor calls. @param owner - Real model owner. @returns Call-through spy. */ (
        owner,
      ) => vi.spyOn(owner, "Dispose"),
    );
  x.close();
  for (const call of calls) expect(call).toHaveBeenCalledOnce();
});
it("releases independently owned nested model graphs with their owning box", /** Native SwTableLines and SwTableLine own children even outside node deletion. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    box = new SwTableBox(doc.MakeTableBoxFormat(), 1),
    row = new SwTableLine(doc.MakeTableLineFormat(), 1, box),
    inner = new SwTableBox(doc.MakeTableBoxFormat(), 0, row),
    released = vi.spyOn(inner, "Dispose");
  box.AddLine(row);
  row.AddBox(inner);
  box.Dispose();
  expect(released).toHaveBeenCalledOnce();
  doc.Dispose();
});
