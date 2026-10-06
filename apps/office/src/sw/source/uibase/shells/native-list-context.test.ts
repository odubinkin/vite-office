/** @fileoverview Checks native list context stack, current-level state and text-shell command ownership. */
import { afterEach, describe, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { createWriterNumFormat } from "../../core/doc/number";
import { SwDocShell } from "../app/docsh";
import { SwView } from "../uiview/view";
import { SelectionType } from "../inc/wrtsh";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SfxViewFrame } from "../../../../sfx2/source/view/viewfrm";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
const views: SwView[] = [];
afterEach(
  /** Releases actual native graph owners. @returns Nothing. */ () => {
    for (const view of views.splice(0)) view.Close();
  },
);
/** Requires a real graph member. @param value - Optional graph member. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing list context owner");
  return value;
}
/** Creates an actual frame with native text/list context selection. @returns Owners. */
function fixture() {
  const doc = new SwDoc(),
    first = required(doc.paragraphs[0]),
    second = doc.nodes.MakeTextNode("Second"),
    plain = doc.nodes.MakeTextNode("Plain");
  first.SetText("First");
  const view = new SwView(
      new SwDocShell(
        doc,
        createDocument({ id: "list-context", suiteId: "writer", title: "Context" }),
      ),
    ),
    frame = new SfxViewFrame<SwView>(),
    shell = view.GetWrtShell();
  views.push(view);
  view.SelectShell();
  view.AttachFrame(frame);
  view.SelectShell();
  frame.SetActiveView(view, [
    view.GetDocShell().GetCommandShell(),
    view.GetCommandShell(),
    shell.GetCommandShell(),
  ]);
  view.SelectShell();
  return { doc, first, second, plain, view, frame, shell, dispatcher: frame.GetDispatcher() };
}
/** Places actual point and optional mark without retaining positions. @param f - Owners. @param point - Point node. @param mark - Optional mark. @returns Nothing. */
function select(f: ReturnType<typeof fixture>, point: SwTextNode, mark?: SwTextNode): void {
  const position = new SwPosition(point, 0),
    anchor = mark === undefined ? undefined : new SwPosition(mark, 0);
  try {
    f.shell.SetPaM(position, anchor);
  } finally {
    position.Dispose();
    anchor?.Dispose();
  }
}
/** Applies a native list and level. @param f - Owners. @param node - Actual paragraph. @param level - Native zero-based level. @returns Nothing. */
function list(f: ReturnType<typeof fixture>, node: SwTextNode, level: number): void {
  select(f, node);
  f.shell.SetParagraphListKind("numbered");
  node.SetAttrListLevel(level);
}
describe("native list context", /** Registers actual source-owned context contracts. @returns Nothing. */ () => {
  it("retains complete native SelectionType identities", /** Checks all header identities without upstream execution. @returns Nothing. */ () => {
    expect([
      SelectionType.NONE,
      SelectionType.Text,
      SelectionType.Graphic,
      SelectionType.Ole,
      SelectionType.Frame,
      SelectionType.NumberList,
      SelectionType.Table,
      SelectionType.TableCell,
      SelectionType.DrawObject,
      SelectionType.DrawObjectEditMode,
      SelectionType.Ornament,
      SelectionType.DbForm,
      SelectionType.FormControl,
      SelectionType.Media,
      SelectionType.ExtrudedCustomShape,
      SelectionType.FontWork,
      SelectionType.PostIt,
      SelectionType.TableRow,
      SelectionType.TableCol,
      SelectionType.All,
    ]).toEqual([
      0, 1, 2, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072,
      262144, 524288, 0x0ffff3,
    ]);
  });
  it("uses native sentinel10 for ordinary and actual structural cursor points", /** Checks true structural nodes rather than fake cursor targets. @returns Nothing. */ () => {
    const f = fixture();
    expect(f.shell.GetNumLevel()).toBe(10);
    expect(f.shell.GetSelectionType()).toBe(SelectionType.Text);
    f.shell.GetCursor().GetPoint().Assign(f.doc.GetNodes().at(0), 0);
    expect(f.shell.GetNumLevel()).toBe(10);
    expect(f.shell.GetSelectionType()).toBe(SelectionType.NONE);
  });
  it("uses sentinel10 when a real rule retains no attached tree record", /** Checks independent rule presence and actual tree membership. @returns Nothing. */ () => {
    const f = fixture();
    list(f, f.first, 4);
    const rule = required(f.first.GetNumRule());
    f.first.RemoveFromList();
    expect(f.first.GetNumRule()).toBe(rule);
    expect(f.first.GetActualListLevel()).toBe(-1);
    expect(f.shell.GetNumLevel()).toBe(10);
    expect(f.shell.GetSelectionType()).toBe(SelectionType.Text);
  });
  it.each([0, 4, 9])(
    "uses native current-level slot state at level=%s",
    /** Checks literal native upper/lower state independent of range mutation. @param level - Native point level. @returns Nothing. */ (
      level,
    ) => {
      const f = fixture();
      list(f, f.first, level);
      expect(f.shell.GetNumLevel()).toBe(level);
      expect(f.view.QueryState(WRITER_COMMAND_IDS.promote).enabled).toBe(level !== 0);
      expect(f.view.QueryState(WRITER_COMMAND_IDS.demote).enabled).toBe(level !== 9);
      expect(f.dispatcher.GetShell(0)).toBe(f.shell.GetCommandShell());
      expect(f.dispatcher.GetShell(1)).toBe(f.shell.GetListShell().GetCommandShell());
    },
  );
  it.each([false, true])(
    "keeps point state independent of rejected whole-range movement down=%s",
    /** Checks native command remains enabled at eligible point while core rejects a boundary elsewhere. @param down - Demotion direction. @returns Nothing. */ (
      down,
    ) => {
      const f = fixture();
      list(f, f.first, 4);
      list(f, f.second, down ? 9 : 0);
      select(f, f.first, f.second);
      f.doc.GetUndoManager().Clear();
      const command = down ? WRITER_COMMAND_IDS.demote : WRITER_COMMAND_IDS.promote;
      expect(f.shell.CanNumUpDown(down)).toBe(false);
      expect(f.view.QueryState(command).enabled).toBe(true);
      expect(f.view.Execute(command)).toMatchObject({ status: "executed", value: false });
      expect([f.first.GetActualListLevel(), f.second.GetActualListLevel()]).toEqual([
        4,
        down ? 9 : 0,
      ]);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
      select(f, f.second, f.first);
      expect(f.view.QueryState(command).enabled).toBe(false);
      expect([f.first.GetText(), f.second.GetText()]).toEqual(["First", "Second"]);
    },
  );
  it("does not let another eligible ring enable a boundary current point", /** Checks point-level native GetState differs from any-ring execution availability. @returns Nothing. */ () => {
    const f = fixture();
    list(f, f.first, 9);
    list(f, f.plain, 4);
    select(f, f.first);
    const point = new SwPosition(f.plain, 0),
      range = new SwPaM(point, undefined, f.shell.GetCursor());
    try {
      expect(f.shell.CanNumUpDown(true)).toBe(true);
      expect(f.view.QueryState(WRITER_COMMAND_IDS.demote).enabled).toBe(false);
    } finally {
      range.Dispose();
      point.Dispose();
    }
  });
  it.each(["numbered", "bullet"] as const)(
    "activates native list context for actual %s rules",
    /** Checks list kinds and exact stack identities. @param kind - List family. @returns Nothing. */ (
      kind,
    ) => {
      const f = fixture();
      f.shell.SetParagraphListKind(kind);
      expect(f.shell.GetSelectionType()).toBe(SelectionType.Text | SelectionType.NumberList);
      expect(f.dispatcher.GetShell(1)).toBe(f.shell.GetListShell().GetCommandShell());
      select(f, f.plain);
      expect(f.dispatcher.QueryDispatch(WRITER_COMMAND_IDS.demote)).toBeUndefined();
      expect(f.dispatcher.QueryDispatch(WRITER_COMMAND_IDS.orderedList)).toBeDefined();
      select(f, f.first);
      expect(f.dispatcher.GetShell(1)).toBe(f.shell.GetListShell().GetCommandShell());
    },
  );
  it("excludes native NONE formatting while retaining actual numbering ownership", /** Checks native NumberList suppresses a no-label rule rather than removing the rule. @returns Nothing. */ () => {
    const f = fixture(),
      rule = f.doc.GetDocumentListsManager().CreateAutomaticNumRule("numbered");
    rule.Set(0, createWriterNumFormat("numbered", "", { numberingType: "none" }));
    f.shell.SetCurNumRule(rule, false, "", true);
    expect(f.first.IsInList()).toBe(true);
    expect(f.first.GetNumRule()).toBe(rule);
    expect(f.shell.GetNumLevel()).toBe(0);
    expect(f.shell.GetSelectionType()).toBe(SelectionType.Text);
    expect(f.dispatcher.QueryDispatch(WRITER_COMMAND_IDS.demote)).toBeUndefined();
    expect(
      f.shell
        .GetListShell()
        .GetCommandShell()
        .GetInterface()
        .GetSlot(WRITER_COMMAND_IDS.orderedList),
    ).toBeUndefined();
    expect(
      f.shell.GetCommandShell().GetInterface().GetSlot(WRITER_COMMAND_IDS.orderedList),
    ).toBeDefined();
  });
  it("restores actual shell context on removal UndoRedo and document replacement", /** Checks persistent owners track graph replacement without duplicate shell pushes. @returns Nothing. */ () => {
    const f = fixture();
    list(f, f.first, 4);
    f.doc.GetUndoManager().Clear();
    expect(f.view.Execute(WRITER_COMMAND_IDS.removeBullets)).toMatchObject({
      status: "executed",
      value: true,
    });
    expect(f.dispatcher.QueryDispatch(WRITER_COMMAND_IDS.demote)).toBeUndefined();
    expect(f.shell.Undo()).toBe(true);
    expect(f.view.QueryState(WRITER_COMMAND_IDS.demote).enabled).toBe(true);
    expect(f.shell.Redo()).toBe(true);
    expect(f.dispatcher.QueryDispatch(WRITER_COMMAND_IDS.demote)).toBeUndefined();
    const generation = f.dispatcher.GetVersion();
    f.view.SelectShell();
    expect(f.dispatcher.GetVersion()).toBe(generation);
    f.shell.Undo();
    f.view.NewDocument();
    expect(f.dispatcher.QueryDispatch(WRITER_COMMAND_IDS.demote)).toBeUndefined();
    expect(f.dispatcher.GetShell(0)).toBe(f.shell.GetCommandShell());
    expect(f.shell.GetNumLevel()).toBe(10);
  });
  it("retains native table and selected-cell flags while masking cell mode for shell selection", /** Checks actual selected box rings and native view mask. @returns Nothing. */ () => {
    const f = fixture(),
      table = f.doc.nodes.MakeTableNode("Context", {}, f.plain),
      boxes = f.doc.nodes.AppendTableRow(table, 2).GetTabBoxes(),
      first = required(required(boxes[0]).GetParagraphs()[0]),
      second = required(required(boxes[1]).GetParagraphs()[0]);
    list(f, first, 4);
    list(f, second, 4);
    select(f, first);
    expect(f.shell.GetSelectionType()).toBe(
      SelectionType.Text | SelectionType.Table | SelectionType.NumberList,
    );
    expect(f.shell.SelectTableRow()).toBe(true);
    expect(f.shell.HasBoxSelection()).toBe(true);
    expect(f.shell.GetSelectionType()).toBe(
      SelectionType.Text | SelectionType.Table | SelectionType.TableCell | SelectionType.NumberList,
    );
    expect(
      f.dispatcher.GetShell(0)?.GetInterface().GetSlot(WRITER_COMMAND_IDS.insertRowsBefore),
    ).toBeDefined();
    expect(f.dispatcher.GetShell(1)).toBe(f.shell.GetCommandShell());
    expect(f.dispatcher.GetShell(2)).toBe(f.shell.GetListShell().GetCommandShell());
  });
});
