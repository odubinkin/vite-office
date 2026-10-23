/** @fileoverview Native float font-height request conversion, all-script items, real selection/history and ODT consumers. */
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwPosition } from "../../core/crsr/pam";
import { SwAttrIter } from "../../core/text/itratr";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import {
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CTL_FONTSIZE,
} from "../../../inc/hintids";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";
import { createFontHeightItems } from "../../core/txtnode/ndhints-font";
import { SfxItemSet } from "../../../../svl/inc/itemset";
import { MakeTextAttr } from "../../core/txtnode/thints";
import { SwFormatINetFormat } from "../../core/txtnode/fmtatr2";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Closes actual native graphs. @returns Nothing. */ () => {
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Creates a genuine frame, shell and text owner. @returns Native fixture. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const shell = session.view.GetWrtShell(),
    node = shell.GetDoc().paragraphs[0] as SwTextNode;
  node.SetText("abcdef");
  return { session, shell, node, doc: shell.GetDoc() };
}
/** Assigns the actual native text range. @param f - Native fixture. @param start - Start index. @param end - End index. @returns Nothing. */
function select(f: ReturnType<typeof fixture>, start: number, end: number) {
  const point = new SwPosition(f.node, end),
    mark = new SwPosition(f.node, start);
  f.shell.SetPaM(point, mark);
  point.Dispose();
  mark.Dispose();
}
/** Reads all three real character height items through the native text iterator. @param node - Original text owner. @param position - Text offset. @returns Integral heights. */
function heights(node: SwTextNode, position: number): number[] {
  const iterator = new SwAttrIter(node);
  iterator.Seek(position);
  return [RES_CHRATR_FONTSIZE, RES_CHRATR_CJK_FONTSIZE, RES_CHRATR_CTL_FONTSIZE].map(
    /** Borrows a native pooled height. @param which - Script-specific Which. @returns Twips. */ (
      which,
    ) => (iterator.GetAttrHandler().ReadItem(which) as SvxFontHeightItem).GetHeight(),
  );
}
it("converts original float toolbox values through PutValue rounding without rejecting their binary representation", /** Selected and caret height requests share native item conversion and history. @returns Completion. */ async () => {
  const f = fixture(),
    baseline = heights(f.node, 0),
    count = f.doc.GetUndoManager().GetUndoActionCount();
  select(f, 0, 3);
  expect(
    f.session.view.Execute(".uno:FontHeight", { fontSizePt: Math.fround(13.3) }),
  ).toMatchObject({ value: true });
  expect(heights(f.node, 0)).toEqual([266, 266, 266]);
  expect(heights(f.node, 4)).toEqual(baseline);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(count + 1);
  f.shell.Undo();
  expect(heights(f.node, 0)).toEqual(baseline);
  f.shell.Redo();
  expect(heights(f.node, 0)).toEqual([266, 266, 266]);
  select(f, 6, 6);
  expect(
    f.session.view.Execute(".uno:FontHeight", { fontSizePt: Math.fround(13.7) }),
  ).toMatchObject({ value: false });
  f.shell.Insert("x");
  expect(heights(f.node, 6)).toEqual([274, 274, 274]);
  const opened = await readOdtDocument(writeOdtDocument(f.doc, { title: "Fractional font" }), {
    title: "Fractional font",
  });
  try {
    const node = opened.document.paragraphs[0] as SwTextNode;
    expect(node.GetText()).toBe("abcdefx");
    expect(heights(node, 0)).toEqual([266, 266, 266]);
    expect(heights(node, 6)).toEqual([274, 274, 274]);
  } finally {
    opened.document.Dispose();
  }
});
it("preserves native zero admission and upper/invalid request guards independently from widget bounds", /** Native UNO height allows zero; FontSizeBox empty acceptance reaches it while regular nonempty input clamps to2pt. @returns Nothing. */ () => {
  const f = fixture();
  select(f, 0, 3);
  f.session.view.Execute(".uno:FontHeight", { fontSizePt: 0 });
  expect(heights(f.node, 0)).toEqual([0, 0, 0]);
  f.session.view.Execute(".uno:FontHeight", { fontSizePt: Math.fround(999.9) });
  expect(heights(f.node, 0)).toEqual([19998, 19998, 19998]);
  const count = f.doc.GetUndoManager().GetUndoActionCount();
  for (const invalid of [-1, 10001, Number.NaN, Number.POSITIVE_INFINITY])
    expect(
      /** Calls only the actual public typed numeric request boundary. @returns Original mutation result or error. */ () =>
        f.shell.GetTextShell().SetFontSize(invalid),
    ).toThrow("native font-height range");
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(count);
  expect(heights(f.node, 0)).toEqual([19998, 19998, 19998]);
});

it("steps uniform selected text by2pt with one history entry and original live cursor ownership", /** Source Writer uses40twips, not the next standard list entry. @returns Nothing. */ () => {
  const f = fixture();
  select(f, 0, 3);
  f.session.view.Execute(".uno:FontHeight", { fontSizePt: 13.3 });
  const count = f.doc.GetUndoManager().GetUndoActionCount(),
    point = f.shell.GetCursor().GetPoint();
  expect(
    f.session.view.GetViewFrame().GetDispatcher().FindCommandByShortcut("Ctrl+BRACKETRIGHT")
      ?.command.id,
  ).toBe(".uno:Grow");
  expect(f.session.view.QueryState(".uno:Grow").enabled).toBe(true);
  expect(f.session.view.Execute(".uno:Grow")).toMatchObject({ value: true });
  expect(heights(f.node, 0)).toEqual([306, 306, 306]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(count + 1);
  expect(f.shell.GetCursor().GetPoint()).toBe(point);
  f.shell.Undo();
  expect(heights(f.node, 0)).toEqual([266, 266, 266]);
  f.shell.Redo();
  expect(heights(f.node, 0)).toEqual([306, 306, 306]);
  f.session.view.Execute(".uno:Shrink");
  expect(heights(f.node, 0)).toEqual([266, 266, 266]);
});

it("retains distinct original automatic height contributions and groups mixed selection history", /** GetItemWithPaM ranges remain independent; no one-size replacement is applied to the whole selection. @returns Nothing. */ () => {
  const f = fixture();
  select(f, 0, 3);
  f.session.view.Execute(".uno:FontHeight", { fontSizePt: 10 });
  select(f, 3, 6);
  f.session.view.Execute(".uno:FontHeight", { fontSizePt: 18 });
  select(f, 0, 6);
  const before = f.doc.GetUndoManager().GetUndoActionCount();
  f.session.view.Execute(".uno:Grow");
  expect([heights(f.node, 0), heights(f.node, 4)]).toEqual([
    [240, 240, 240],
    [400, 400, 400],
  ]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(before + 1);
  f.shell.Undo();
  expect([heights(f.node, 0), heights(f.node, 4)]).toEqual([
    [200, 200, 200],
    [360, 360, 360],
  ]);
  f.shell.Redo();
  expect([heights(f.node, 0), heights(f.node, 4)]).toEqual([
    [240, 240, 240],
    [400, 400, 400],
  ]);
});

it("keeps exact native disabled bounds and unsigned32 decrement before comparison", /** Out-of-widget-range source values preserve initialized unsigned arithmetic rather than saturating before subtraction. @returns Nothing. */ () => {
  const f = fixture();
  select(f, 0, 3);
  f.session.view.Execute(".uno:FontHeight", { fontSizePt: 999.9 });
  expect(f.session.view.QueryState(".uno:Grow").enabled).toBe(false);
  f.session.view.Execute(".uno:FontHeight", { fontSizePt: 2 });
  expect(f.session.view.QueryState(".uno:Shrink").enabled).toBe(false);
  const set = new SfxItemSet(f.doc.GetAttrPool(), [[1, 48]]);
  for (const item of createFontHeightItems(0)) set.Put(item);
  f.shell.SetAttrSet(set);
  expect(f.session.view.QueryState(".uno:Shrink").enabled).toBe(true);
  f.session.view.Execute(".uno:Shrink");
  expect(heights(f.node, 0)).toEqual([4294967256, 4294967256, 4294967256]);
});

it("changes every selected native table cell with one history group", /** Source table mode uses actual per-node contributions even when the aggregate height is uniform. @returns Nothing. */ () => {
  const f = fixture(),
    table = f.doc.nodes.MakeTableNode("Font table");
  table.AddColumnWidth(2000);
  table.AddColumnWidth(2000);
  const row = f.doc.nodes.AppendTableRow(table, 2),
    cells = row
      .GetTabBoxes()
      .map(
        /** Borrows each actual original cell paragraph. @param box - Native cell. @returns Text owner. */ (
          box,
        ) => box.GetParagraphs()[0] as SwTextNode,
      );
  for (const cell of cells) for (const item of createFontHeightItems(240)) cell.SetAttr(item);
  const p = new SwPosition(cells[0] as SwTextNode, 0);
  f.shell.SetCursor(p);
  p.Dispose();
  expect(f.shell.SelectTableRow()).toBe(true);
  expect(f.shell.IsTableMode()).toBe(true);
  const count = f.doc.GetUndoManager().GetUndoActionCount();
  f.session.view.Execute(".uno:Grow");
  expect(
    cells.map(
      /** Reads actual per-cell attributes. @param cell - Original text owner. @returns All script heights. */ (
        cell,
      ) => heights(cell, 0),
    ),
  ).toEqual([
    [280, 280, 280],
    [280, 280, 280],
  ]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(count + 1);
  f.shell.Undo();
  expect(
    cells.map(
      /** Reads restored native cell state. @param cell - Original owner. @returns Height values. */ (
        cell,
      ) => heights(cell, 0),
    ),
  ).toEqual([
    [240, 240, 240],
    [240, 240, 240],
  ]);
  expect(f.shell.IsTableMode()).toBe(true);
});

it("preserves null mixed contributions, exact mixed limit states and source execution skipping", /** Source null admission is not replaced by inferred pool defaults. @returns Nothing. */ () => {
  const f = fixture(),
    empty = new SfxItemSet(f.doc.GetAttrPool(), [[1, 48]]),
    set = new SfxItemSet(f.doc.GetAttrPool(), [[1, 48]]);
  for (const item of createFontHeightItems(400)) set.Put(item);
  f.node.GetOrCreateSwpHints().Insert(MakeTextAttr(f.doc, empty, 0, 2));
  f.node.GetOrCreateSwpHints().Insert(MakeTextAttr(f.doc, set, 2, 4));
  f.node
    .GetOrCreateSwpHints()
    .Insert(MakeTextAttr(f.doc, new SwFormatINetFormat("https://example.test/size"), 4, 6));
  select(f, 0, 6);
  expect(f.session.view.QueryState(".uno:Grow").enabled).toBe(false);
  expect(f.session.view.QueryState(".uno:Shrink").enabled).toBe(false);
  f.shell.GetTextShell().ChangeFontSize(true);
  expect(heights(f.node, 2)).toEqual([440, 440, 440]);
  expect(heights(f.node, 0)).toEqual([240, 240, 240]);
  select(f, 0, 3);
  f.session.view.Execute(".uno:FontHeight", { fontSizePt: 999.9 });
  select(f, 3, 6);
  f.session.view.Execute(".uno:FontHeight", { fontSizePt: 2 });
  select(f, 0, 6);
  expect(f.session.view.QueryState(".uno:Grow").enabled).toBe(false);
  expect(f.session.view.QueryState(".uno:Shrink").enabled).toBe(false);
});

it("retains source upper clamping, lower clamping and unsigned addition before the upper comparison", /** Arithmetic runs on complete original height items. @returns Nothing. */ () => {
  const f = fixture();
  select(f, 0, 3);
  for (const [before, grow, expected] of [
    [19997, true, 19998],
    [41, false, 40],
    [0xffffffff, true, 39],
  ] as const) {
    const set = new SfxItemSet(f.doc.GetAttrPool(), [[1, 48]]);
    for (const item of createFontHeightItems(before)) set.Put(item);
    f.shell.SetAttrSet(set);
    f.shell.GetTextShell().ChangeFontSize(grow);
    expect(heights(f.node, 0)).toEqual([expected, expected, expected]);
  }
});

it("does not add content history for a native structural position with no text range", /** Original attribute/script traversal skips nontext nodes; current cursor ownership stays intact. @returns Nothing. */ () => {
  const f = fixture(),
    current = f.shell.GetCursor(),
    original = current.GetPoint().clone(),
    node = f.doc.GetNodes().at(0);
  if (!node) throw new Error("Missing original structural node");
  const position = new SwPosition(node, 0);
  current.Assign(position);
  position.Dispose();
  try {
    const count = f.doc.GetUndoManager().GetUndoActionCount(),
      point = current.GetPoint();
    expect(f.shell.GetTextShell().ChangeFontSize(true)).toBe(false);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(count);
    expect(current.GetPoint()).toBe(point);
  } finally {
    current.Assign(original);
    original.Dispose();
  }
});
