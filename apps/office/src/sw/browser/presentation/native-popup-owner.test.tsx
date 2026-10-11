/** @fileoverview Verifies mounted Writer frames retain native text/table popup metadata and bindings during view focus changes. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import {
  getWriterPopupMenuPlacements,
  WRITER_COMMAND_IDS,
} from "../../uiconfig/swriter/menubar/menubar-commands";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases mounted owners and subscriptions. @returns Nothing. */ () => {
    cleanup();
    for (const s of sessions.splice(0)) s.Close();
  },
);
it("mounted body/cell frame chooses native resource while retaining the body editor and plain INET state", /** Exercises original mounted frame metadata without claiming next-task popup event presentation. @returns Nothing. */ () => {
  const s = createWriterDocumentSession();
  sessions.push(s);
  const doc = s.docShell.GetDoc(),
    body = doc.paragraphs[0],
    table = doc.nodes.MakeTableNode("MountedPopup");
  table.AddColumnWidth(3000);
  const cell = doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0];
  if (body === undefined || cell === undefined) throw Error("Missing owners");
  body.SetText("body");
  cell.SetText("cell");
  render(
    <WriterWorkbench isActive view={s.view} fileDialogs={s.fileDialogs} services={s.services} />,
  );
  const names: string[] = [];
  for (const node of [body, cell, body]) {
    act(
      /** Changes original node owner through the persistent native shell. @returns Nothing. */ () => {
        s.view.GetWrtShell().FocusNode(node);
      },
    );
    s.view
      .GetViewFrame()
      .GetDispatcher()
      .ExecutePopup(
        /** Receives resource directly from native interface traversal. @param name - Original resource. @returns Nothing. */ (
          name,
        ) => {
          expect(getWriterPopupMenuPlacements(name)).toBeDefined();
          names.push(name);
        },
      );
  }
  expect(names).toEqual(["text", "table", "text"]);
  expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent("body");
  expect(s.view.QueryState(WRITER_COMMAND_IDS.removeHyperlink).enabled).toBe(false);
});
