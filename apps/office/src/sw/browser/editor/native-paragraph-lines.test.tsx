/** @fileoverview Checks original frame-owned paragraph lines behind mounted Writer Home End and history. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwTextFrame } from "../../source/core/text/txtfrm";
import { SwParaPortion } from "../../source/core/text/porlay";
import { SwTextCursor } from "../../source/core/text/itrtxt";
import { SwTextSizeInfo } from "../../source/core/text/inftxt";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases mounted native view owners. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
    SwTextCursor.SetRightMargin(false);
  },
);
it("mounted Writer uses original paragraph chain for shell margins and edits", /** Checks actual native objects and mounted text with undo redo. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    node = doc.paragraphs[0];
  if (node === undefined) throw Error("Missing text");
  node.SetText("abcdef");
  render(
    <WriterWorkbench
      isActive
      view={session.view}
      fileDialogs={session.fileDialogs}
      services={session.services}
    />,
  );
  const root = session.view.GetLayout(),
    shell = session.view.GetWrtShell(),
    registered: SwTextFrame[] = [];
  node.ForAllListeners(
    /** Collects original text clients. @param client - Native listener. @returns Continue. */ (
      client,
    ) => {
      if (client instanceof SwTextFrame) registered.push(client);
      return false;
    },
  );
  expect(registered.length).toBeGreaterThan(0);
  for (const frame of registered) expect(frame.GetPara()).toBeInstanceOf(SwParaPortion);
  root.SetCursorTextFrames(node, [
    {
      lines: [
        { start: 0, end: 3, height: 100 },
        { start: 3, end: 6, height: 100 },
      ],
      start: 0,
      end: 6,
    },
  ]);
  const frame = root.GetCursorTextFrame(node);
  if (frame === undefined) throw Error("Missing native cursor frame");
  const para = frame.GetPara(),
    iterator = new SwTextCursor(frame, new SwTextSizeInfo(frame));
  expect(iterator.GetCurr()).toBe(para);
  expect(iterator.CharCursorToLine(4)).toBe(para?.GetNext());
  expect(iterator.GetStart()).toBe(3);
  act(
    /** Runs native line margins and edits. @returns Nothing. */ () => {
      expect(shell.StartOfSection()).toBe(true);
      expect(shell.RightMargin()).toBe(true);
      expect(shell.getShellCursor().GetPoint().GetContentIndex()).toBe(3);
      shell.getShellCursor().GetPoint().Assign(node, 1);
      expect(shell.LeftMargin()).toBe(true);
      expect(shell.getShellCursor().GetPoint().GetContentIndex()).toBe(0);
      expect(shell.Insert("X")).toBe(true);
    },
  );
  const element = screen
    .getAllByRole("textbox")
    .find(
      /** Selects original native body input. @param host - Input element. @returns Whether text matches. */ (
        host,
      ) => host.textContent === "Xabcdef",
    );
  if (element === undefined) throw Error("Missing mounted body");
  expect(element).toHaveTextContent("Xabcdef");
  act(
    /** Undoes native edit. @returns Nothing. */ () => {
      expect(shell.Undo()).toBe(true);
    },
  );
  expect(element).toHaveTextContent("abcdef");
  act(
    /** Redoes native edit. @returns Nothing. */ () => {
      expect(shell.Redo()).toBe(true);
    },
  );
  expect(element).toHaveTextContent("Xabcdef");
  expect(doc.paragraphs[0]).toBe(node);
  expect(para?.GetParLen()).toBe(6);
});
