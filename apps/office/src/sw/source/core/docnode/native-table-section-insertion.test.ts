/** @fileoverview Native text-section table insertion, null footnote result, real box predecessors, nested break retention and all-section used-format naming. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwPosition } from "../crsr/pam";
import { SwTextNode } from "../txtnode/ndtxt";
import { SwTableLine } from "../table/swtable";
import { SwStartNodeType as K } from "../../../inc/ndtyp";
import { HoriOrientation as O } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwFormatPageDesc } from "../attr/fmtpdsc";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { SvxBreak as B } from "../../../../editeng/inc/svxenum";
import { RES_PAGEDESC, RES_BREAK } from "../../../inc/hintids";
const options = { mnInsMode: 0, mnRowsToRepeat: 0 };
/** Requires an actual native owner rather than constructing a fallback. @param value - Actual optional owner. @returns Original owner. */
function present<T>(value: T | null | undefined): T {
  assert(value !== null && value !== undefined);
  return value;
}
/** Inserts through the actual document with an owned temporary position. @param doc - Actual document. @param node - Actual text boundary. @param rows - Row count. @param columns - Column count. @param name - Optional requested name. @returns Actual admitted table. */
function insert(doc: SwDoc, node: SwTextNode, rows = 1, columns = 1, name = "") {
  const p = new SwPosition(node);
  try {
    return present(
      doc.InsertTable(options, p, rows, columns, O.LEFT, null, null, false, true, name),
    );
  } finally {
    p.Dispose();
  }
}
it.each([K.SwFootnoteStartNode, K.SwNormalStartNode])(
  "returns null before mutation for text in the actual inserts interval kind%s",
  /** Source admission is the original node interval rather than a tag or body-only test. @param kind - Native section type inside EndOfInserts. @returns Nothing. */ (
    kind,
  ) => {
    const doc = new SwDoc(),
      start = doc.nodes.MakeTextSection(
        doc.nodes.GetEndOfInserts(),
        kind,
        doc.GetDfltTextFormatColl(),
      ),
      node = doc.nodes.at(start.GetIndex() + 1);
    assert(node instanceof SwTextNode);
    node.SetAttr(new SwFormatPageDesc("Standard", 3));
    const p = new SwPosition(node),
      before = doc.nodes.Count(),
      undo = doc.GetUndoManager().GetUndoActionCount();
    expect(doc.InsertTable(options, p, 1, 1, O.LEFT)).toBeNull();
    expect(doc.nodes.Count()).toBe(before);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(undo);
    expect((node.GetAttr(RES_PAGEDESC) as SwFormatPageDesc).GetNumOffset()).toBe(3);
    p.Dispose();
    doc.Dispose();
  },
);
it("admits caption/extra text and moves its direct page attributes through the actual document constructor", /** Non-body text is a native insertion boundary outside the source inserts interval. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    start = doc.nodes.MakeTextSection(
      doc.nodes.GetEndOfExtras(),
      K.SwNormalStartNode,
      doc.GetDfltTextFormatColl(),
    ),
    node = doc.nodes.at(start.GetIndex() + 1);
  assert(node instanceof SwTextNode);
  node.SetAttr(new SwFormatPageDesc("Standard", 7));
  node.SetAttr(new SfxInt16Item(RES_BREAK, B.PageBefore));
  const table = insert(doc, node);
  expect(table.GetTableNode().StartOfSectionNode()).toBe(start);
  expect(table.GetTableNode().GetTableBox()).toBeNull();
  expect(
    (table.GetFrameFormat().GetAttrSet().Get(RES_PAGEDESC) as SwFormatPageDesc).GetNumOffset(),
  ).toBe(7);
  expect(node.GetpSwAttrSet()?.GetItemIfSet(RES_PAGEDESC, false)).toBeUndefined();
  expect(node.GetpSwAttrSet()?.GetItemIfSet(RES_BREAK, false)).toBeUndefined();
  doc.Dispose();
});
it.each([0, 1, 2, 3])(
  "copies parent breaks only at the original first-cell/first-paragraph boundary cell%s",
  /** Parent attributes are copied without reset; paragraph attributes stay in a nested insertion. @param index - Actual row-major parent cell. @returns Nothing. */ (
    index,
  ) => {
    const doc = new SwDoc(),
      body = present(doc.paragraphs[0]),
      parent = insert(doc, body, 2, 2),
      box = present(present(parent.GetTabLines()[Math.floor(index / 2)]).GetTabBoxes()[index % 2]),
      node = present(box.GetParagraphs()[0]);
    parent.GetFrameFormat().SetFormatAttr(new SwFormatPageDesc("Standard", 9));
    parent.GetFrameFormat().SetFormatAttr(new SfxInt16Item(RES_BREAK, B.PageBefore));
    node.SetAttr(new SwFormatPageDesc("Standard", 3));
    node.SetAttr(new SfxInt16Item(RES_BREAK, B.ColumnAfter));
    const child = insert(doc, node),
      attrs = child.GetFrameFormat().GetAttrSet(),
      page = attrs.GetItemIfSet(RES_PAGEDESC, false),
      brk = attrs.GetItemIfSet(RES_BREAK, false);
    expect(child.GetTableNode().GetTableBox()).toBe(box);
    expect(node.GetTableBox()).toBe(box);
    expect(body.GetTableBox()).toBeNull();
    if (index === 0) {
      expect((page as SwFormatPageDesc).GetNumOffset()).toBe(9);
      expect((brk as SfxInt16Item).GetValue()).toBe(B.PageBefore);
    } else {
      expect(page).toBeUndefined();
      expect(brk).toBeUndefined();
    }
    expect(
      (parent.GetFrameFormat().GetAttrSet().Get(RES_PAGEDESC) as SwFormatPageDesc).GetNumOffset(),
    ).toBe(9);
    expect((parent.GetFrameFormat().GetAttrSet().Get(RES_BREAK) as SfxInt16Item).GetValue()).toBe(
      B.PageBefore,
    );
    expect((node.GetAttr(RES_PAGEDESC) as SwFormatPageDesc).GetNumOffset()).toBe(3);
    expect((node.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(B.ColumnAfter);
    doc.Dispose();
  },
);
it("does not copy parent breaks before a later paragraph in its first cell", /** Original first-paragraph guard precedes parent first-cell traversal. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    parent = insert(doc, present(doc.paragraphs[0])),
    box = present(present(parent.GetTabLines()[0]).GetTabBoxes()[0]),
    later = doc.nodes.AppendTableCellParagraph(box);
  parent.GetFrameFormat().SetFormatAttr(new SwFormatPageDesc("Standard", 8));
  const child = insert(doc, later);
  expect(child.GetFrameFormat().GetAttrSet().GetItemIfSet(RES_PAGEDESC, false)).toBeUndefined();
  doc.Dispose();
});
it("keeps actual predecessor identities across columns and empty base rows", /** Native null-search returns the leaf itself; over-table-lines=false remains local to the row. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = insert(doc, present(doc.paragraphs[0]), 2, 2),
    first = present(table.GetTabLines()[0]),
    last = present(table.GetTabLines()[1]),
    a = present(first.GetTabBoxes()[0]),
    b = present(first.GetTabBoxes()[1]),
    c = present(last.GetTabBoxes()[0]),
    empty = new SwTableLine(doc.MakeTableLineFormat());
  table.AddLine(empty, 1);
  expect(a.FindPreviousBox(table, null)).toBe(a);
  expect(a.FindPreviousBox(table, a)).toBeNull();
  expect(b.FindPreviousBox(table, b)).toBe(a);
  expect(c.FindPreviousBox(table, c)).toBe(b);
  expect(last.FindPreviousBox(table, c, false)).toBeNull();
  expect(empty.FindPreviousBox(table)).toBe(b);
  doc.Dispose();
});
it("resolves native used table names across nested and extra sections without changing body-only UI queries", /** New tables must not collide just because their owners are outside direct body content. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    body = present(doc.paragraphs[0]),
    parent = insert(doc, body),
    node = present(present(present(parent.GetTabLines()[0]).GetTabBoxes()[0]).GetParagraphs()[0]),
    one = insert(doc, node),
    two = insert(doc, node),
    section = doc.nodes.MakeTextSection(
      doc.nodes.GetEndOfExtras(),
      K.SwNormalStartNode,
      doc.GetDfltTextFormatColl(),
    ),
    extraNode = doc.nodes.at(section.GetIndex() + 1);
  assert(extraNode instanceof SwTextNode);
  const extra = insert(doc, extraNode);
  expect([parent.GetName(), one.GetName(), two.GetName(), extra.GetName()]).toEqual([
    "Table1",
    "Table2",
    "Table3",
    "Table4",
  ]);
  expect(doc.FindTableFormatByName("Table3")).toBe(two.GetFrameFormat());
  expect(doc.FindTableFormatByName("Table4")).toBe(extra.GetFrameFormat());
  expect(doc.GetTables()).toEqual([parent]);
  doc.Dispose();
});
it.each(["01", "+1", "1tail"])(
  "retains source integer suffix conversion for Table%s",
  /** Source default naming uses toInt32 instead of strict canonical-name matching (WRITER341). @param suffix - Original suffix. @returns Nothing. */ (
    suffix,
  ) => {
    const doc = new SwDoc(),
      body = present(doc.paragraphs[0]);
    insert(doc, body, 1, 1, "Table" + suffix);
    expect(doc.GetUniqueTableName()).toBe("Table2");
    doc.Dispose();
  },
);
it("uses the original bitmap transition past eight occupied names", /** Real used frame names set the original byte flags. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    body = present(doc.paragraphs[0]);
  for (let i = 1; i <= 8; i++) insert(doc, body, 1, 1, "Table" + i);
  expect(doc.GetUniqueTableName()).toBe("Table9");
  doc.Dispose();
});
