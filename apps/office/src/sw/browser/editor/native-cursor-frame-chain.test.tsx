/** @fileoverview Checks mounted native cursor chains over an explicit device-geometry fixture and original history. */
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwTextCursor } from "../../source/core/text/itrtxt";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
const originalRects = Object.getOwnPropertyDescriptor(Range.prototype, "getClientRects");
afterEach(
  /** Restores the explicit device port and releases actual UI/native ownership. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
    if (originalRects === undefined) delete (Range.prototype as Partial<Range>).getClientRects;
    else Object.defineProperty(Range.prototype, "getClientRects", originalRects);
    SwTextCursor.SetRightMargin(false);
  },
);
it("mounted body pages publish reciprocal native follows and retain original editing history", /** Checks actual native pagination with literal deterministic device geometry, independently of real-Chromium geometry parity. @returns Completion. */ async () => {
  Object.defineProperty(Range.prototype, "getClientRects", {
    configurable: true,
    value:
      /** Supplies the explicit browser-device rectangle contract for three literal lines. @param this - Actual device Range receiver. @returns Actual fixture rectangles. */ function (
        this: Range,
      ) {
        const top = Math.floor(this.startOffset / 6) * 1000;
        return [{ top, left: 0, width: 10, height: 900, bottom: top + 900, right: 10 }];
      },
  });
  const session = createWriterDocumentSession();
  sessions.push(session);
  const node = session.docShell.GetDoc().paragraphs[0];
  if (node === undefined) throw Error("Missing native body");
  const text = "abc   def   ghi   ";
  node.SetText(text);
  const mounted = render(
    <WriterWorkbench
      isActive
      view={session.view}
      fileDialogs={session.fileDialogs}
      services={session.services}
    />,
  );
  await waitFor(
    /** Waits for actual source formatter pagination from the device port. @returns Nothing. */ () =>
      expect(
        mounted.container.querySelectorAll("[data-writer-page] p[data-writer-node-index]").length,
      ).toBeGreaterThan(1),
  );
  const fragments = [
    ...mounted.container.querySelectorAll<HTMLParagraphElement>(
      "[data-writer-page] p[data-writer-node-index]",
    ),
  ];
  const first = fragments[0],
    last = fragments.at(-1);
  if (
    first === undefined ||
    last === undefined ||
    first.firstChild === null ||
    last.firstChild === null
  )
    throw Error("Missing device fragments");
  window.getSelection()?.setBaseAndExtent(first.firstChild, 1, first.firstChild, 1);
  expect(fireEvent.keyDown(first, { key: "End" })).toBe(false);
  const root = session.view.GetLayout(),
    master = root.GetCursorTextFrame(node),
    follow = master?.GetFollow();
  expect(master?.GetOffset()).toBe(0);
  expect(follow?.FindMaster()).toBe(master);
  expect(follow?.IsFollow()).toBe(true);
  expect(follow?.GetRegisteredIn()).toBe(node);
  expect(follow?.getRootFrame()).toBe(root);
  expect(session.view.GetWrtShell().getShellCursor().GetPoint().GetContentIndex()).toBe(3);
  window.getSelection()?.setBaseAndExtent(last.firstChild, 1, last.firstChild, 1);
  SwTextCursor.SetRightMargin(false);
  expect(fireEvent.keyDown(last, { key: "End", shiftKey: true })).toBe(false);
  const cursor = session.view.GetWrtShell().getShellCursor();
  expect(cursor.GetPoint().GetNode()).toBe(node);
  expect(cursor.GetPoint().GetContentIndex()).toBe(18);
  expect(cursor.GetMark().GetContentIndex()).toBe(Number(last.dataset.writerFragmentStart) + 1);
  expect(master?.IsInDtor()).toBe(false);
  expect(follow?.IsInDtor()).toBe(false);
  expect(fireEvent.keyDown(last, { key: "Home" })).toBe(false);
  expect(cursor.HasMark()).toBe(false);
  const insertion = cursor.GetPoint().GetContentIndex();
  expect(insertion).toBe(Number(last.dataset.writerFragmentStart));
  act(
    /** Inserts through the original shell position. @returns Nothing. */ () => {
      expect(session.view.GetWrtShell().Insert("X")).toBe(true);
    },
  );
  expect(node.GetText()).toBe(text.slice(0, insertion) + "X" + text.slice(insertion));
  act(
    /** Replays original source history. @returns Nothing. */ () => {
      expect(session.view.GetWrtShell().Undo()).toBe(true);
    },
  );
  expect(node.GetText()).toBe(text);
  act(
    /** Replays source redo over the same original owner. @returns Nothing. */ () => {
      expect(session.view.GetWrtShell().Redo()).toBe(true);
    },
  );
  expect(cursor.GetPoint().GetNode()).toBe(node);
});
