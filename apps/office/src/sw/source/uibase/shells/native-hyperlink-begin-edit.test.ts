/** @fileoverview Checks native SID_EDIT_HYPERLINK beginning fallback against actual original body and cell owners. */
import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "../wrtsh/wrtsh1";
import { SwPosition } from "../../core/crsr/pam";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { createRequestArguments, SfxRequest } from "../../../../sfx2/source/control/request";
import { SwTextShell } from "./textsh1";
import { WriterDialogController } from "../dialog/writer-dialog-controller";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { RES_TXTATR_INETFMT } from "../../../inc/hintids";
import { SwpHints } from "../../core/txtnode/ndhints";
import { SwTextINetFormat } from "../../core/txtnode/txtatr2";
import { SwFormatINetFormat } from "../../core/txtnode/fmtatr2";
import type { SwPoolFormatId } from "../../../inc/poolfmt";
const shells: SwWrtShell[] = [];
/** Creates independent original native adjacent equal-URL owners. @param cell - Actual cell context. @returns Native editing fixture. */
function fixture(cell = false) {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("BeginLink");
  table.AddColumnWidth(3000);
  const box = doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0],
    node = cell ? box?.GetParagraphs()[0] : doc.paragraphs[0];
  if (node === undefined) throw Error("Missing native text owner");
  node.SetText("xxaaabbb");
  const first = new SwFormatINetFormat("https://example.test/same"),
    second = first.Clone();
  first.SetINetFormatAndId("", 65000 as SwPoolFormatId);
  second.SetVisitedFormatAndId("", 64000 as SwPoolFormatId);
  node.SetTextHints(
    new SwpHints(doc.GetAttrPool(), [
      new SwTextINetFormat(first, 2, 5),
      new SwTextINetFormat(second, 5, 8),
    ]),
  );
  const dialogs = new WriterDialogController(),
    shell = new SwWrtShell(
      new SwDocShell(doc, createDocument({ id: "begin-edit", suiteId: "writer", title: "Begin" })),
      dialogs,
    );
  shell.FocusNode(node);
  shells.push(shell);
  doc.GetUndoManager().Clear();
  return { doc, node, shell, dialogs, box };
}
/** Places actual ordinary native cursor endpoints. @param f - Fixture. @param offset - Point offset. @param mark - Optional mark. @returns Nothing. */
function place(f: ReturnType<typeof fixture>, offset: number, mark?: number) {
  const p = new SwPosition(f.node, offset),
    m = mark === undefined ? undefined : new SwPosition(f.node, mark);
  try {
    f.shell.SetPaM(p, m);
  } finally {
    p.Dispose();
    m?.Dispose();
  }
}
/** Resolves the bound actual EditHyperlink slot. @param f - Native fixture. @returns Actual command. */
function edit(f: ReturnType<typeof fixture>) {
  const owner = f.shell.GetCommandShell(),
    slot = owner.GetInterface().GetSlot(WRITER_COMMAND_IDS.editHyperlink);
  if (slot === undefined) throw Error("Missing native Edit slot");
  const resolved = owner.ResolveSlot(slot.slotId);
  if (resolved === undefined) throw Error("Missing bound slot");
  return resolved;
}
afterEach(
  /** Releases real native shells. @returns Nothing. */ () => {
    for (const shell of shells.splice(0)) shell.Close();
  },
);
it.each([false, true])(
  "native nonzero hyperlink start enables original edit cell=%s",
  /** Reproduces missing native Default-mode start fallback. @param cell - Original cell context. @returns Nothing. */ (
    cell,
  ) => {
    const f = fixture(cell);
    place(f, 5);
    const cursor = f.shell.GetCursor(),
      point = cursor.GetPoint(),
      hint = f.node.GetTextAttrAt(6, RES_TXTATR_INETFMT);
    expect(f.shell.GetHyperlinkAtCursor()).toBeUndefined();
    expect(edit(f).getState().enabled).toBe(true);
    expect(cursor.GetPoint()).toBe(point);
    expect(point.GetContentIndex()).toBe(5);
    expect(cursor.HasMark()).toBe(false);
    expect(f.node.GetTextAttrAt(6, RES_TXTATR_INETFMT)).toBe(hint);
  },
);
it.each([false, true])(
  "opening and cancelling begin edit retains the original selected hint cell=%s",
  /** Checks native cancellation selection and original owner identity. @param cell - Native cell context. @returns Completion. */ async (
    cell,
  ) => {
    const f = fixture(cell);
    place(f, 5);
    const cursor = f.shell.GetCursor(),
      point = cursor.GetPoint(),
      index = point.nContent,
      first = f.node.GetTextAttrAt(3, RES_TXTATR_INETFMT),
      second = f.node.GetTextAttrAt(6, RES_TXTATR_INETFMT);
    const result = edit(f).execute(new SfxRequest(edit(f).slot.slotId));
    expect(result.status).toBe("executed");
    expect(cursor.GetPoint()).toBe(point);
    expect(point.nContent).toBe(index);
    expect([point.GetContentIndex(), cursor.GetMark().GetContentIndex()]).toEqual([8, 5]);
    const request = f.dialogs.GetSnapshot();
    expect(request?.request.kind).toBe("hyperlink");
    if (request === undefined || request.request.kind !== "hyperlink")
      throw Error("Missing native dialog");
    expect(request.request.initialHyperlink?.url).toBe("https://example.test/same");
    expect(f.dialogs.Cancel(request.id)).toBe(true);
    if (result.status === "executed") expect(await result.value).toBe(false);
    expect([point.GetContentIndex(), cursor.GetMark().GetContentIndex()]).toEqual([8, 5]);
    expect(f.node.GetTextAttrAt(3, RES_TXTATR_INETFMT)).toBe(first);
    expect(f.node.GetTextAttrAt(6, RES_TXTATR_INETFMT)).toBe(second);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  },
);
it.each([false, true])(
  "accepted begin edit changes only the original second owner with undo cell=%s",
  /** Checks actual default lookup chooses the following shared-boundary link. @param cell - Native cell context. @returns Completion. */ async (
    cell,
  ) => {
    const f = fixture(cell);
    place(f, 5);
    const first = f.node.GetTextAttrAt(3, RES_TXTATR_INETFMT);
    const result = edit(f).execute(new SfxRequest(edit(f).slot.slotId));
    const request = f.dialogs.GetSnapshot();
    if (request === undefined) throw Error("Missing dialog");
    f.dialogs.Complete(request.id, {
      hyperlink: { url: "https://example.test/changed" },
      text: "",
    });
    if (result.status !== "executed") throw Error("Edit disabled");
    expect(await result.value).toBe(true);
    expect(f.node.GetText()).toBe("xxaaabbb");
    expect(f.node.GetTextAttrAt(3, RES_TXTATR_INETFMT)).toBe(first);
    expect(
      (f.node.GetTextAttrAt(6, RES_TXTATR_INETFMT)?.GetAttr() as SwFormatINetFormat).GetValue(),
    ).toBe("https://example.test/changed");
    expect((first?.GetAttr() as SwFormatINetFormat).GetINetFormatId()).toBe(65000);
    for (let n = 0; n < 2; n++) {
      expect(f.shell.Undo()).toBe(true);
      expect(f.shell.GetHyperlinkAtCursor()?.url).toBe("https://example.test/same");
      expect(f.shell.Redo()).toBe(true);
      expect(f.shell.GetHyperlinkAtCursor()?.url).toBe("https://example.test/changed");
    }
  },
);
it.each([
  [0, false],
  [1, false],
  [2, true],
  [3, true],
  [5, true],
  [7, true],
  [8, false],
])(
  "literal native edit state at offset%s is%s",
  /** Checks before, start, interior, shared start and terminal end. @param offset - Original content position. @param enabled - Native expected admission. @returns Nothing. */ (
    offset,
    enabled,
  ) => {
    const f = fixture();
    if (typeof offset !== "number") throw Error("Missing offset");
    place(f, offset);
    expect(edit(f).getState().enabled).toBe(enabled);
  },
);
it("uniform and mixed real selections retain their original Edit state", /** Checks selected metadata remains native and mixed ranges are disabled. @returns Nothing. */ () => {
  const f = fixture();
  place(f, 8, 5);
  expect(edit(f).getState().enabled).toBe(true);
  place(f, 8, 2);
  expect(edit(f).getState().enabled).toBe(false);
  place(f, 2, 2);
  expect(edit(f).getState().enabled).toBe(true);
});
it("direct arguments at the original start select and change only that attribute", /** Checks supported direct command arguments share native preparation. @returns Nothing. */ () => {
  const f = fixture();
  place(f, 2);
  const slot = edit(f);
  const result = slot.execute(
    new SfxRequest(
      slot.slot.slotId,
      createRequestArguments(slot.slot.slotId, {
        hyperlink: { url: "https://example.test/first" },
      }),
    ),
  );
  expect(result.status).toBe("executed");
  if (result.status === "executed") expect(result.value).toBe(true);
  expect(f.node.GetTextAttrAt(6, RES_TXTATR_INETFMT)?.GetAttr()).toBeInstanceOf(SwFormatINetFormat);
  expect(
    (f.node.GetTextAttrAt(6, RES_TXTATR_INETFMT)?.GetAttr() as SwFormatINetFormat).GetValue(),
  ).toBe("https://example.test/same");
  expect([
    f.shell.GetCursor().GetPoint().GetContentIndex(),
    f.shell.GetCursor().GetMark().GetContentIndex(),
  ]).toEqual([5, 2]);
});
it("existing selected, interior and zero-origin SET paths leave native endpoints unchanged before dialog", /** Checks no beginning preparation is added where GetCurAttr already supplies the link. @returns Completion. */ async () => {
  const f = fixture();
  const text = new SwTextShell(f.shell, f.dialogs);
  for (const [offset, mark] of [
    [3, undefined],
    [8, 5],
    [2, 2],
  ] as const) {
    place(f, offset, mark);
    const point = f.shell.GetCursor().GetPoint();
    expect(text.PrepareEditHyperlink()).toBe(true);
    expect(f.shell.GetCursor().GetPoint()).toBe(point);
    if (offset !== 2) expect(point.GetContentIndex()).toBe(offset);
  }
  f.node.SetHyperlink(0, 2, { url: "https://example.test/zero" });
  place(f, 0);
  const point = f.shell.GetCursor().GetPoint();
  expect(text.CanEditHyperlink()).toBe(true);
  expect(text.PrepareEditHyperlink()).toBe(true);
  expect(point.GetContentIndex()).toBe(0);
  expect(f.shell.GetCursor().HasMark()).toBe(false);
  const result = edit(f).execute(new SfxRequest(edit(f).slot.slotId));
  const request = f.dialogs.GetSnapshot();
  if (request === undefined) throw Error("Missing zero dialog");
  f.dialogs.Cancel(request.id);
  if (result.status === "executed") expect(await result.value).toBe(false);
  expect(point.GetContentIndex()).toBe(0);
});
it("plain and structural native points fail preparation without opening a dialog", /** Checks actual native absent text/hint execution guards without mocked state. @returns Nothing. */ () => {
  const f = fixture(),
    text = new SwTextShell(f.shell, f.dialogs);
  place(f, 1);
  expect(text.PrepareEditHyperlink()).toBe(false);
  const slot = text.GetShell().GetInterface().GetSlot(WRITER_COMMAND_IDS.editHyperlink);
  if (slot === undefined) throw Error("Missing slot");
  expect(slot.Execute(text, new SfxRequest(slot.slotId))).toBe(false);
  expect(f.dialogs.GetSnapshot()).toBeUndefined();
  f.shell.GetCursor().GetPoint().Assign(f.doc.GetNodes().at(0), 0);
  expect(text.CanEditHyperlink()).toBe(false);
  expect(text.PrepareEditHyperlink()).toBe(false);
  f.shell.GetCursor().GetPoint().Assign(f.node, 1);
});
it("empty URL beginning is not enabled even when an original low-level hint exists", /** Checks native fallback checks the actual URL value. @returns Nothing. */ () => {
  const f = fixture(),
    text = new SwTextShell(f.shell, f.dialogs);
  f.node.SetTextHints(new SwpHints(f.doc.GetAttrPool()));
  f.node.GetOrCreateSwpHints().Insert(new SwTextINetFormat(new SwFormatINetFormat(), 2, 5));
  place(f, 2);
  expect(text.CanEditHyperlink()).toBe(false);
});
it("actual table mode follows HasSelection and bypasses beginning selection preparation", /** Checks source-derived table-mode selection with original cursor owners. @returns Nothing. */ () => {
  const f = fixture(true),
    text = new SwTextShell(f.shell, f.dialogs);
  if (f.box === undefined) throw Error("Missing box");
  f.shell.SelectTableCell();
  expect(f.shell.IsTableMode()).toBe(true);
  expect(text.CanEditHyperlink()).toBe(false);
  const point = f.shell.getShellCursor().GetPoint();
  expect(text.PrepareEditHyperlink()).toBe(true);
  expect(f.shell.getShellCursor().GetPoint()).toBe(point);
});
