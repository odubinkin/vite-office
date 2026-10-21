/** @fileoverview Checks native paragraph sidebar item transport,split attributes,selection history and document IO through actual Writer frames. */
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import {
  SvxIndentValue,
  SvxLRSpaceItem,
  SvxFirstLineIndentItem,
  SvxTextLeftMarginItem,
  SvxRightMarginItem,
} from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SID_ATTR_PARA_LRSPACE, SID_ATTR_PARA_ULSPACE } from "../../../../editeng/inc/editids";
import {
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_TEXTLEFT,
  RES_MARGIN_RIGHT,
  RES_UL_SPACE,
} from "../../../inc/hintids";
import { SwPosition } from "../../core/crsr/pam";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Closes actual frame ownership. @returns Nothing. */ () => {
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Creates the production frame,dispatcher and text owner. @returns Actual session. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  return session;
}
/** Requires actual dispatcher execution rather than accepting a disabled/unsupported result. @param view - Actual view. @param url - Slot URL. @param args - Accepted payload. @returns Executed result. */
function run(
  view: ReturnType<typeof createWriterDocumentSession>["view"],
  url: string,
  args?: unknown,
) {
  const result = view.Execute(url, args);
  if (!("value" in result)) throw new Error(`Expected executable slot: ${url}`);
  return result;
}
/** Creates a literal native combined indent item. @returns Typed slot payload. */
function margins() {
  const item = new SvxLRSpaceItem(SID_ATTR_PARA_LRSPACE);
  item.SetTextLeft(SvxIndentValue.twips(1080));
  item.SetRight(SvxIndentValue.twips(720));
  item.SetTextFirstLineOffset(SvxIndentValue.twips(-360));
  return item;
}

it("preserves split attribute measures,relative proportions and automatic first line in slot state", /** Checks source Execute/GetAttrState literal transformations. @returns Nothing. */ () => {
  const session = fixture(),
    view = session.view,
    shell = view.GetWrtShell(),
    item = margins();
  item.SetTextLeft(SvxIndentValue.twips(1200), 75);
  item.SetRight(SvxIndentValue.twips(900), 125);
  item.SetTextFirstLineOffset(SvxIndentValue.twips(-400), 50);
  item.SetAutoFirst(true);
  expect(SID_ATTR_PARA_LRSPACE).toBe(10043);
  expect(run(view, ".uno:LeftRightParaMargin", [item]).value).toBe(true);
  const paragraph = shell.GetActiveParagraph(),
    first = paragraph.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem,
    left = paragraph.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem,
    right = paragraph.GetAttr(RES_MARGIN_RIGHT) as SvxRightMarginItem;
  expect([
    left.ResolveTextLeft(),
    left.GetPropLeft(),
    right.ResolveRight(),
    right.GetPropRight(),
    first.ResolveTextFirstLineOffset(),
    first.GetPropTextFirstLineOffset(),
    first.IsAutoFirst(),
  ]).toEqual([675, 75, 1406, 125, -100, 50, true]);
  const state = view.QueryState(".uno:LeftRightParaMargin").value as SvxLRSpaceItem;
  expect(state.Which()).toBe(10043);
  expect([
    state.ResolveTextLeft(),
    state.ResolveRight(),
    state.ResolveTextFirstLineOffset(),
    state.GetPropLeft(),
    state.GetPropRight(),
    state.GetPropTextFirstLineOffset(),
    state.IsAutoFirst(),
  ]).toEqual([506, 1758, -50, 75, 125, 50, true]);
  state.SetTextLeft(SvxIndentValue.twips(999));
  expect(left.ResolveTextLeft()).toBe(675);
  expect(shell.Undo()).toBe(true);
  expect((paragraph.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft()).toBe(
    0,
  );
  expect(shell.Redo()).toBe(true);
  expect((paragraph.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft()).toBe(
    675,
  );
});

it("routes absent LR arguments to the original slot's paragraph dialog", /** Checks the native dialog fallback rather than inventing a no-op command. @returns Completion. */ async () => {
  const session = fixture(),
    view = session.view,
    result = run(view, ".uno:LeftRightParaMargin"),
    dialogs = view.GetDialogController(),
    request = dialogs.GetSnapshot();
  expect(request?.request.kind).toBe("paragraph");
  expect(request?.request.commandUrl).toBe(".uno:LeftRightParaMargin");
  if (request === undefined) throw new Error("Expected actual paragraph dialog request");
  dialogs.Cancel(request.id);
  expect(await result.value).toBe(false);
});

it("normalizes UL proportions through the view,retains context and never mutates the request", /** Checks native ExecTabWin's self-assignments and identity remap. @returns Nothing. */ () => {
  const session = fixture(),
    view = session.view,
    item = new SvxULSpaceItem(120, 240, SID_ATTR_PARA_ULSPACE, true);
  item.SetPropUpper(50);
  item.SetPropLower(150);
  expect(SID_ATTR_PARA_ULSPACE).toBe(10042);
  expect(run(view, ".uno:ULSpacing", [item]).value).toBe(true);
  const actual = view.GetWrtShell().GetActiveParagraph().GetAttr(RES_UL_SPACE) as SvxULSpaceItem;
  expect([
    actual.Which(),
    actual.GetUpper(),
    actual.GetLower(),
    actual.GetPropUpper(),
    actual.GetPropLower(),
    actual.GetContext(),
  ]).toEqual([RES_UL_SPACE, 120, 240, 100, 100, true]);
  expect([item.Which(), item.GetPropUpper(), item.GetPropLower()]).toEqual([10042, 50, 150]);
  const state = view.QueryState(".uno:ULSpacing").value as SvxULSpaceItem;
  expect(state.Which()).toBe(10042);
  state.SetUpper(999);
  expect(actual.GetUpper()).toBe(120);
  expect(run(view, ".uno:ULSpacing").value).toBe(false);
  expect(run(view, ".uno:ULSpacing", [margins()]).value).toBe(false);
});

it("invalidates mixed selections and applies both commands as independent undo transactions across selected paragraphs", /** Checks actual multi-node state and history. @returns Nothing. */ () => {
  const session = fixture(),
    view = session.view,
    shell = view.GetWrtShell();
  shell.Insert("one");
  shell.SplitNode();
  shell.Insert("two");
  const [one, two] = shell.GetDoc().paragraphs;
  if (one === undefined || two === undefined) throw new Error("Expected two actual text nodes");
  run(view, ".uno:LeftRightParaMargin", [margins()]);
  run(view, ".uno:ULSpacing", [new SvxULSpaceItem(120, 240, 10042)]);
  shell.SetPaM(new SwPosition(two, 3), new SwPosition(one, 0));
  expect(view.QueryState(".uno:LeftRightParaMargin")).toMatchObject({
    mixed: true,
    value: undefined,
  });
  expect(view.QueryState(".uno:ULSpacing")).toMatchObject({ mixed: true, value: undefined });
  expect(run(view, ".uno:LeftRightParaMargin", [margins()]).value).toBe(true);
  expect(run(view, ".uno:ULSpacing", [new SvxULSpaceItem(120, 240, 10042)]).value).toBe(true);
  expect(view.QueryState(".uno:LeftRightParaMargin").mixed).toBe(false);
  expect(view.QueryState(".uno:ULSpacing").mixed).toBe(false);
  expect(shell.Undo()).toBe(true);
  expect((one.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetUpper()).toBe(0);
  expect((two.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetUpper()).toBe(120);
  expect(shell.Undo()).toBe(true);
  expect(view.QueryState(".uno:LeftRightParaMargin").mixed).toBe(true);
  expect(shell.Redo()).toBe(true);
  expect(shell.Redo()).toBe(true);
  expect(run(view, ".uno:LeftRightParaMargin", [margins()]).value).toBe(false);
  expect(run(view, ".uno:ULSpacing", [new SvxULSpaceItem(120, 240, 10042)]).value).toBe(false);
});

it("preserves sidebar slot values in a genuine ODT export/import", /** Checks actual filter connectivity independently of UI display. @returns Completion. */ async () => {
  const session = fixture(),
    view = session.view;
  run(view, ".uno:LeftRightParaMargin", [margins()]);
  run(view, ".uno:ULSpacing", [new SvxULSpaceItem(120, 240, 10042, true)]);
  const bytes = writeOdtDocument(
      view.GetWrtShell().GetDoc(),
      view.GetDocShell().GetDocumentState(),
    ),
    imported = await readOdtDocument(bytes, view.GetDocShell().GetDocumentState()),
    paragraph = imported.document.paragraphs[0];
  if (paragraph === undefined) throw new Error("Expected imported text node");
  expect((paragraph.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft()).toBe(
    1080,
  );
  expect((paragraph.GetAttr(RES_MARGIN_RIGHT) as SvxRightMarginItem).ResolveRight()).toBe(720);
  expect(
    (
      paragraph.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem
    ).ResolveTextFirstLineOffset(),
  ).toBe(-360);
  const ul = paragraph.GetAttr(RES_UL_SPACE) as SvxULSpaceItem;
  expect([ul.GetUpper(), ul.GetLower(), ul.GetContext()]).toEqual([120, 240, true]);
});

it("includes empty intermediate paragraphs and the native inclusive final paragraph at offset zero", /** Checks paragraph attributes across the actual node graph rather than nonempty character ranges. @returns Nothing. */ () => {
  const session = fixture(),
    view = session.view,
    shell = view.GetWrtShell();
  shell.Insert("one");
  shell.SplitNode();
  shell.SplitNode();
  shell.Insert("last");
  const [first, empty, last] = shell.GetDoc().paragraphs;
  if (first === undefined || empty === undefined || last === undefined)
    throw new Error("Expected three actual paragraphs");
  shell.SetPaM(new SwPosition(last, 0), new SwPosition(first, 1));
  expect(run(view, ".uno:LeftRightParaMargin", [margins()]).value).toBe(true);
  expect(run(view, ".uno:ULSpacing", [new SvxULSpaceItem(120, 240, 10042)]).value).toBe(true);
  for (const paragraph of [first, empty, last]) {
    expect(
      (paragraph.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft(),
    ).toBe(1080);
    expect((paragraph.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetUpper()).toBe(120);
  }
  expect(view.QueryState(".uno:LeftRightParaMargin").mixed).toBe(false);
  expect(view.QueryState(".uno:ULSpacing").mixed).toBe(false);
  expect(shell.Undo()).toBe(true);
  expect(shell.Undo()).toBe(true);
  for (const paragraph of [first, empty, last]) {
    expect(
      (paragraph.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft(),
    ).toBe(0);
    expect((paragraph.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetUpper()).toBe(0);
  }
});

it("crosses structural table nodes without treating them as paragraphs", /** Checks real node-array traversal through table and cell boundaries. @returns Nothing. */ () => {
  const session = fixture(),
    view = session.view,
    shell = view.GetWrtShell(),
    body = shell.GetActiveParagraph(),
    table = shell.InsertTable({ mnInsMode: 0, mnRowsToRepeat: 0 }, 2, 2);
  if (table === undefined) throw new Error("Expected actual table insertion");
  const cells = table.GetTabLines().flatMap(
      /** Reads actual cell paragraphs in node order. @param line - Native table row. @returns Cell paragraphs. */
      (line) =>
        line.GetTabBoxes().flatMap(
          /** Reads one cell's paragraph owners. @param box - Native cell. @returns Paragraph owners. */
          (box) => box.GetParagraphs(),
        ),
    ),
    first = cells[0];
  if (first === undefined) throw new Error("Expected actual cell paragraph");
  shell.SetPaM(new SwPosition(body, 0), new SwPosition(first, 0));
  expect(run(view, ".uno:LeftRightParaMargin", [margins()]).value).toBe(true);
  for (const paragraph of [...cells, body])
    expect(
      (paragraph.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft(),
    ).toBe(1080);
  expect(view.QueryState(".uno:LeftRightParaMargin").mixed).toBe(false);
  expect(shell.Undo()).toBe(true);
  for (const paragraph of [...cells, body])
    expect(
      (paragraph.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft(),
    ).toBe(0);
});
