/** @fileoverview Verifies native full-span hint movement and split/read history without pinned upstream access. */
import { expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwPaM, SwPosition } from "../crsr/pam";
import type { SwTextNode } from "./ndtxt";
import {
  SwFormatAutoFormat,
  SwTextAttrEnd,
  createWriterCharacterItemSet,
  projectWriterCharacterAttributes,
} from "./txatbase";
import { SwTextINetFormat } from "./txtatr2";
import { SwFormatINetFormat } from "./fmtatr2";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
import { SwUndoInsDoc } from "../undo/untblk";
import {
  SwUndoSaveContent,
  createWriterCollapsedCursorState,
  type SwUndoRedoContext,
} from "../undo/undobj";
import { FontWeight, SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { RES_CHRATR_WEIGHT } from "../../../inc/hintids";
import { readWriterAsciiParagraphs, prepareWriterAsciiParagraphs } from "../../filter/ascii/parasc";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { SwEditWin } from "../../uibase/docvw/edtwin";
import { createDocument } from "../../../../sfx2/source/doc/objsh";

/** Requires an actual owner. @param value - Optional value. @returns Native owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native split owner");
  return value;
}
/** Creates an actual native paragraph. @param text - Native text. @returns Native owners. */
function fixture(text = "ABCD") {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]);
  node.SetText(text);
  return { doc, node };
}
/** Inserts a real automatic style without a run projection. @param node - Native owner. @param start - Start. @param end - End. @param kind - Supported style. @returns Actual owned hint. */
function automatic(
  node: SwTextNode,
  start = 0,
  end = node.Len(),
  kind: "bold" | "italic" = "bold",
) {
  return node.InsertItem(
    new SwFormatAutoFormat(
      createWriterCharacterItemSet(node.GetDoc().GetAttrPool(), {
        bold: kind === "bold",
        italic: kind === "italic",
        underline: false,
      }),
    ),
    start,
    end,
    SetAttrMode.NOHINTADJUST,
  );
}
/** Reads one actual character state. @param node - Native owner. @param offset - Caret. @returns Supported projection for assertions. */
function format(node: SwTextNode, offset = 0) {
  return projectWriterCharacterAttributes(node.GetCharacterItemsAt(offset));
}

it("native moved boundary preserves sparse direct items ranged overrides and independent legacy snapshots", /** Checks mixed native moved and historical snapshot ownership without a copy-mode adapter. @returns Nothing. */ () => {
  const { doc, node } = fixture();
  node.SetAttr(new SvxWeightItem(FontWeight.BOLD, RES_CHRATR_WEIGHT));
  const overrideItems = createWriterCharacterItemSet(doc.GetAttrPool(), {
    bold: false,
    italic: true,
    underline: false,
  }).Clone();
  overrideItems.Put(new SvxWeightItem(FontWeight.NORMAL, RES_CHRATR_WEIGHT));
  const hint = node.InsertItem(
      new SwFormatAutoFormat(overrideItems),
      1,
      3,
      SetAttrMode.NOHINTADJUST,
    ),
    storage = doc.GetUndoManager().GetUndoNodes(),
    snapshot = node.CaptureTextFragment(0, 4),
    snapshotId = storage.RetainText(snapshot),
    originalSnapshotHint = snapshot.hints.Get(0);
  expect([
    format(node, 0).bold,
    format(node, 2).bold,
    format(node, 2).italic,
    format(node, 4).bold,
  ]).toEqual([true, false, true, true]);
  expect(storage.GetText(snapshotId).hints.Get(0)).not.toBe(originalSnapshotHint);
  originalSnapshotHint.dontMoveAttr = true;
  expect(storage.GetText(snapshotId).hints.Get(0).IsDontMoveAttr()).toBe(false);
  const start = new SwPosition(node, 1),
    end = new SwPosition(node, 4),
    range = new SwPaM(end, start),
    content = new SwUndoSaveContent();
  start.Dispose();
  end.Dispose();
  try {
    content.MoveToUndoNds(range);
    const boundary = storage.GetNode(snapshotId + 1);
    expect(boundary.GetText()).toBe("BCD");
    expect(boundary.GetpSwAttrSet()?.Count()).toBe(1);
    expect((boundary.GetAttr(RES_CHRATR_WEIGHT) as SvxWeightItem).GetWeight()).toBe(
      FontWeight.BOLD,
    );
    expect(required(boundary.GetpSwpHints()).Get(0)).toBe(hint);
    expect(node.GetText()).toBe("A");
    const insertion = new SwPosition(node, 1);
    try {
      content.MoveFromUndoNds(insertion);
    } finally {
      insertion.Dispose();
    }
    expect(node.GetText()).toBe("ABCD");
    expect([
      format(node, 0).bold,
      format(node, 2).bold,
      format(node, 2).italic,
      format(node, 4).bold,
    ]).toEqual([true, false, true, true]);
    expect(storage.Count()).toBe(1);
    expect(storage.GetText(snapshotId).text).toBe("ABCD");
    expect(storage.GetText(snapshotId).hints.Get(0).IsDontMoveAttr()).toBe(false);
  } finally {
    range.Dispose();
    content.Dispose(doc);
    storage.Release(snapshotId);
  }
  expect(storage.Count()).toBe(0);
});

it("native full-span movement consumes changed AUTO hints into direct items", /** Checks actual item/map ownership. @returns Nothing. */ () => {
  const { node } = fixture(),
    hint = automatic(node),
    map = required(node.GetpSwpHints()),
    handle = (hint.format as SwFormatAutoFormat).GetStyleHandle();
  node.MoveTextAttr_To_AttrSet();
  expect(node.GetpSwpHints()).toBeUndefined();
  expect(map.Count()).toBe(0);
  expect(hint.m_pHints).toBeUndefined();
  for (const item of handle.entries())
    expect(node.GetpSwAttrSet()?.GetItemIfSet(item.Which(), false)?.equals(item)).toBe(true);
  expect(format(node).bold).toBe(true);
  expect(node.GetText()).toBe("ABCD");
  node.MoveTextAttr_To_AttrSet();
  expect(node.GetpSwpHints()).toBeUndefined();
});
it("native full-span movement preserves hints when direct items do not change", /** Checks native successful-insertion predicate. @returns Nothing. */ () => {
  const { node } = fixture(),
    hint = automatic(node),
    map = node.GetpSwpHints();
  node.SetAttr((hint.format as SwFormatAutoFormat).GetStyleHandle());
  const direct = node.GetpSwAttrSet();
  node.MoveTextAttr_To_AttrSet();
  node.MoveTextAttr_To_AttrSet();
  expect(node.GetpSwpHints()).toBe(map);
  expect(required(map).Get(0)).toBe(hint);
  expect(hint.m_pHints).toBe(map);
  expect(node.GetpSwAttrSet()).toBe(direct);
});
it.each(["partial", "nonzero", "dontmove"] as const)(
  "native full-span movement retains %s AUTO ranges",
  /** Checks source guard predicates. @param kind - Guard kind. @returns Nothing. */ (kind) => {
    const { node } = fixture(),
      hint = automatic(node, kind === "nonzero" ? 1 : 0, kind === "partial" ? 2 : 4),
      map = node.GetpSwpHints();
    if (kind === "dontmove") hint.dontMoveAttr = true;
    node.MoveTextAttr_To_AttrSet();
    expect(node.GetpSwAttrSet()).toBeUndefined();
    expect(node.GetpSwpHints()).toBe(map);
    expect(required(map).Get(0)).toBe(hint);
    expect([hint.start, hint.end, hint.IsDontMoveAttr()]).toEqual([
      kind === "nonzero" ? 1 : 0,
      kind === "partial" ? 2 : 4,
      kind === "dontmove",
    ]);
  },
);
it("native full-span movement stops at a char-format hyperlink before AUTO", /** Checks native start-map early break and backlinks. @returns Nothing. */ () => {
  const { node } = fixture(),
    auto = automatic(node),
    map = required(node.GetpSwpHints()),
    link = new SwTextINetFormat(new SwFormatINetFormat({ url: "native-split" }), 0, 4);
  map.Insert(link);
  expect(map.Get(0)).toBe(link);
  node.MoveTextAttr_To_AttrSet();
  expect(map.entries()).toEqual([link, auto]);
  expect(node.GetpSwAttrSet()).toBeUndefined();
  expect(link.GetpTextNode()).toBe(node);
  expect(link.format.GetTextINetFormat()).toBe(link);
});
it("native full-span movement continues past DontMove and unchanged unsupported item", /** Checks source continuation instead of a blanket conversion. @returns Nothing. */ () => {
  const { node } = fixture(),
    map = node.GetOrCreateSwpHints(),
    retained = new SwTextAttrEnd(new SwFormatINetFormat({ url: "bounded-item" }), 0, 4);
  map.Insert(retained);
  const auto = automatic(node);
  retained.dontMoveAttr = true;
  node.MoveTextAttr_To_AttrSet();
  expect(map.entries()).toEqual([retained]);
  expect(auto.m_pHints).toBeUndefined();
  retained.dontMoveAttr = false;
  node.MoveTextAttr_To_AttrSet();
  expect(map.entries()).toEqual([retained]);
  expect(format(node).bold).toBe(true);
});
it("native full-span traversal skips a nullable end query", /** Checks the native base-query boundary; point attributes remain outside represented ranges. @returns Nothing. */ () => {
  const { node } = fixture(),
    hint = automatic(node),
    map = node.GetpSwpHints(),
    query = vi.spyOn(hint, "GetEnd").mockReturnValueOnce(undefined as unknown as number);
  node.MoveTextAttr_To_AttrSet();
  query.mockRestore();
  expect(node.GetpSwpHints()).toBe(map);
  expect(hint.m_pHints).toBe(map);
  expect(node.GetpSwAttrSet()).toBeUndefined();
});
it.each([1, 2, 3, 4])(
  "native split moves full-span AUTO into both represented paragraphs at %s",
  /** Checks both source-owned split item sets. @param offset - Split position. @returns Nothing. */ (
    offset,
  ) => {
    const { doc, node } = fixture();
    automatic(node);
    doc.EnsureNumRule("Split", "numbered");
    node.SetNumRule("Split");
    node.SetListId("split-list");
    node.SetAttrListLevel(2);
    const trailing = node.SplitContent(offset);
    expect([node.GetText(), trailing.GetText()]).toEqual([
      "ABCD".slice(0, offset),
      "ABCD".slice(offset),
    ]);
    for (const paragraph of [node, trailing]) {
      expect(format(paragraph).bold).toBe(true);
      expect(paragraph.GetpSwpHints()).toBeUndefined();
      expect(paragraph.GetListId()).toBe("split-list");
      expect(paragraph.GetAttrListLevel()).toBe(2);
      paragraph.InsertText("X", paragraph.Len(), SwInsertFlags.EMPTYEXPAND);
      expect(format(paragraph, paragraph.Len()).bold).toBe(true);
    }
  },
);
it.each(["prefix", "suffix", "crossing"] as const)(
  "native split keeps partial and DontMove %s ownership",
  /** Checks retained ranged formatting. @param kind - Native source span. @returns Nothing. */ (
    kind,
  ) => {
    const { node } = fixture(),
      hint = automatic(node, kind === "suffix" ? 2 : 0, kind === "prefix" ? 1 : 4);
    hint.dontMoveAttr = true;
    const trailing = node.SplitContent(2);
    expect(node.GetpSwAttrSet()).toBeUndefined();
    expect(trailing.GetpSwAttrSet()).toBeUndefined();
    for (const paragraph of [node, trailing])
      for (const retained of paragraph.GetpSwpHints()?.entries() ?? [])
        expect(retained.IsDontMoveAttr()).toBe(true);
    expect(node.GetText()).toBe("AB");
    expect(trailing.GetText()).toBe("CD");
  },
);
it("native document SplitNode inserts native formatted paragraphs without a browser adapter", /** Checks manager ownership and indices. @returns Nothing. */ () => {
  const { doc, node } = fixture();
  automatic(node);
  const point = new SwPosition(node, 2);
  try {
    const trailing = doc.GetDocumentContentOperationsManager().SplitNode(point);
    expect(doc.paragraphs).toEqual([node, trailing]);
    expect(trailing.GetIndex()).toBe(node.GetIndex() + 1);
    expect([format(node).bold, format(trailing).bold]).toEqual([true, true]);
    expect([node.GetpSwpHints(), trailing.GetpSwpHints()]).toEqual([undefined, undefined]);
  } finally {
    point.Dispose();
  }
});
it("native empty split retains DontMove and unchanged direct values while closing DontExpand", /** Checks empty-boundary source rules. @returns Nothing. */ () => {
  const { node } = fixture("");
  const hint = automatic(node);
  hint.dontMoveAttr = true;
  const trailing = node.SplitContent(0);
  expect(required(trailing.GetpSwpHints()).Get(0).IsDontMoveAttr()).toBe(true);
  expect(trailing.GetpSwAttrSet()).toBeUndefined();
  const closed = required(trailing.GetpSwpHints()).Get(0);
  closed.SetDontExpand(true);
  const next = trailing.SplitContent(0);
  expect(next.GetpSwpHints()).toBeUndefined();
  const direct = fixture("").node,
    existing = automatic(direct);
  direct.SetAttr((existing.format as SwFormatAutoFormat).GetStyleHandle());
  const unchanged = direct.SplitContent(0);
  expect(required(unchanged.GetpSwpHints()).Count()).toBe(1);
  expect(format(unchanged).bold).toBe(true);
});
it("native ASCII read retains boundary paragraph character items through repeated undo and redo", /** Checks source-native removed node storage and history. @returns Nothing. */ () => {
  const { doc, node } = fixture("Base");
  automatic(node);
  const point = new SwPosition(node, node.Len()),
    before = createWriterCollapsedCursorState(
      node,
      node.Len(),
      node.GetCharacterItemsAt(node.Len()),
    ),
    history = new SwUndoInsDoc(point, before),
    context: SwUndoRedoContext = {
      GetDoc: /** Returns actual native history document. @returns Native document. */ () => doc,
      RestoreCursor: /** Accepts restored native cursor. @returns Nothing. */ () => {},
    };
  try {
    readWriterAsciiParagraphs(point, prepareWriterAsciiParagraphs("X\nY\nZ"));
    history.SetInsertRange(
      point,
      createWriterCollapsedCursorState(
        point.GetNode() as SwTextNode,
        point.GetContentIndex(),
        node.GetCharacterItemsAt(node.Len()),
      ),
    );
  } finally {
    point.Dispose();
  }
  doc.GetUndoManager().AddUndoAction(history);
  const inserted = [...doc.paragraphs],
    storage = doc.GetUndoManager().GetUndoNodes();
  expect(node.GetpSwpHints()).toBeUndefined();
  for (let cycle = 0; cycle < 3; cycle++) {
    expect(
      inserted.map(
        /** Reads actual paragraph text. @param value - Native node. @returns Text. */ (value) =>
          value.GetText(),
      ),
    ).toEqual(["BaseX", "Y", "Z"]);
    for (const paragraph of inserted) expect(format(paragraph, paragraph.Len()).bold).toBe(true);
    expect(storage.Count()).toBe(0);
    expect(doc.GetUndoManager().Undo(context)).toBe(true);
    expect(doc.paragraphs).toEqual([node]);
    expect(node.GetText()).toBe("Base");
    expect(format(node).bold).toBe(true);
    expect(storage.Count()).toBe(3);
    expect(doc.GetUndoManager().Redo(context)).toBe(true);
    expect(doc.paragraphs).toEqual(inserted);
    expect(storage.Count()).toBe(0);
  }
  doc.GetUndoManager().Clear();
});
it("native selected table plain paste retains both cells character formatting through history", /** Checks the existing native shell/UI input path. @returns Nothing. */ () => {
  const { doc, node } = fixture("Body"),
    table = doc.nodes.MakeTableNode("Split cells", {}, node);
  table.AddColumnWidth(2400);
  table.AddColumnWidth(2400);
  const row = doc.nodes.AppendTableRow(table, 2),
    first = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]),
    second = required(required(row.GetTabBoxes()[1]).GetParagraphs()[0]);
  first.SetText("Bold");
  second.SetText("Italic");
  automatic(first);
  automatic(second, 0, second.Len(), "italic");
  const shell = new SwWrtShell(
    new SwDocShell(
      doc,
      createDocument({ id: "split-native-items", suiteId: "writer", title: "Native split" }),
    ),
  );
  try {
    new SwEditWin(shell).SelectTableRow(first.GetIndex());
    expect(shell.PastePlainTextAtCursor("X\nY")).toBe(true);
    const boxes = row.GetTabBoxes();
    for (let cycle = 0; cycle < 3; cycle++) {
      for (const [index, box] of boxes.entries())
        for (const paragraph of box.GetParagraphs())
          expect(format(paragraph, paragraph.Len())[index === 0 ? "bold" : "italic"]).toBe(true);
      expect(shell.Undo()).toBe(true);
      expect([first.GetText(), second.GetText()]).toEqual(["Bold", "Italic"]);
      expect([format(first).bold, format(second).italic]).toEqual([true, true]);
      expect(shell.Redo()).toBe(true);
      expect(doc.GetUndoManager().GetUndoNodes().Count()).toBe(0);
    }
    expect(node.GetText()).toBe("Body");
  } finally {
    shell.Close();
  }
});
