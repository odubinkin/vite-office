/** @fileoverview Native character-state ring limits, empty selected cells, direct full-node attributes and registered old/reset history. */
import { writerTextColorValue } from "../attr/swatrset";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { createWriterTextColorItem } from "../attr/swatrset";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SfxItemSet, SfxItemState } from "../../../../svl/inc/itemset";
import { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import { FontStrikeout as S } from "../../../../tools/inc/fontenum";
import { RES_CHRATR_CROSSEDOUT as WHICH } from "../../../inc/hintids";
import { SwDoc } from "../doc/doc";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import type { SwTextNode } from "../txtnode/ndtxt";
import { MakeTextAttr } from "../txtnode/thints";
import { RES_CHRATR_COLOR } from "../../../inc/hintids";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { resetParagraphTextAttributes } from "../txtnode/txtedt";
import { SwFormatINetFormat } from "../txtnode/fmtatr2";
import { RES_TXTATR_INETFMT } from "../../../inc/hintids";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases original shells and native graphs. @returns Nothing. */ () => {
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Creates a native shell with a single original text node. @returns Native fixture. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const shell = session.view.GetWrtShell(),
    doc = shell.GetDoc(),
    node = doc.paragraphs[0] as SwTextNode;
  node.SetText("abcdef");
  return { session, shell, doc, node };
}
/** Requests complete source character state. @param f - Native fixture. @returns Original caller-owned set. */
function state(f: { doc: SwDoc }) {
  return new SfxItemSet(f.doc.GetAttrPool(), [[WHICH, WHICH]]);
}
it("rejects a typed non-enum request without changing native items or history", /** Dynamic Sfx request arguments cannot substitute a different concrete item for strikeout. @returns Nothing. */ () => {
  const f = fixture(),
    before = f.doc.GetUndoManager().GetUndoActionCount();
  expect(
    f.session.view.Execute(".uno:Strikeout", [new SfxStringItem(WHICH, "not an enum")]),
  ).toMatchObject({ status: "executed", value: false });
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(before);
  expect(f.node.GetAttr(WHICH)).toBeInstanceOf(SvxCrossedOutItem);
});
it("preserves attributes outside a partial native character edit", /** Original full-cover hints are split only at the actual selected content boundaries. @returns Nothing. */ () => {
  const f = fixture(),
    items = new SfxItemSet(f.doc.GetAttrPool(), [[RES_CHRATR_COLOR, WHICH]]);
  items.Put(createWriterTextColorItem("#336699"));
  items.Put(new SvxCrossedOutItem(S.STRIKEOUT_SINGLE, WHICH));
  f.node.GetOrCreateSwpHints().Insert(MakeTextAttr(f.doc, items, 0, f.node.Len()));
  const point = new SwPosition(f.node, 4),
    mark = new SwPosition(f.node, 1);
  f.shell.SetPaM(point, mark);
  point.Dispose();
  mark.Dispose();
  const original = f.shell.GetCursor().GetPoint();
  f.session.view.Execute(".uno:Strikeout", [new SvxCrossedOutItem(S.STRIKEOUT_DOUBLE, WHICH)]);
  expect(f.shell.GetCursor().GetPoint()).toBe(original);
  /** Reads one actual native range's complete value. @param start - First position. @param end - End position. @returns Enum. */
  function value(start: number, end: number) {
    const result = state(f);
    f.node.GetParaAttr(result, start, end);
    return (result.Get(WHICH) as SvxCrossedOutItem).GetStrikeout();
  }
  expect([value(0, 1), value(1, 4), value(4, 6)]).toEqual([
    S.STRIKEOUT_SINGLE,
    S.STRIKEOUT_DOUBLE,
    S.STRIKEOUT_SINGLE,
  ]);
  expect(f.shell.Undo()).toBe(true);
  expect(value(0, 6)).toBe(S.STRIKEOUT_SINGLE);
  expect(f.shell.Redo()).toBe(true);
  expect(value(1, 4)).toBe(S.STRIKEOUT_DOUBLE);
});
it("preserves an independent original zero-length internet attribute", /** Collapsed native character requests retain unrelated zero hint families and their actual owner. @returns Nothing. */ () => {
  const f = fixture(),
    internet = MakeTextAttr(f.doc, new SwFormatINetFormat("https://example.test/zero"), 2, 2);
  f.node.GetOrCreateSwpHints().Insert(internet);
  const point = new SwPosition(f.node, 2);
  f.shell.SetPaM(point, point);
  point.Dispose();
  f.session.view.Execute(".uno:Strikeout", [new SvxCrossedOutItem(S.STRIKEOUT_DOUBLE, WHICH)]);
  expect(f.node.GetpSwpHints()?.entries()).toContain(internet);
  expect(f.shell.Undo()).toBe(true);
  expect(f.node.GetpSwpHints()?.entries()).toContain(internet);
  expect(f.shell.Redo()).toBe(true);
  expect(f.node.GetpSwpHints()?.entries()).toContain(internet);
});
it("preserves source mark admission in ordinary cursor rings", /** Unmarked and equal-mark ordinary ring members are excluded from the native insertion loop. @returns Nothing. */ () => {
  const f = fixture(),
    point = new SwPosition(f.node, 2),
    root = f.shell.GetCursor(),
    empty = new SwPaM(point, point, root),
    unmarked = new SwPaM(point, undefined, root),
    items = state(f);
  items.Put(new SvxCrossedOutItem(S.STRIKEOUT_DOUBLE, WHICH));
  try {
    root.GetPoint().Assign(f.node, 4);
    root.SetMark();
    root.GetMark().Assign(f.node, 1);
    expect(f.shell.SetAttrSet(items)).toBe(true);
    expect(
      f.node
        .GetpSwpHints()
        ?.entries()
        .some(
          /** Detects an incorrectly inserted skipped zero owner. @param hint - Actual hint. @returns Whether collapsed. */ (
            hint,
          ) => hint.GetStart() === 2 && hint.GetEnd() === 2,
        ),
    ).toBe(false);
    root.DeleteMark();
    empty.DeleteMark();
    expect(f.shell.SetAttrSet(items)).toBe(false);
  } finally {
    empty.Dispose();
    unmarked.Dispose();
    point.Dispose();
  }
});
it("formats text across original structural slots and preserves partial-range values", /** Source traversal visits real section nodes while only text nodes receive attributes. @returns Nothing. */ () => {
  const f = fixture(),
    table = f.doc.nodes.MakeTableNode("Selected structural slots");
  table.AddColumnWidth(3000);
  f.doc.nodes.AppendTableRow(table, 1);
  const last = f.doc.nodes.MakeTextNode("Tail");
  const point = new SwPosition(last, 2),
    mark = new SwPosition(f.node, 1);
  f.shell.SetPaM(point, mark);
  point.Dispose();
  mark.Dispose();
  const original = f.shell.GetCursor().GetPoint(),
    items = state(f);
  items.Put(new SvxCrossedOutItem(S.STRIKEOUT_SINGLE, WHICH));
  const beforeState = state(f);
  expect(f.shell.GetCurAttr(beforeState)).toBe(true);
  expect(beforeState.GetItemState(WHICH, false)).toBe(SfxItemState.DEFAULT);
  expect(f.shell.SetAttrSet(items)).toBe(true);
  const selectedState = state(f);
  expect(f.shell.GetCurAttr(selectedState)).toBe(true);
  expect((selectedState.Get(WHICH) as SvxCrossedOutItem).GetStrikeout()).toBe(S.STRIKEOUT_SINGLE);
  expect(f.shell.GetCursor().GetPoint()).toBe(original);
  expect(f.shell.Undo()).toBe(true);
  expect(f.shell.Redo()).toBe(true);
  const queried = state(f);
  last.GetParaAttr(queried, 0, 2);
  expect((queried.Get(WHICH) as SvxCrossedOutItem).GetStrikeout()).toBe(S.STRIKEOUT_SINGLE);
});
it("selectively resets compound values and actual internet attributes without replacing unrelated maps", /** Covers the original native selective RstTextAttr branches on initialized registered items. @returns Nothing. */ () => {
  const f = fixture(),
    items = new SfxItemSet(f.doc.GetAttrPool(), [[RES_CHRATR_COLOR, WHICH]]);
  items.Put(createWriterTextColorItem("#336699"));
  items.Put(new SvxCrossedOutItem(S.STRIKEOUT_SINGLE, WHICH));
  f.node.GetOrCreateSwpHints().Insert(MakeTextAttr(f.doc, items, 0, f.node.Len()));
  const reset = state(f);
  reset.Put(new SvxCrossedOutItem(S.STRIKEOUT_NONE, WHICH));
  resetParagraphTextAttributes(f.node, false, reset);
  expect(f.node.GetpSwpHints()?.Count()).toBe(1);
  f.node.SetHyperlink(0, f.node.Len(), { url: "https://example.test/retained" });
  resetParagraphTextAttributes(f.node, false, reset);
  const internet = new SfxItemSet(f.doc.GetAttrPool(), [[RES_TXTATR_INETFMT, RES_TXTATR_INETFMT]]);
  internet.Put(new SwFormatINetFormat(""));
  resetParagraphTextAttributes(f.node, false, internet);
  expect(
    f.node
      .GetpSwpHints()
      ?.entries()
      .some(
        /** Checks removed original internet family. @param hint - Actual hint. @returns Whether internet. */ (
          hint,
        ) => hint.Which() === RES_TXTATR_INETFMT,
      ),
  ).toBe(false);
});
it("queries borrowed original cursors without applying active typing items", /** Explicit GetPaMAttr ranges may differ from the editing cursor. @returns Nothing. */ () => {
  const f = fixture(),
    other = f.doc.nodes.MakeTextNode("Other owner");
  other.SetAttr(new SvxCrossedOutItem(S.STRIKEOUT_DOUBLE, WHICH));
  f.session.view.Execute(".uno:Strikeout", [new SvxCrossedOutItem(S.STRIKEOUT_SINGLE, WHICH)]);
  const point = new SwPosition(other, 0),
    range = new SwPaM(point);
  try {
    const result = state(f);
    expect(f.shell.GetPaMAttr(range, result)).toBe(true);
    expect((result.Get(WHICH) as SvxCrossedOutItem).GetStrikeout()).toBe(S.STRIKEOUT_DOUBLE);
    f.session.view.Execute(".uno:DefaultNumbering");
    f.shell.GetCursor().SetInFrontOfLabel_(true);
    const label = state(f);
    expect(f.shell.GetCurAttr(label)).toBe(true);
    expect(label.Count()).toBe(0);
    f.shell.GetCursor().SetInFrontOfLabel_(false);
  } finally {
    range.Dispose();
    point.Dispose();
  }
});
it("retains original collapsed attributes and removes only the changed zero hint during history", /** A marked equal-end request is a native zero-width attribute operation,not a nonempty range or browser-only pending flag. @returns Nothing. */ () => {
  const f = fixture(),
    items = new SfxItemSet(f.doc.GetAttrPool(), [[RES_CHRATR_COLOR, WHICH]]);
  items.Put(createWriterTextColorItem("#336699"));
  items.Put(new SvxCrossedOutItem(S.STRIKEOUT_SINGLE, WHICH));
  f.node.GetOrCreateSwpHints().Insert(MakeTextAttr(f.doc, items, 2, 2));
  const point = new SwPosition(f.node, 2);
  f.shell.SetPaM(point, point);
  point.Dispose();
  f.session.view.Execute(".uno:Strikeout", [new SvxCrossedOutItem(S.STRIKEOUT_DOUBLE, WHICH)]);
  /** Reads the original source collapsed query. @returns Full enum and independent color. */
  function current() {
    const result = new SfxItemSet(items.GetPool(), items.GetRanges());
    f.node.GetParaAttr(result, 2, 2);
    return [
      (result.Get(WHICH) as SvxCrossedOutItem).GetStrikeout(),
      writerTextColorValue(result.Get(RES_CHRATR_COLOR) as SvxColorItem),
    ];
  }
  expect(current()).toEqual([S.STRIKEOUT_DOUBLE, "#336699"]);
  expect(f.node.GetText()).toBe("abcdef");
  expect(f.shell.Undo()).toBe(true);
  expect(current()).toEqual([S.STRIKEOUT_SINGLE, "#336699"]);
  expect(f.shell.Redo()).toBe(true);
  expect(current()).toEqual([S.STRIKEOUT_DOUBLE, "#336699"]);
  expect(f.node.GetpSwpHints()?.Count()).toBe(1);
});
it("preserves unrelated original hint owners during full-node edits and history", /** Selective native deletion must not recreate an unrelated color hint or its maps. @returns Nothing. */ () => {
  const f = fixture(),
    color = new SfxItemSet(f.doc.GetAttrPool(), [[RES_CHRATR_COLOR, RES_CHRATR_COLOR]]);
  color.Put(createWriterTextColorItem("#336699"));
  const hint = MakeTextAttr(f.doc, color, 0, f.node.Len()),
    hints = f.node.GetOrCreateSwpHints();
  hints.Insert(hint);
  const point = new SwPosition(f.node, f.node.Len()),
    mark = new SwPosition(f.node, 0);
  f.shell.SetPaM(point, mark);
  point.Dispose();
  mark.Dispose();
  f.session.view.Execute(".uno:Strikeout", [new SvxCrossedOutItem(S.STRIKEOUT_DOUBLE, WHICH)]);
  for (let pass = 0; pass < 3; pass++) {
    expect(f.node.GetpSwpHints()).toBe(hints);
    expect(hints.Get(0)).toBe(hint);
    if (pass === 0) expect(f.shell.Undo()).toBe(true);
    else if (pass === 1) expect(f.shell.Redo()).toBe(true);
  }
});
it("keeps the native full-node hint branch when an actual character-format hint exists", /** Internet text attributes carry the native IsCharFormatAttr flag and preserve their original owner through attribute history. @returns Nothing. */ () => {
  const f = fixture();
  f.node.SetHyperlink(0, f.node.Len(), { url: "https://example.test/original" });
  const hint = f.node.GetpSwpHints()?.Get(0);
  expect(hint?.IsCharFormatAttr()).toBe(true);
  const point = new SwPosition(f.node, f.node.Len()),
    mark = new SwPosition(f.node, 0);
  f.shell.SetPaM(point, mark);
  point.Dispose();
  mark.Dispose();
  f.session.view.Execute(".uno:Strikeout", [new SvxCrossedOutItem(S.STRIKEOUT_DOUBLE, WHICH)]);
  expect(f.node.GetpSwAttrSet()?.GetItemIfSet(WHICH, false)).toBeUndefined();
  expect(f.node.GetpSwpHints()?.entries()).toContain(hint);
  expect(f.shell.Undo()).toBe(true);
  expect(f.node.GetpSwpHints()?.entries()).toContain(hint);
  expect(f.shell.Redo()).toBe(true);
  expect(f.node.GetpSwpHints()?.entries()).toContain(hint);
});
it("preserves direct full-node values and records same-value attribute actions", /** Verifies original directness and registered old/reset restoration through repeated undo and redo. @returns Nothing. */ () => {
  const f = fixture(),
    point = new SwPosition(f.node, f.node.Len()),
    mark = new SwPosition(f.node, 0);
  f.shell.SetPaM(point, mark);
  point.Dispose();
  mark.Dispose();
  f.doc.GetUndoManager().Clear();
  expect(f.node.GetpSwAttrSet()?.GetItemIfSet(WHICH, false)).toBeUndefined();
  for (let pass = 0; pass < 2; pass++)
    f.session.view.Execute(".uno:Strikeout", [new SvxCrossedOutItem(S.STRIKEOUT_DOUBLE, WHICH)]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(2);
  expect(
    (f.node.GetpSwAttrSet()?.GetItemIfSet(WHICH, false) as SvxCrossedOutItem).GetStrikeout(),
  ).toBe(S.STRIKEOUT_DOUBLE);
  expect(f.node.GetpSwpHints()?.Count() ?? 0).toBe(0);
  expect(f.shell.Undo()).toBe(true);
  expect((f.node.GetAttr(WHICH) as SvxCrossedOutItem).GetStrikeout()).toBe(S.STRIKEOUT_DOUBLE);
  expect(f.shell.Undo()).toBe(true);
  expect(f.node.GetpSwAttrSet()?.GetItemIfSet(WHICH, false)).toBeUndefined();
  expect(f.shell.Redo()).toBe(true);
  expect(f.shell.Redo()).toBe(true);
  expect((f.node.GetAttr(WHICH) as SvxCrossedOutItem).GetStrikeout()).toBe(S.STRIKEOUT_DOUBLE);
});
it("includes empty native table ranges in query, mutation and atomic history", /** Literal selected empty cells own direct character values even without text portions. @returns Nothing. */ () => {
  const f = fixture(),
    table = f.doc.nodes.MakeTableNode("Empty selected cells");
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const row = f.doc.nodes.AppendTableRow(table, 2),
    first = row.GetTabBoxes()[0]?.GetParagraphs()[0],
    second = row.GetTabBoxes()[1]?.GetParagraphs()[0];
  if (!first || !second) throw new Error("Missing empty selected native cells");
  first.SetAttr(new SvxCrossedOutItem(S.STRIKEOUT_DOUBLE, WHICH));
  const point = new SwPosition(first, 0);
  f.shell.SetCursor(point);
  point.Dispose();
  f.session.view.Execute(".uno:SelectTable");
  f.doc.GetUndoManager().Clear();
  expect(f.session.view.QueryState(".uno:Strikeout")).toMatchObject({
    mixed: true,
    checked: false,
  });
  expect(f.session.view.Execute(".uno:Strikeout")).toMatchObject({
    status: "executed",
    value: true,
  });
  for (const node of [first, second])
    expect((node.GetAttr(WHICH) as SvxCrossedOutItem).GetStrikeout()).toBe(S.STRIKEOUT_SINGLE);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(f.shell.Undo()).toBe(true);
  expect((first.GetAttr(WHICH) as SvxCrossedOutItem).GetStrikeout()).toBe(S.STRIKEOUT_DOUBLE);
  expect(second.GetpSwAttrSet()?.GetItemIfSet(WHICH, false)).toBeUndefined();
  expect(f.shell.Redo()).toBe(true);
  expect((second.GetAttr(WHICH) as SvxCrossedOutItem).GetStrikeout()).toBe(S.STRIKEOUT_SINGLE);
});
it("admits10000 original cursor owners and clears state at10001", /** Uses real owned PaM rings at the literal source boundary. @returns Nothing. */ () => {
  const f = fixture(),
    root = f.shell.GetCursor(),
    position = new SwPosition(f.node, 0),
    ranges: SwPaM[] = [];
  try {
    for (let i = 1; i < 10000; i++) ranges.push(new SwPaM(position, undefined, root));
    expect(f.shell.GetCurAttr(state(f))).toBe(true);
    ranges.push(new SwPaM(position, undefined, root));
    const result = state(f);
    result.Put(new SvxCrossedOutItem(S.STRIKEOUT_DOUBLE, WHICH));
    expect(f.shell.GetCurAttr(result)).toBe(false);
    expect(result.Count()).toBe(0);
  } finally {
    for (const range of ranges) range.Dispose();
    position.Dispose();
  }
});
it("admits9999 native node offsets and rejects10000 without changing owners", /** Exercises actual source node-span limit and default-valued merging across original text nodes. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0] as SwTextNode;
  node.SetText("abcdef");
  let last = node;
  for (let i = 0; i < 9999; i++) last = doc.nodes.MakeTextNode("x");
  const owner = new SwDocShell(
    doc,
    createDocument({ id: "native-character-state-limit", suiteId: "writer", title: "State limit" }),
  );
  const shell = new SwWrtShell(owner),
    f = { doc, node, shell };
  const mark = new SwPosition(f.node, 0),
    point = new SwPosition(last, 1),
    range = new SwPaM(point, mark);
  try {
    const collected = state(f);
    expect(f.shell.GetPaMAttr(range, collected)).toBe(true);
    expect(collected.GetItemState(WHICH, false)).toBe(SfxItemState.DEFAULT);
    last = f.doc.nodes.MakeTextNode("x");
    range.GetPoint().Assign(last, 1);
    collected.Put(new SvxCrossedOutItem(S.STRIKEOUT_DOUBLE, WHICH));
    expect(f.shell.GetPaMAttr(range, collected)).toBe(false);
    expect(collected.Count()).toBe(0);
  } finally {
    range.Dispose();
    point.Dispose();
    mark.Dispose();
    shell.Close();
    owner.Close();
  }
});
