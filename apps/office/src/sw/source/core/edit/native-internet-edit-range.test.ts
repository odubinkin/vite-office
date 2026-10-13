/** @fileoverview Checks that hyperlink commands use original internet hint bounds instead of merging neighboring equal metadata through TextRuns. */
import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SwPosition } from "../crsr/pam";
import { SwpHints } from "../txtnode/ndhints";
import { SwTextINetFormat } from "../txtnode/txtatr2";
import { SwFormatINetFormat } from "../txtnode/fmtatr2";
import type { SwPoolFormatId } from "../../../inc/poolfmt";
import { RES_TXTATR_INETFMT } from "../../../inc/hintids";
const shells: SwWrtShell[] = [];
/** Builds two independent original equal-URL internet attributes in real body/cell owners. @param cell - Cell owner. @returns Native fixture. */
function fixture(cell = false) {
  const doc = new SwDoc(),
    body = doc.paragraphs[0],
    table = doc.nodes.MakeTableNode("NativeInternetRanges");
  table.AddColumnWidth(3000);
  const box = doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0],
    node = cell ? box?.GetParagraphs()[0] : body;
  if (node === undefined || box === undefined) throw Error("Missing native source");
  node.SetText("abcdef");
  const first = new SwTextINetFormat(
      new SwFormatINetFormat({ url: "https://example.test/same" }),
      0,
      3,
    ),
    second = new SwTextINetFormat(
      new SwFormatINetFormat({ url: "https://example.test/same" }),
      3,
      6,
    );
  second.format.SetINetFormatAndId("", 65000 as SwPoolFormatId);
  second.format.SetVisitedFormatAndId("", 64000 as SwPoolFormatId);
  node.SetTextHints(new SwpHints(doc.GetAttrPool(), [first, second]));
  const shell = new SwWrtShell(
    new SwDocShell(
      doc,
      createDocument({ id: "native-internet-range", suiteId: "writer", title: "Ranges" }),
    ),
  );
  shells.push(shell);
  shell.FocusNode(node);
  doc.GetUndoManager().Clear();
  const ownedFirst = node.GetTextAttrAt(1, RES_TXTATR_INETFMT),
    ownedSecond = node.GetTextAttrAt(4, RES_TXTATR_INETFMT);
  return { doc, node, box, shell, first: ownedFirst, second: ownedSecond };
}
/** Moves the actual native PaM without a projection. @param f - Original fixture. @param offset - Literal native position. @returns Nothing. */
function caret(f: ReturnType<typeof fixture>, offset: number) {
  const point = new SwPosition(f.node, offset);
  try {
    f.shell.SetPaM(point);
  } finally {
    point.Dispose();
  }
}
/** Reads the original INET owner at a literal interior position. @param f - Original fixture. @param offset - Interior offset. @returns Native item. */
function item(f: ReturnType<typeof fixture>, offset: number) {
  const hint = f.node.GetTextAttrAt(offset, RES_TXTATR_INETFMT);
  if (!(hint?.format instanceof SwFormatINetFormat)) throw Error("Missing native internet owner");
  return hint.format;
}
afterEach(
  /** Releases original cursor/view subscriptions. @returns Nothing. */ () => {
    for (const shell of shells.splice(0)) shell.Close();
  },
);
it.each([false, true])(
  "adjacent equal links edit only the original first attribute cell=%s",
  /** Reproduces URL-based projected-range merging through real commands and native history. @param cell - Actual cell context. @returns Nothing. */ (
    cell,
  ) => {
    const f = fixture(cell);
    caret(f, 1);
    const cursor = f.shell.GetCursor(),
      point = cursor.GetPoint();
    expect(f.node.GetTextAttrAt(1, RES_TXTATR_INETFMT)).toBe(f.first);
    expect(f.node.GetTextAttrAt(4, RES_TXTATR_INETFMT)).toBe(f.second);
    expect(f.shell.GetHyperlinkAtCursor()?.url).toBe("https://example.test/same");
    expect(cursor.GetPoint()).toBe(point);
    for (let cycle = 0; cycle < 3; cycle++) {
      const url = "https://example.test/changed" + cycle;
      expect(f.shell.SetHyperlink({ url })).toBe(true);
      expect(item(f, 1).GetValue()).toBe(url);
      expect(item(f, 4).GetValue()).toBe("https://example.test/same");
      expect([item(f, 4).GetINetFormatId(), item(f, 4).GetVisitedFormatId()]).toEqual([
        65000, 64000,
      ]);
      expect(f.node.GetText()).toBe("abcdef");
      expect(cursor.GetPoint().GetNode()).toBe(f.node);
      expect(cursor.GetPoint().GetContentIndex()).toBe(1);
      expect(f.shell.Undo()).toBe(true);
      expect(item(f, 1).GetValue()).toBe("https://example.test/same");
      expect(f.shell.Redo()).toBe(true);
      expect(item(f, 1).GetValue()).toBe(url);
      expect(item(f, 4).GetValue()).toBe("https://example.test/same");
      expect(f.shell.Undo()).toBe(true);
    }
    if (cell) expect(f.box.GetParagraphs()[0]).toBe(f.node);
  },
);
it("removing one original equal hyperlink preserves its adjacent native item and rich metadata", /** Checks original hinted bounds through removal and replay. @returns Nothing. */ () => {
  const f = fixture();
  caret(f, 4);
  expect(f.shell.SetHyperlink(undefined)).toBe(true);
  expect(f.node.GetTextAttrAt(4, RES_TXTATR_INETFMT)).toBeUndefined();
  expect(item(f, 1).GetValue()).toBe("https://example.test/same");
  expect(f.shell.Undo()).toBe(true);
  expect([item(f, 4).GetINetFormatId(), item(f, 4).GetVisitedFormatId()]).toEqual([65000, 64000]);
  expect(f.shell.Redo()).toBe(true);
  expect(f.node.GetTextAttrAt(4, RES_TXTATR_INETFMT)).toBeUndefined();
  expect(f.node.GetText()).toBe("abcdef");
});
it("character-format portions do not change the original internet range", /** Checks overlapping original character hints and internet boundaries through real shell formatting. @returns Nothing. */ () => {
  const f = fixture(),
    start = new SwPosition(f.node, 1),
    end = new SwPosition(f.node, 2);
  try {
    f.shell.SetPaM(end, start);
  } finally {
    start.Dispose();
    end.Dispose();
  }
  const original = f.node.GetTextAttrAt(1, RES_TXTATR_INETFMT),
    adjacent = f.node.GetTextAttrAt(4, RES_TXTATR_INETFMT);
  expect(f.shell.ToggleCharacterFormat("bold")).toBe(true);
  expect(f.node.GetTextAttrAt(1, RES_TXTATR_INETFMT)).toBe(original);
  expect(f.node.GetTextAttrAt(4, RES_TXTATR_INETFMT)).toBe(adjacent);
  for (let cycle = 0; cycle < 3; cycle++) {
    expect(f.shell.Undo()).toBe(true);
    expect(f.node.GetTextAttrAt(1, RES_TXTATR_INETFMT)).toBe(original);
    expect(f.shell.Redo()).toBe(true);
    expect(f.node.GetTextAttrAt(1, RES_TXTATR_INETFMT)).toBe(original);
    expect(f.node.GetTextAttrAt(4, RES_TXTATR_INETFMT)).toBe(adjacent);
  }
  caret(f, 2);
  expect(f.shell.SetHyperlink({ url: "https://example.test/formatted" })).toBe(true);
  expect(item(f, 0).GetValue()).toBe("https://example.test/formatted");
  expect(item(f, 2).GetValue()).toBe("https://example.test/formatted");
  expect(item(f, 4).GetValue()).toBe("https://example.test/same");
  expect(f.node.GetCharacterItemsAt(2).Count()).toBeGreaterThan(0);
});
it("a zero-offset caret resolves the original first hinted interval without merging neighbors", /** Checks the existing initial caret inheritance convention through the native pointer query. @returns Nothing. */ () => {
  const f = fixture();
  caret(f, 0);
  expect(f.shell.SetHyperlink({ url: "https://example.test/start" })).toBe(true);
  expect(item(f, 0).GetValue()).toBe("https://example.test/start");
  expect(item(f, 4).GetValue()).toBe("https://example.test/same");
});
