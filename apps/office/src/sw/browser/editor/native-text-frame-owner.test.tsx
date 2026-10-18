/** @fileoverview Checks real React/native text-frame ownership across editing, invalidation and session close. */
import { SwClient, SwIterator } from "../../inc/calbck";

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwTextFrame } from "../../source/core/text/txtfrm";
import { SvxULSpaceItem } from "../../../editeng/source/items/frmitems";
import { RES_UL_SPACE } from "../../inc/hintids";
import type { SwTextNode } from "../../source/core/txtnode/ndtxt";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
/** Reads actual native frame listeners. @param node - Original text owner. @returns Registered frames. */
function frames(node: SwTextNode): SwTextFrame[] {
  const result: SwTextFrame[] = [];
  for (const listener of new SwIterator(SwClient, node)) {
    if (listener instanceof SwTextFrame) result.push(listener);
    continue;
  }
  return result;
}
afterEach(
  /** Releases React before actual session ownership. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
it.each([false, true])(
  "React keeps native body/cell ownership through edits and releases it on close cell=%s",
  /** Checks native live registration behind actual mounted DOM Home/End and history. @param cell - Native cell context. @returns Nothing. */ (
    cell,
  ) => {
    const session = createWriterDocumentSession();
    sessions.push(session);
    const doc = session.docShell.GetDoc(),
      body = doc.paragraphs[0],
      table = doc.nodes.MakeTableNode("Owner");
    table.AddColumnWidth(6000);
    const node = cell
      ? doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0]
      : body;
    if (node === undefined) throw Error("Missing native owner");
    node.SetText("abcdef");
    const rendered = render(
      <WriterWorkbench
        isActive
        view={session.view}
        fileDialogs={session.fileDialogs}
        services={session.services}
      />,
    );
    const element = cell
      ? screen.getByLabelText("Row 1 column 1 paragraph 1")
      : screen
          .getAllByRole("textbox")
          .find(
            /** Finds original body text. @param input - Actual mounted input. @returns Whether target. */ (
              input,
            ) => input.textContent === "abcdef",
          );
    if (element === undefined || element.firstChild === null)
      throw Error("Missing actual text host");
    window.getSelection()?.setBaseAndExtent(element.firstChild, 2, element.firstChild, 2);
    expect(fireEvent.keyDown(element, { key: "End" })).toBe(false);
    const cursorFrame = session.view.GetLayout().GetCursorTextFrame(node);
    expect(cursorFrame?.GetTextNodeFirst()).toBe(node);
    expect(cursorFrame?.GetRegisteredIn()).toBe(node);
    expect(frames(node)).toContain(cursorFrame);
    if (cursorFrame === undefined) throw Error("Missing measured native frame");
    cursorFrame.setFrameAreaSizeValid(true);
    cursorFrame.setFramePrintAreaValid(true);
    act(
      /** Applies native pooled format and publishes actual React state. @returns Nothing. */ () => {
        node.SetAttr(new SvxULSpaceItem(120, 240, RES_UL_SPACE));
      },
    );
    expect(cursorFrame.isFrameAreaSizeValid()).toBe(false);
    expect(cursorFrame.isFramePrintAreaValid()).toBe(false);
    expect(fireEvent.keyDown(element, { key: "Home" })).toBe(false);
    expect(cursorFrame.IsInDtor()).toBe(true);
    const shell = session.view.GetWrtShell();
    act(
      /** Inserts through the actual native cursor. @returns Nothing. */ () => {
        expect(shell.Insert("X")).toBe(true);
      },
    );
    expect(node.GetText()).toBe("Xabcdef");
    expect(element).toHaveTextContent("Xabcdef");
    act(
      /** Replays original native history. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    expect(node.GetText()).toBe("abcdef");
    act(
      /** Replays native redo through mounted UI. @returns Nothing. */ () => {
        expect(shell.Redo()).toBe(true);
      },
    );
    expect(element).toHaveTextContent("Xabcdef");
    rendered.unmount();
    session.Close();
    expect(frames(node)).toEqual([]);
  },
);
