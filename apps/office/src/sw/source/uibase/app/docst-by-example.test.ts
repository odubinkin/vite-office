/** @fileoverview Independent native paragraph by-example request, direct-item, history and transport contracts. */
import { afterEach, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SfxRequest, createRequestArguments } from "../../../../sfx2/source/control/request";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SvxTextLeftMarginItem, SvxIndentValue } from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwUndoTextFormatCollCreate } from "../../core/undo/SwUndoFmt";
import { SfxCallMode } from "../../../../sfx2/source/control/bindings";
import { SwNumRule } from "../../core/doc/number";
import { SwNumRuleItem } from "../../core/para/paratr";
import {
  RES_MARGIN_TEXTLEFT,
  RES_UL_SPACE,
  RES_BREAK,
  RES_PARATR_NUMRULE,
} from "../../../inc/hintids";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases actual frames. @returns Nothing. */
  () => {
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Creates an original frame and source point owner. @returns Native owners. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    dispatch = session.frame.GetDispatcher();
  shell.Insert("Paragraph example");
  doc.GetUndoManager().Clear();
  return { ...session, doc, shell, dispatch, node: shell.GetActiveParagraph() };
}
/** Executes a concrete request through the actual frame. @param owner - Real owner chain. @param slot - Native identity. @param payload - Optional request items or Any. @returns Completed request. */
function execute(owner: ReturnType<typeof fixture>, slot: number, payload?: unknown) {
  const request = new SfxRequest(slot, createRequestArguments(slot, payload));
  owner.dispatch.ExecuteRequest(request);
  return request;
}
it("creates a named collection with point direct items, original parent and separate apply/create/attribute undo", /** Checks independent source order and owner recreation. @returns Nothing. */ () => {
  const f = fixture(),
    parent = f.doc.GetTextFormatColl("heading-1");
  f.node.ChgFormatColl(parent);
  parent.SetFormatAttr(new SvxULSpaceItem(120, 240, RES_UL_SPACE));
  f.node.SetAttr(new SvxTextLeftMarginItem(SvxIndentValue.twips(720), RES_MARGIN_TEXTLEFT));
  f.node.SetAttr(new SfxUInt16Item(RES_BREAK, 3));
  const request = execute(f, 5555, [
    new SfxStringItem(5555, "Owned: & 字"),
    new SfxUInt16Item(5553, 2),
  ]);
  expect(request.IsDone()).toBe(true);
  expect(request.GetReturnValue()).toBeUndefined();
  const collection = f.node.GetTextFormatColl();
  expect(collection.GetName()).toBe("Owned: & 字");
  expect(collection.DerivedFrom()).toBe(parent);
  expect(collection.GetAttrSet().GetItemIfSet(RES_UL_SPACE, false)).toBeUndefined();
  expect(collection.GetAttrSet().GetItemIfSet(RES_BREAK, false)).toBeUndefined();
  expect(
    (collection.GetAttrSet().Get(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft(),
  ).toBe(720);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(3);
  expect(f.shell.Undo()).toBe(true);
  expect(f.node.GetTextFormatColl()).toBe(parent);
  expect(f.shell.Undo()).toBe(true);
  expect(f.doc.FindTextFormatCollByName("Owned: & 字")).toBeUndefined();
  expect(f.shell.Undo()).toBe(true);
  expect(f.shell.Redo()).toBe(true);
  expect(f.shell.Redo()).toBe(true);
  expect(f.shell.Redo()).toBe(true);
  expect(f.node.GetTextFormatColl().GetName()).toBe("Owned: & 字");
  expect(f.node.GetTextFormatColl()).not.toBe(collection);
  expect(
    (
      f.node.GetTextFormatColl().GetAttrSet().Get(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem
    ).ResolveTextLeft(),
  ).toBe(720);
});
it("groups style update with reapplication and restores original direct ownership", /** Checks actual native update undo and unchanged inherited values. @returns Nothing. */ () => {
  const f = fixture(),
    style = f.doc.MakeTextFormatColl("Current", f.doc.GetDfltTextFormatColl());
  f.node.ChgFormatColl(style);
  style.SetFormatAttr(new SvxULSpaceItem(60, 80, RES_UL_SPACE));
  f.node.SetAttr(new SvxTextLeftMarginItem(SvxIndentValue.twips(1440), RES_MARGIN_TEXTLEFT));
  const request = execute(f, 5556);
  expect(request.IsDone()).toBe(true);
  expect(
    (
      request.GetArgs().find(
        /** Checks original appended argument identity. @param item - Request item. @returns Match. */
        (item) => item.Which() === 5556,
      ) as SfxStringItem
    ).GetValue(),
  ).toBe("Current");
  expect(f.node.GetpSwAttrSet()?.GetItemIfSet(RES_MARGIN_TEXTLEFT, false)).toBeUndefined();
  expect((style.GetAttrSet().Get(RES_UL_SPACE) as SvxULSpaceItem).GetUpper()).toBe(60);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  f.shell.Undo();
  expect(style.GetAttrSet().GetItemIfSet(RES_MARGIN_TEXTLEFT, false)).toBeUndefined();
  expect((f.node.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft()).toBe(
    1440,
  );
  f.shell.Redo();
  expect(f.node.GetpSwAttrSet()?.GetItemIfSet(RES_MARGIN_TEXTLEFT, false)).toBeUndefined();
});
it("keeps missing, empty and unsupported-family requests distinct from the dialog path", /** Checks literal typed and ordinary argument contracts. @returns Nothing. */ () => {
  const f = fixture();
  const empty = new SfxRequest(5555, createRequestArguments(5555, { Param: "" }));
  f.docShell.ExecStyleSheet(empty);
  expect(empty.IsDone()).toBe(false);
  expect(execute(f, 5555, { Param: "No char style", Family: 1 }).IsDone()).toBe(true);
  expect(f.doc.FindTextFormatCollByName("No char style")).toBeUndefined();
  expect(execute(f, 5556, { Param: "Missing" }).IsDone()).toBe(true);
  expect(execute(f, 5556, { Param: "Unsupported", Family: 1 }).IsDone()).toBe(true);
  execute(f, 5555, { Param: "default", Family: 8, FamilyName: "ParagraphStyles" });
  expect(f.node.GetTextFormatColl().GetName()).toBe("default");
  expect(f.node.GetTextFormatColl().id).not.toBe("default");
});
it("excludes automatic list rules while retaining named rules", /** Checks point-owned native rule classification. @returns Nothing. */ () => {
  const f = fixture();
  f.shell.SetParagraphListKind("numbered");
  const rule = f.node.GetNumRule();
  expect(rule?.IsAutoRule()).toBe(true);
  execute(f, 5555, { Param: "No automatic rule" });
  expect(
    f.node.GetTextFormatColl().GetAttrSet().GetItemIfSet(RES_PARATR_NUMRULE, false),
  ).toBeUndefined();
  const named = new SwNumRule("Missing named rule", "label-alignment");
  named.SetAutoRule(false);
  f.doc.AddNumRule(named);
  f.node.SetAttr(new SwNumRuleItem("Missing named rule"));
  execute(f, 5555, { Param: "Named rule" });
  expect(
    (
      f.node
        .GetTextFormatColl()
        .GetAttrSet()
        .GetItemIfSet(RES_PARATR_NUMRULE, false) as SwNumRuleItem
    ).GetValue(),
  ).toBe("Missing named rule");
});
it("opens and cancels native naming without mutating, then accepts the original asynchronous copy", /** Checks actual controller completion. @returns Completion. */ async () => {
  const f = fixture(),
    controller = f.view.GetDialogController();
  const request = new SfxRequest(5555);
  const pending = f.docShell.ExecStyleSheet(request);
  const first = controller.GetSnapshot();
  expect(first?.request.kind).toBe("new-style");
  expect(request.IsDone()).toBe(false);
  controller.Cancel(first?.id as number);
  await pending;
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  const next = f.docShell.ExecStyleSheet(new SfxRequest(5555));
  controller.Complete(controller.GetSnapshot()?.id as number, { name: "Accepted" });
  await next;
  expect(f.node.GetTextFormatColl().GetName()).toBe("Accepted");
});
it("lists actual user-defined style names while reserving native builtins", /** Original newstyle.cxx requests a UserDefined iterator, whose Writer classification is IsPoolUserFormat. Real custom collections use UNKNOWN65535 rather than zero. @returns Completion. */ async () => {
  const f = fixture(),
    controller = f.view.GetDialogController(),
    custom = f.doc.MakeTextFormatColl("Existing custom style", f.doc.GetDfltTextFormatColl()),
    builtin = f.doc.GetTextFormatColl("heading-1"),
    pending = f.docShell.ExecStyleSheet(new SfxRequest(5555));
  const snapshot = controller.GetSnapshot();
  try {
    expect(custom.GetPoolFormatId()).toBe(65535);
    expect(snapshot?.request.kind).toBe("new-style");
    if (snapshot?.request.kind !== "new-style") throw new Error("Missing actual naming request");
    expect(snapshot.request.names).toContain(custom.GetName());
    expect(snapshot.request.names).not.toContain(builtin.GetName());
    expect(snapshot.request.names).not.toContain(f.doc.GetDfltTextFormatColl().GetName());
    expect(snapshot.request.reservedNames).not.toContain(custom.GetName());
    expect(snapshot.request.reservedNames).toContain(builtin.GetName());
  } finally {
    if (snapshot) controller.Cancel(snapshot.id);
    await pending;
  }
});
it("persists new and updated named owners through ODT and the browser graph codec", /** Checks actual export/reopen and direct/inherited formatting. @returns Completion. */ async () => {
  const f = fixture();
  f.node.SetAttr(new SvxTextLeftMarginItem(SvxIndentValue.twips(960), RES_MARGIN_TEXTLEFT));
  execute(f, 5555, { Param: "Transport: & 字" });
  const bytes = await writeOdtDocument(f.doc, { title: "Styles" });
  const restored = await readOdtDocument(bytes, { title: "Styles" });
  const copied = decodeWriterDocument(encodeWriterDocument(f.doc));
  for (const doc of [restored.document, copied]) {
    const style = doc.FindTextFormatCollByName("Transport: & 字");
    expect(style).toBeDefined();
    expect(
      (style?.GetAttrSet().Get(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft(),
    ).toBe(960);
    expect(doc.paragraphs[0]?.GetTextFormatColl()).toBe(style);
  }
});

it("updates the first selected style from the point-node direct set and keeps ring application grouped", /** Checks distinct native lookup, source and application owners. @returns Nothing. */ () => {
  const f = fixture(),
    first = f.node,
    second = f.doc.GetNodes().MakeTextNode("Second"),
    third = f.doc.GetNodes().MakeTextNode("Third");
  const a = f.doc.MakeTextFormatColl("First style", f.doc.GetDfltTextFormatColl());
  const b = f.doc.MakeTextFormatColl("Point style", f.doc.GetDfltTextFormatColl());
  first.ChgFormatColl(a);
  second.ChgFormatColl(b);
  second.SetAttr(new SvxTextLeftMarginItem(SvxIndentValue.twips(2160), RES_MARGIN_TEXTLEFT));
  f.shell.SetPaM(new SwPosition(second, 3), new SwPosition(first, 2));
  const point = new SwPosition(third, 1),
    extra = new SwPaM(point, undefined, f.shell.GetCursor());
  try {
    expect(f.shell.GetCurTextFormatColl()).toBe(a);
    execute(f, 5556);
    expect(first.GetTextFormatColl()).toBe(a);
    expect(second.GetTextFormatColl()).toBe(a);
    expect(third.GetTextFormatColl()).toBe(a);
    expect(
      (a.GetAttrSet().Get(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft(),
    ).toBe(2160);
    expect(b.GetAttrSet().GetItemIfSet(RES_MARGIN_TEXTLEFT, false)).toBeUndefined();
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    f.shell.Undo();
    expect(second.GetTextFormatColl()).toBe(b);
    expect(third.GetParagraphStyle()).toBe("default");
    f.shell.Redo();
    expect(second.GetTextFormatColl()).toBe(a);
    expect(third.GetTextFormatColl()).toBe(a);
  } finally {
    extra.Dispose();
    point.Dispose();
  }
});
it("retains source overwrite creation history, follow correction and native empty-attribute handling", /** Checks real source quirks and non-undo mode. @returns Nothing. */ () => {
  const f = fixture(),
    existing = f.doc.MakeTextFormatColl("Overwrite", f.doc.GetDfltTextFormatColl()),
    follower = f.doc.MakeTextFormatColl("Follower", f.doc.GetDfltTextFormatColl());
  follower.SetNextTextFormatColl(existing);
  execute(f, 5555, { Param: "Overwrite" });
  f.shell.Undo();
  f.shell.Undo();
  expect(f.doc.FindTextFormatCollByName("Overwrite")).toBeUndefined();
  expect(follower.GetNextTextFormatColl()).toBe(follower);
  f.doc.DelTextFormatColl(f.doc.GetDfltTextFormatColl());
  expect(f.doc.GetDfltTextFormatColl().id).toBe("default");
  f.doc.GetUndoManager().Clear();
  f.node.SetAttr(new SfxUInt16Item(RES_BREAK, 3));
  execute(f, 5555, { Param: "Break only" });
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(2);
  f.doc.GetUndoManager().DoUndo(false);
  f.doc.ChgFormat(f.node.GetTextFormatColl(), f.node.GetTextFormatColl().GetAttrSet());
  f.doc.GetUndoManager().DoUndo(true);
});
it("preserves API mode and ignored asynchronous originals across replacement and close", /** Checks actual stale request lifetimes without native memory emulation. @returns Completion. */ async () => {
  const f = fixture(),
    request = new SfxRequest(5555, [], SfxCallMode.API);
  expect(request.GetCallMode()).toBe(SfxCallMode.API);
  expect(request.IsIgnored()).toBe(false);
  const pending = f.docShell.ExecStyleSheet(request);
  expect(request.IsIgnored()).toBe(true);
  const controller = f.view.GetDialogController(),
    id = controller.GetSnapshot()?.id as number;
  f.docShell.InitNew(f.docShell.GetDocumentState());
  controller.Complete(id, { name: "Stale" });
  await pending;
  expect(f.docShell.GetDoc().FindTextFormatCollByName("Stale")).toBeUndefined();
  const next = f.docShell.ExecStyleSheet(new SfxRequest(5555));
  const nextId = controller.GetSnapshot()?.id as number;
  f.docShell.SetView(undefined);
  controller.Complete(nextId, { name: "Detached" });
  await next;
  expect(f.docShell.GetDoc().FindTextFormatCollByName("Detached")).toBeUndefined();
  expect(f.docShell.ExecStyleSheet(new SfxRequest(5556))).toBeUndefined();
  f.docShell.UpdateStyle("Missing", 2);
  f.docShell.MakeByExample("Missing", 2);
});
it("pins synthetic-only no-text and lookup-limit branches without claiming real text-UI reachability", /** Deliberately substitutes structural lookup results to exercise retained source limits. @returns Nothing. */ () => {
  const f = fixture(),
    nodes = f.doc.GetNodes(),
    structural = nodes.at(0);
  const at = vi.spyOn(nodes, "at").mockReturnValue(structural);
  try {
    expect(f.shell.GetCurTextFormatColl()).toBeUndefined();
    f.shell.GetCursor().SetMark();
    const start = vi.spyOn(f.shell.GetCursor().Start(), "GetNodeIndex").mockReturnValue(0);
    const end = vi.spyOn(f.shell.GetCursor().End(), "GetNodeIndex").mockReturnValue(10000);
    expect(f.shell.GetCurTextFormatColl()).toBeUndefined();
    end.mockRestore();
    start.mockRestore();
    const request = new SfxRequest(5556);
    f.docShell.ExecStyleSheet(request);
    expect(request.IsDone()).toBe(false);
  } finally {
    at.mockRestore();
  }
});

it("pins synthetic-only creation redo before undo and repeated deletion without real history reachability claims", /** Exercises preserved defensive history branches outside normal manager ordering. @returns Nothing. */ () => {
  const f = fixture(),
    collection = f.doc.MakeTextFormatColl("Synthetic", f.doc.GetDfltTextFormatColl());
  const action = new SwUndoTextFormatCollCreate(collection, undefined, f.doc);
  expect(action.GetComment()).toBe("Create Paragraph Style");
  const context = {
    GetDoc:
      /** Supplies the actual graph. @returns Document. */
      () => f.doc,
    RestoreCursor:
      /** Source format history does not alter the cursor. @returns Nothing. */
      () => {},
  };
  action.UndoWithContext(context);
  action.UndoWithContext(context);
  const premature = new SwUndoTextFormatCollCreate(collection, undefined, f.doc);
  premature.RedoWithContext(context);
  expect(f.doc.FindTextFormatCollByName("Synthetic")).toBeDefined();
});

it("keeps absent table-operation defaults and document modified-false notifications read-only", /** Covers original defaults used by the modified aggregate without changing unrelated semantics. @returns Nothing. */ () => {
  const f = fixture();
  expect(f.doc.BalanceRowHeight(f.shell.GetCursor(), true)).toBe(false);
  expect(f.doc.InsertRow([])).toBe(false);
  expect(f.doc.InsertCol([])).toBe(false);
  f.doc.GetDocumentStateManager().NotifyModelChange({ kind: "document-modified", modified: false });
  f.node.SetAttr(new SvxTextLeftMarginItem(SvxIndentValue.twips(400), RES_MARGIN_TEXTLEFT));
  const style = f.doc.MakeTextFormatColl("History comment", f.doc.GetDfltTextFormatColl());
  f.shell.FillByEx(style);
  expect(f.doc.GetUndoManager().GetUndoAction()?.GetComment()).toBe("Change Style Attributes");
  f.shell.NumOrNoNum();
});
