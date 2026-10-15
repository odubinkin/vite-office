/** @fileoverview Verifies real React Home/End borrows the native body formatter graph and refreshes its paragraph cache without duplicate clients. */
import { SwClient, SwIterator } from "../../inc/calbck";

import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwTextFrame } from "../../source/core/text/txtfrm";
import type { SwTextNode } from "../../source/core/txtnode/ndtxt";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
const previousRects = Object.getOwnPropertyDescriptor(Range.prototype, "getClientRects");
/** Borrows actual native registrations behind the mounted editor. @param node - Original content owner. @returns Original clients. */
function clients(node: SwTextNode): SwTextFrame[] {
  const result: SwTextFrame[] = [];
  for (const client of new SwIterator(SwClient, node)) {
    if (client instanceof SwTextFrame) result.push(client);
    continue;
  }
  return result;
}
afterEach(
  /** Restores the explicit test device and native session ownership. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
    if (previousRects === undefined) delete (Range.prototype as Partial<Range>).getClientRects;
    else Object.defineProperty(Range.prototype, "getClientRects", previousRects);
  },
);
it("mounted repeated Home/End keeps one original formatter frame and native history", /** Checks actual ownership behind native key handling with a deterministic two-line device. @returns Completion. */ async () => {
  Object.defineProperty(Range.prototype, "getClientRects", {
    configurable: true,
    value:
      /** Supplies two literal shaped line rectangles. @param this - Actual Range receiver. @returns Device rectangles. */ function (
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
  );
  await waitFor(
    /** Waits for actual device formatting before checking retained clients. @returns Nothing. */ () => {
      expect(clients(node)).toHaveLength(1);
      expect(clients(node)[0]?.GetPara()?.GetNext()).toBeDefined();
    },
  );
  const original = clients(node)[0],
    root = session.view.GetLayout(),
    oldPara = original?.GetPara(),
    id = original?.GetFrameId(),
    element = mounted.container.querySelector<HTMLParagraphElement>(
      "[data-writer-page] p[data-writer-node-index]",
    );
  if (original === undefined || element?.firstChild === null || element === null)
    throw Error("Missing original body frame");
  window.getSelection()?.setBaseAndExtent(element.firstChild, 1, element.firstChild, 1);
  expect(fireEvent.keyDown(element, { key: "End" })).toBe(false);
  expect(root.GetCursorTextFrame(node)).toBe(original);
  expect(node.getLayoutFrame(root)).toBe(original);
  expect(original.GetPara()).not.toBe(oldPara);
  expect(session.view.GetWrtShell().getShellCursor().GetPoint().GetContentIndex()).toBe(3);
  expect(fireEvent.keyDown(element, { key: "Home" })).toBe(false);
  expect(session.view.GetWrtShell().getShellCursor().GetPoint().GetContentIndex()).toBe(0);
  expect(fireEvent.keyDown(element, { key: "End", shiftKey: true })).toBe(false);
  expect(clients(node)).toEqual([original]);
  expect(original.GetFrameId()).toBe(id);
  expect(original.IsInDtor()).toBe(false);
  expect(fireEvent.keyDown(element, { key: "Home" })).toBe(false);
  act(
    /** Inserts through the original native cursor. @returns Nothing. */ () => {
      expect(session.view.GetWrtShell().Insert("X")).toBe(true);
    },
  );
  await waitFor(
    /** Checks current rendered source after reformatting. @returns Nothing. */ () =>
      expect(element.textContent).toBe("Xabc   def   "),
  );
  expect(original.IsInDtor()).toBe(true);
  act(
    /** Replays source history. @returns Nothing. */ () => {
      expect(session.view.GetWrtShell().Undo()).toBe(true);
    },
  );
  await waitFor(
    /** Checks native undo rendering. @returns Nothing. */ () =>
      expect(element.textContent).toBe("abc   def   "),
  );
  act(
    /** Replays source redo. @returns Nothing. */ () => {
      expect(session.view.GetWrtShell().Redo()).toBe(true);
    },
  );
  await waitFor(
    /** Checks native redo rendering. @returns Nothing. */ () =>
      expect(element.textContent).toBe("Xabc   def   "),
  );
  mounted.unmount();
  session.Close();
  expect(clients(node)).toEqual([]);
});
