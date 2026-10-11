/** @fileoverview Checks actual native mapped frame margins behind mounted Writer caret edits and undo redo. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwTextFrame } from "../../source/core/text/txtfrm";
import { SwTextCursor } from "../../source/core/text/itrtxt";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
const frames: SwTextFrame[] = [];
afterEach(
  /** Releases actual mounted and native clients. @returns Nothing. */ () => {
    cleanup();
    for (const frame of frames.splice(0)) frame.DestroyImpl();
    for (const session of sessions.splice(0)) session.Close();
    SwTextCursor.SetRightMargin(false);
  },
);
it("mounted Writer actual native follow margins map original caret before editing and history", /** Checks original owners and mounted text without substituted frames or cursor methods. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    node = doc.paragraphs[0];
  if (node === undefined) throw Error("Missing body");
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
    master = new SwTextFrame(node, "native", 0, 3, 0, [{ start: 0, end: 3, height: 100 }], root),
    follow = new SwTextFrame(node, "native", 3, 6, 0, [{ start: 3, end: 6, height: 100 }], root);
  frames.push(master, follow);
  master.SetFollow(follow);
  expect(follow.FindMaster()).toBe(master);
  expect(follow.GetRegisteredIn()).toBe(node);
  expect(follow.getRootFrame()).toBe(root);
  act(
    /** Moves real native caret via original frame mapping then edits. @returns Nothing. */ () => {
      expect(shell.StartOfSection()).toBe(true);
      expect(master.RightMargin(shell.getShellCursor())).toBe(true);
      expect(shell.getShellCursor().GetPoint().GetContentIndex()).toBe(3);
      expect(follow.LeftMargin(shell.getShellCursor())).toBe(true);
      expect(shell.getShellCursor().GetPoint().GetContentIndex()).toBe(0);
      expect(shell.Insert("X")).toBe(true);
    },
  );
  const element = screen
    .getAllByRole("textbox")
    .find(
      /** Finds actual native text input. @param host - Original rendered input. @returns Matches. */ (
        host,
      ) => host.textContent === "Xabcdef",
    );
  if (element === undefined) throw Error("Missing text input");
  expect(element).toHaveTextContent("Xabcdef");
  act(
    /** Undoes native mapped-position edit. @returns Nothing. */ () => {
      expect(shell.Undo()).toBe(true);
    },
  );
  expect(element).toHaveTextContent("abcdef");
  act(
    /** Redoes native mapped-position edit. @returns Nothing. */ () => {
      expect(shell.Redo()).toBe(true);
    },
  );
  expect(element).toHaveTextContent("Xabcdef");
  expect(doc.paragraphs[0]).toBe(node);
});
