/** @fileoverview Verifies mounted native shell margins use existing formatter clients before the UI has published cursor measurements. */
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwPosition } from "../../source/core/crsr/pam";
import { SwTextFrame } from "../../source/core/text/txtfrm";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
const previousRects = Object.getOwnPropertyDescriptor(Range.prototype, "getClientRects");
afterEach(
  /** Restores actual session and the explicit device geometry fixture. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
    if (previousRects === undefined) delete (Range.prototype as Partial<Range>).getClientRects;
    else Object.defineProperty(Range.prototype, "getClientRects", previousRects);
  },
);
it("mounted shell Home/End uses original formatted clients without UI measurements and retains edit history", /** Checks actual React/native composition before any key publication. @returns Completion. */ async () => {
  Object.defineProperty(Range.prototype, "getClientRects", {
    configurable: true,
    value:
      /** Supplies a literal two-line device. @param this - Actual range. @returns Device rectangles. */ function (
        this: Range,
      ) {
        const top = this.startOffset < 6 ? 0 : 20;
        return [{ top, left: 0, width: 10, height: 16, bottom: top + 16, right: 10 }];
      },
  });
  const session = createWriterDocumentSession();
  sessions.push(session);
  const node = session.docShell.GetDoc().paragraphs[0];
  if (node === undefined) throw Error("Missing body");
  node.SetText("abc   def   ");
  const mounted = render(
      <WriterWorkbench
        isActive
        view={session.view}
        fileDialogs={session.fileDialogs}
        services={session.services}
      />,
    ),
    root = session.view.GetLayout(),
    shell = session.view.GetWrtShell();
  await waitFor(
    /** Waits for actual native device formatting. @returns Nothing. */ () =>
      expect(
        (node.getLayoutFrame(root) as SwTextFrame | undefined)?.GetPara()?.GetNext(),
      ).toBeDefined(),
  );
  const original = node.getLayoutFrame(root),
    point = new SwPosition(node, 1);
  act(
    /** Assigns actual native selection. @returns Nothing. */ () => {
      shell.SetPaM(point);
    },
  );
  point.Dispose();
  expect(root.GetCursorTextFrame(node)).toBeUndefined();
  act(
    /** Moves through the original native registered query. @returns Nothing. */ () => {
      expect(shell.LRMargin(false)).toBe(true);
    },
  );
  expect(shell.getShellCursor().GetPoint().GetContentIndex()).toBe(3);
  expect(root.GetCursorTextFrame(node)).toBeUndefined();
  expect(node.getLayoutFrame(root)).toBe(original);
  act(
    /** Moves and edits through native shell owners. @returns Nothing. */ () => {
      expect(shell.LRMargin(true)).toBe(true);
      expect(shell.Insert("X")).toBe(true);
    },
  );
  const element = mounted.container.querySelector("[data-writer-page] p[data-writer-node-index]");
  await waitFor(
    /** Checks actual rendered insertion. @returns Nothing. */ () =>
      expect(element?.textContent).toBe("Xabc   def   "),
  );
  act(
    /** Replays native undo. @returns Nothing. */ () => {
      expect(shell.Undo()).toBe(true);
    },
  );
  await waitFor(
    /** Checks actual undo rendering. @returns Nothing. */ () =>
      expect(element?.textContent).toBe("abc   def   "),
  );
  act(
    /** Replays native redo. @returns Nothing. */ () => {
      expect(shell.Redo()).toBe(true);
    },
  );
  await waitFor(
    /** Checks actual redo rendering. @returns Nothing. */ () =>
      expect(element?.textContent).toBe("Xabc   def   "),
  );
  expect(session.docShell.GetDoc().paragraphs[0]).toBe(node);
});
