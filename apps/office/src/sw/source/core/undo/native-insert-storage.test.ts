/** @fileoverview Verifies native numeric insertion range and removed-only Undo storage ownership without pinned upstream access. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwUndoInsDoc } from "./untblk";
import {
  SwUndRng,
  SwUndoSaveContent,
  createWriterCollapsedCursorState,
  type SwUndoRedoContext,
} from "./undobj";
import { SwTextNode } from "../txtnode/ndtxt";
import { SwFormatAutoFormat, createWriterCharacterItemSet } from "../txtnode/txatbase";
import { SetAttrMode } from "../../../inc/swtypes";
import { prepareWriterAsciiParagraphs, readWriterAsciiParagraphs } from "../../filter/ascii/parasc";

/** Requires an actual native owner. @param value - Optional owner. @returns Defined owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native undo owner");
  return value;
}
/** Creates an actual PaM and releases constructor input positions. @param first - Start. @param start - First offset. @param last - End. @param end - Last offset. @returns Owned PaM. */
function span(
  first: SwTextNode,
  start: number,
  last: SwTextNode = first,
  end: number = first.Len(),
): SwPaM {
  const a = new SwPosition(first, start),
    b = new SwPosition(last, end),
    pam = new SwPaM(b, a);
  a.Dispose();
  b.Dispose();
  return pam;
}
/** Creates native collapsed history state with default supported items. @param node - Actual node. @param offset - Actual offset. @returns Native cursor state. */
function state(node: SwTextNode, offset: number = node.Len()) {
  return createWriterCollapsedCursorState(
    node,
    offset,
    createWriterCharacterItemSet(node.GetDoc().GetAttrPool(), {
      bold: false,
      italic: false,
      underline: false,
    }),
  );
}
/** Reads into one actual text node and records the range without a content snapshot. @param node - Native target. @param text - Unicode text. @returns Native insertion history. */
function read(node: SwTextNode, text: string) {
  const point = new SwPosition(node, node.Len()),
    history = new SwUndoInsDoc(point, state(node));
  try {
    readWriterAsciiParagraphs(point, prepareWriterAsciiParagraphs(text));
    history.SetInsertRange(point, state(point.GetNode() as SwTextNode, point.GetContentIndex()));
  } finally {
    point.Dispose();
  }
  node.GetDoc().GetUndoManager().AddUndoAction(history);
  return history;
}
/** Makes real cell sections, formatted/numbered target and untouched neighbor. @param text - Imported text. @returns Native owners and context. */
function fixture(text: string) {
  const doc = new SwDoc(),
    body = required(doc.paragraphs[0]),
    table = doc.nodes.MakeTableNode("Storage", {}, body);
  table.AddColumnWidth(2000);
  table.AddColumnWidth(2000);
  const row = doc.nodes.AppendTableRow(table, 2),
    box = required(row.GetTabBoxes()[0]),
    first = required(box.GetParagraphs()[0]),
    neighbor = required(required(row.GetTabBoxes()[1]).GetParagraphs()[0]);
  first.SetText("Base");
  first.ToggleTextRangeFormat(0, 4, "bold");
  doc.EnsureNumRule("Native", "numbered");
  first.SetNumRule("Native");
  first.SetListId("storage-list");
  first.SetAttrListLevel(1);
  neighbor.SetText("Keep");
  const items = required(first.GetpSwAttrSet()).Clone(),
    history = read(first, text),
    inserted = [...box.GetParagraphs()];
  const context: SwUndoRedoContext = {
    GetDoc: /** Performs a native undo ownership check. @returns Native operation result. */ () =>
      doc,
    RestoreCursor:
      /** Performs a native undo ownership check. @returns Native operation result. */ () => {},
  };
  return {
    doc,
    first,
    neighbor,
    box,
    items,
    history,
    inserted,
    context,
    manager: doc.GetUndoManager(),
    storage: doc.GetUndoManager().GetUndoNodes(),
  };
}

it("native SwUndRng stores default and sorted marked or unmarked numeric coordinates", /** Performs a native undo ownership check. @returns Native operation result. */ () => {
  const doc = new SwDoc(),
    first = required(doc.paragraphs[0]);
  first.SetText("AB");
  const empty = new SwUndRng();
  expect([empty.m_nSttNode, empty.m_nEndNode, empty.m_nSttContent, empty.m_nEndContent]).toEqual([
    0, 0, 0, 0,
  ]);
  const point = new SwPosition(first, 1),
    pam = new SwPaM(point);
  point.Dispose();
  const saved = new SwUndRng(pam);
  expect(saved.m_nEndNode).toBe(0);
  expect(saved.m_nEndContent).toBe(0x7fffffff);
  pam.SetMark();
  pam.GetPoint().Assign(first, 2);
  saved.SetPaM(pam);
  expect(pam.HasMark()).toBe(false);
  expect(pam.GetPoint().GetContentIndex()).toBe(1);
  pam.SetMark();
  saved.SetValues(pam);
  saved.SetPaM(pam);
  expect(pam.HasMark()).toBe(true);
  expect(pam.GetPoint().GetContentIndex()).toBe(1);
  pam.GetPoint().Assign(first, 2);
  saved.SetValues(pam);
  pam.Exchange();
  saved.SetValues(pam);
  saved.SetPaM(pam);
  expect([saved.m_nSttContent, saved.m_nEndContent]).toEqual([1, 2]);
  expect(pam.GetMark().GetContentIndex()).toBe(1);
  expect(pam.GetPoint().GetContentIndex()).toBe(2);
  pam.Dispose();
});
it("native SwUndRng resolves current absolute indices instead of original node references", /** Performs a native undo ownership check. @returns Native operation result. */ () => {
  const doc = new SwDoc(),
    first = required(doc.paragraphs[0]),
    second = doc.nodes.MakeTextNode("Other");
  first.SetText("AB");
  const point = new SwPosition(first, 1),
    pam = new SwPaM(point);
  point.Dispose();
  const saved = new SwUndRng(pam),
    replacement = first.CloneTo(doc.nodes),
    index = first.GetIndex();
  doc.nodes.removeTextNode(first);
  doc.nodes.insertTextNodeAfter(required(second.StartOfSectionNode()), replacement);
  expect(replacement.GetIndex()).toBe(index);
  saved.SetPaM(pam);
  expect(pam.GetPoint().GetNode()).toBe(replacement);
  expect(pam.GetPoint().GetContentIndex()).toBe(1);
  pam.Dispose();
});
it("native undo content moves actual interior hint ownership without a second snapshot", /** Performs a native undo ownership check. @returns Native operation result. */ () => {
  const doc = new SwDoc(),
    first = required(doc.paragraphs[0]);
  first.SetText("ABCDE");
  const original = first.InsertItem(
      new SwFormatAutoFormat(
        createWriterCharacterItemSet(doc.GetAttrPool(), {
          bold: true,
          italic: false,
          underline: false,
        }),
      ),
      1,
      2,
      SetAttrMode.NOHINTADJUST,
    ),
    pam = span(first, 0),
    content = new SwUndoSaveContent(),
    storage = doc.GetUndoManager().GetUndoNodes();
  expect(content.GetPayloadSize(doc)).toBe(0);
  content.MoveToUndoNds(pam);
  expect(first.GetText()).toBe("");
  expect(storage.Count()).toBe(1);
  expect(required(storage.GetNode(1).GetpSwpHints()).Get(0)).toBe(original);
  expect(content.GetPayloadSize(doc)).toBe(9);
  const point = new SwPosition(first, 0);
  content.MoveFromUndoNds(point);
  point.Dispose();
  expect(first.GetText()).toBe("ABCDE");
  expect(required(first.GetpSwpHints()).Get(0)).toBe(original);
  expect(storage.Count()).toBe(0);
  expect(content.GetPayloadSize(doc)).toBe(0);
  content.Dispose(doc);
  pam.Dispose();
});
for (const text of ["X", "A\n\nB\n", "\n\n"])
  it(
    "native imported content occupies storage only while undone " + JSON.stringify(text),
    /** Performs a native undo ownership check. @returns Native operation result. */ () => {
      const f = fixture(text),
        initialPayload = f.history.GetPayloadSize(),
        retained = (prepareWriterAsciiParagraphs(text)[0] === "" ? 0 : 1) + f.inserted.length - 1;
      expect(f.storage.Count()).toBe(0);
      expect(initialPayload).toBeGreaterThan(0);
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(f.manager.Undo(f.context)).toBe(true);
        expect(f.storage.Count()).toBe(retained);
        expect(f.first.GetText()).toBe("Base");
        expect(f.box.GetParagraphs()).toEqual([f.first]);
        expect(f.first.GetSwAttrSet().Equals(f.items, true)).toBe(true);
        expect(f.first.GetTextRangeFormatState(0, 4, "bold")).toBe("on");
        expect(f.history.GetPayloadSize()).toBeGreaterThanOrEqual(initialPayload);
        expect(f.manager.Redo(f.context)).toBe(true);
        expect(f.storage.Count()).toBe(0);
        expect(f.box.GetParagraphs()).toEqual(f.inserted);
        expect(f.history.GetPayloadSize()).toBe(initialPayload);
        expect(f.neighbor.GetText()).toBe("Keep");
      }
      const live = [...f.box.GetParagraphs()];
      f.manager.Clear();
      expect(f.storage.Count()).toBe(0);
      expect(f.box.GetParagraphs()).toEqual(live);
    },
  );
it("native inserted content disposal drops only disconnected redo payload", /** Performs a native undo ownership check. @returns Native operation result. */ () => {
  const f = fixture("A\nB");
  f.manager.Undo(f.context);
  expect(f.storage.Count()).toBe(2);
  f.manager.Clear();
  expect(f.storage.Count()).toBe(0);
  expect(f.box.GetParagraphs()).toEqual([f.first]);
  expect(f.first.GetText()).toBe("Base");
  f.history.Dispose();
  expect(f.storage.Count()).toBe(0);
});
it("native new insertion discards old removed redo content without retaining live content", /** Performs a native undo ownership check. @returns Native operation result. */ () => {
  const f = fixture("A\nB");
  f.manager.Undo(f.context);
  expect(f.storage.Count()).toBe(2);
  read(f.first, "Z");
  expect(f.storage.Count()).toBe(0);
  expect(f.first.GetText()).toBe("BaseZ");
  expect(f.manager.GetRedoActionCount()).toBe(0);
  expect(f.manager.Undo(f.context)).toBe(true);
  expect(f.storage.Count()).toBe(1);
  expect(f.manager.Redo(f.context)).toBe(true);
  expect(f.storage.Count()).toBe(0);
  expect(f.first.GetText()).toBe("BaseZ");
  f.manager.Clear();
});
it("native ordered later insertion unwinds before recapturing the original numeric span", /** Performs a native undo ownership check. @returns Native operation result. */ () => {
  const f = fixture("A\nB"),
    last = required(f.inserted[1]);
  read(last, "Q");
  expect(last.GetText()).toBe("BQ");
  expect(f.storage.Count()).toBe(0);
  f.manager.Undo(f.context);
  expect(last.GetText()).toBe("B");
  expect(f.storage.Count()).toBe(1);
  f.manager.Undo(f.context);
  expect(f.first.GetText()).toBe("Base");
  expect(f.storage.Count()).toBe(3);
  f.manager.Redo(f.context);
  expect(f.box.GetParagraphs()).toEqual(f.inserted);
  expect(last.GetText()).toBe("B");
  expect(f.storage.Count()).toBe(1);
  f.manager.Redo(f.context);
  expect(last.GetText()).toBe("BQ");
  expect(f.storage.Count()).toBe(0);
  f.manager.Clear();
});
it("native SetInsertRange may record coordinates again without duplicate content retention", /** Performs a native undo ownership check. @returns Native operation result. */ () => {
  const f = fixture("A\nB"),
    last = required(f.inserted[1]),
    point = new SwPosition(last, last.Len()),
    payload = f.history.GetPayloadSize();
  f.history.SetInsertRange(point, state(last));
  f.history.SetInsertRange(point, state(last));
  point.Dispose();
  expect(f.storage.Count()).toBe(0);
  expect(f.history.GetPayloadSize()).toBe(payload);
  f.manager.Undo(f.context);
  expect(f.storage.Count()).toBe(2);
  f.manager.Redo(f.context);
  expect(f.storage.Count()).toBe(0);
  expect(f.box.GetParagraphs()).toEqual(f.inserted);
  f.manager.Clear();
});
it("native undo content retains blank paragraphs and direct items without an empty text snapshot", /** Performs a native undo ownership check. @returns Native operation result. */ () => {
  const doc = new SwDoc(),
    first = required(doc.paragraphs[0]),
    last = doc.nodes.MakeTextNode("");
  last.ToggleTextRangeFormat(0, 0, "italic");
  const pam = span(first, 0, last, 0),
    content = new SwUndoSaveContent(),
    storage = doc.GetUndoManager().GetUndoNodes(),
    payload = (last.GetpSwpHints()?.Count() ?? 0) * 4 + (last.GetpSwAttrSet()?.Count() ?? 0);
  content.MoveToUndoNds(pam);
  expect(storage.Count()).toBe(1);
  expect(content.GetPayloadSize(doc)).toBe(payload);
  expect(doc.paragraphs).toEqual([first]);
  content.Dispose(doc);
  expect(storage.Count()).toBe(0);
  expect(doc.paragraphs).toEqual([first]);
  pam.Dispose();
});
it("native undo content keeps unsupported nonend section and nontext moves explicit before mutation", /** Performs a native undo ownership check. @returns Native operation result. */ () => {
  const f = fixture("X"),
    content = new SwUndoSaveContent(),
    incomplete = span(f.first, 4, f.first, 4);
  expect(
    /** Performs a native undo ownership check. @returns Native operation result. */ () =>
      content.MoveToUndoNds(incomplete),
  ).toThrow("end-of-section");
  expect(f.first.GetText()).toBe("BaseX");
  expect(f.storage.Count()).toBe(0);
  incomplete.Dispose();
  const body = required(f.doc.paragraphs[0]),
    end = f.doc.nodes.MakeTextNode("End"),
    foreign = span(body, 0, f.first, f.first.Len()),
    structural = span(body, 0, end, end.Len());
  expect(
    /** Performs a native undo ownership check. @returns Native operation result. */ () =>
      content.MoveToUndoNds(foreign),
  ).toThrow("end-of-section");
  expect(
    /** Performs a native undo ownership check. @returns Native operation result. */ () =>
      content.MoveToUndoNds(structural),
  ).toThrow("nontext");
  expect(f.storage.Count()).toBe(0);
  foreign.Dispose();
  structural.Dispose();
  content.Dispose(f.doc);
  f.manager.Clear();
});
