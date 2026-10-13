/** @fileoverview Checks original native Writer interface popup ownership on real text/table frames. */
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import {
  getWriterPopupMenuPlacements,
  WRITER_COMMAND_IDS,
} from "../../../uiconfig/swriter/menubar/menubar-commands";
import type { WriterMenuItemPlacement } from "../../../uiconfig/swriter/ui-resource";
import generated from "../../../uiconfig/swriter/writer-ui.generated.json" with { type: "json" };
import { createSfxShell } from "../../../../sfx2/source/control/shell";
import { SfxInterface } from "../../../../sfx2/source/control/objface";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases original view frames. @returns Nothing. */ () => {
    for (const s of sessions.splice(0)) s.Close();
  },
);
it("original text interface registers native text popup", /** Reproduces absent original metadata. @returns Nothing. */ () => {
  const s = createWriterDocumentSession();
  sessions.push(s);
  expect(s.view.GetWrtShell().GetCommandShell().GetInterface().GetPopupMenuName()).toBe("text");
});
it("original active table interface supplies native table popup", /** Reproduces missing context owner metadata/traversal. @returns Nothing. */ () => {
  const s = createWriterDocumentSession();
  sessions.push(s);
  const doc = s.docShell.GetDoc(),
    table = doc.nodes.MakeTableNode("PopupOwner");
  table.AddColumnWidth(3000);
  const cell = doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0];
  if (cell === undefined) throw Error("Missing native cell");
  s.view.GetWrtShell().FocusNode(cell);
  const names: string[] = [];
  s.view
    .GetViewFrame()
    .GetDispatcher()
    .ExecutePopup(
      /** Receives the original native resource name at final presentation boundary. @param name - Original resource name. @returns Nothing. */ (
        name,
      ) => {
        names.push(name);
      },
    );
  expect(names).toEqual(["table"]);
});

/** Collects original resource commands recursively. @param items - Generated placements. @returns Native ordered URLs. */
function ids(items: readonly WriterMenuItemPlacement[]): string[] {
  return items.flatMap(
    /** Preserves native menu ordering. @param item - Original placement. @returns Native command identities. */ (
      item,
    ) =>
      item.kind === "command" ? [item.commandId] : item.kind === "submenu" ? ids(item.items) : [],
  );
}
it("original popup resources preserve supported native text/table ordering and exclusions", /** Uses generated metadata only; no upstream runtime read. @returns Nothing. */ () => {
  const text = getWriterPopupMenuPlacements("text"),
    table = getWriterPopupMenuPlacements("table");
  if (text === undefined || table === undefined) throw Error("Missing original resource");
  expect(ids(text)).toContain(WRITER_COMMAND_IDS.removeHyperlink);
  expect(ids(table)).toContain(WRITER_COMMAND_IDS.removeHyperlink);
  expect(ids(table)).toContain(WRITER_COMMAND_IDS.insertRowsBefore);
  expect(ids(table)).not.toContain(WRITER_COMMAND_IDS.selectTable);
  expect(ids(text)).not.toContain(WRITER_COMMAND_IDS.insertRowsBefore);
  expect(table).not.toEqual(text);
  expect(getWriterPopupMenuPlacements("")).toBeUndefined();
  expect(getWriterPopupMenuPlacements("unknown")).toBeUndefined();
  expect(getWriterPopupMenuPlacements("constructor")).toBeUndefined();
  expect(getWriterPopupMenuPlacements("toString")).toBeUndefined();
  expect(getWriterPopupMenuPlacements("table")).toBe(table);
  expect(generated.unsupported["sw/uiconfig/swriter/popupmenu/table.xml"]).toContainEqual({
    classification: "X",
    context: [],
    entryKind: "command",
    sourceUrl: ".uno:NoBreak",
  });
});
it("an unregistered overlay keeps the original text owner while moving body/cell changes popup ownership", /** Checks actual frame stack and existing original shell selection. @returns Nothing. */ () => {
  const s = createWriterDocumentSession();
  sessions.push(s);
  const d = s.view.GetViewFrame().GetDispatcher(),
    overlay = createSfxShell({}, new SfxInterface([])),
    names: string[] = [];
  d.Push(overlay);
  d.ExecutePopup(
    /** Captures original text context beneath overlay. @param name - Native resource. @returns Nothing. */ (
      name,
    ) => {
      names.push(name);
    },
  );
  expect(names).toEqual(["text"]);
  d.Pop(overlay);
  const doc = s.docShell.GetDoc(),
    body = doc.paragraphs[0],
    table = doc.nodes.MakeTableNode("NativeContext");
  table.AddColumnWidth(3000);
  const cell = doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0];
  if (body === undefined || cell === undefined) throw Error("Missing owners");
  for (const node of [cell, body]) {
    s.view.GetWrtShell().FocusNode(node);
    d.ExecutePopup(
      /** Captures actual current shell identity. @param name - Native resource. @returns Nothing. */ (
        name,
      ) => {
        names.push(name);
      },
    );
  }
  expect(names).toEqual(["text", "table", "text"]);
});
