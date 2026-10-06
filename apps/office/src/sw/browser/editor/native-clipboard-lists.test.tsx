/** @fileoverview Checks native body/cell list clipboard ranges and subsequent editing through mounted Writer UI. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { applyWriterParagraphList } from "../../source/core/doc/list";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases mounted documents. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Requires actual native ownership. @param value - Owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing clipboard list owner");
  return value;
}
/** Finds an actual rendered text portion. @param element - Paragraph editor. @returns Text node. */
function text(element: HTMLElement): Node {
  const node = document.createTreeWalker(element, NodeFilter.SHOW_TEXT).nextNode();
  if (node === null) throw new Error("Missing text portion");
  return node;
}
/** Copies through mounted event ownership. @param target - Editor. @returns Actual MIME strings. */
function copy(target: HTMLElement): Map<string, string> {
  const result = new Map<string, string>();
  fireEvent.copy(target, {
    clipboardData: {
      /** Stores actual transfer. @param type - MIME type. @param value - Native output. @returns Nothing. */ setData(
        type: string,
        value: string,
      ): void {
        result.set(type, value);
      },
    },
  });
  return result;
}
for (const cell of [false, true])
  for (const reverse of [false, true])
    for (const kind of ["numbered", "bullet"] as const)
      it(`copies native list ranges cell=${cell} reverse=${reverse} kind=${kind} and retains editing history`, /** Checks literal outputs and real owners. @returns Nothing. */ () => {
        const session = createWriterDocumentSession();
        sessions.push(session);
        const doc = session.docShell.GetDoc(),
          shell = session.view.GetWrtShell(),
          body = required(doc.paragraphs[0]);
        body.SetText(cell ? "Before" : "Alpha");
        let first = body,
          second;
        if (cell) {
          const table = doc.nodes.MakeTableNode("ClipboardLists", {}, body);
          table.AddColumnWidth(3000);
          table.AddColumnWidth(3000);
          const row = doc.nodes.AppendTableRow(table, 2),
            box = required(row.GetTabBoxes()[0]);
          first = required(box.GetParagraphs()[0]);
          first.SetText("Alpha");
          second = doc.nodes.AppendTableCellParagraph(box);
          second.SetText("Omega");
          required(required(row.GetTabBoxes()[1]).GetParagraphs()[0]).SetText("Neighbor");
        } else second = doc.nodes.MakeTextNode("Omega");
        applyWriterParagraphList(first, {
          kind,
          level: 0,
          styleId: "ClipboardList",
          listId: "copied",
        });
        shell.FocusNode(first);
        doc.GetUndoManager().Clear();
        render(
          <WriterWorkbench
            isActive
            view={session.view}
            fileDialogs={session.fileDialogs}
            services={session.services}
          />,
        );
        const firstEditor = screen.getByRole("textbox", {
            name: cell ? "Row 1 column 1 paragraph 1" : "Writer document text",
          }),
          secondEditor = screen.getByRole("textbox", {
            name: cell ? "Row 1 column 1 paragraph 2" : "Writer paragraph 2",
          });
        const rule = first.GetNumRule(),
          record = first.GetNum(),
          nodes = doc.nodes.entries().slice();
        /** Captures a real DOM selection using native edit-window synchronization. @param start - First offset. @param end - Second offset. @returns Nothing. */
        function select(start: number, end: number): void {
          window
            .getSelection()
            ?.setBaseAndExtent(
              reverse ? text(secondEditor) : text(firstEditor),
              reverse ? end : start,
              reverse ? text(firstEditor) : text(secondEditor),
              reverse ? start : end,
            );
          fireEvent(document, new Event("selectionchange"));
        }
        select(0, 2);
        const cursor = shell.GetCursor(),
          point = cursor.GetPoint().GetNode(),
          pointOffset = cursor.GetPoint().GetContentIndex(),
          mark = cursor.GetMark().GetNode(),
          markOffset = cursor.GetMark().GetContentIndex();
        const partial = copy(secondEditor);
        expect(partial.get("text/plain")).toBe(
          kind === "numbered" ? "    1. Alpha\nOm" : "    • Alpha\nOm",
        );
        expect(partial.get("text/html")).toContain(kind === "numbered" ? "<ol" : "<ul");
        expect(partial.get("text/html")).toContain("Alpha");
        expect([
          cursor.GetPoint().GetNode(),
          cursor.GetPoint().GetContentIndex(),
          cursor.GetMark().GetNode(),
          cursor.GetMark().GetContentIndex(),
        ]).toEqual([point, pointOffset, mark, markOffset]);
        expect(doc.nodes.entries()).toEqual(nodes);
        expect(first.GetNumRule()).toBe(rule);
        expect(first.GetNum()).toBe(record);
        expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
        select(1, 2);
        expect(copy(secondEditor).get("text/plain")).toBe("lpha\nOm");
        window.getSelection()?.setBaseAndExtent(text(firstEditor), 0, text(firstEditor), 5);
        fireEvent(document, new Event("selectionchange"));
        expect(copy(firstEditor).get("text/plain")).toBe("Alpha");
        select(0, 5);
        act(
          /** Replaces through the native shell. @returns Nothing. */ () => {
            expect(shell.Insert("Replacement")).toBe(true);
          },
        );
        expect(first.GetText()).toBe("Replacement");
        act(
          /** Restores the native range. @returns Nothing. */ () => {
            shell.Undo();
          },
        );
        expect(first.GetText()).toBe("Alpha");
        expect(second.GetText()).toBe("Omega");
        expect(first.GetNumRule()).toBe(rule);
        act(
          /** Replays native replacement. @returns Nothing. */ () => {
            shell.Redo();
          },
        );
        expect(first.GetText()).toBe("Replacement");
        if (cell) {
          expect(body.GetText()).toBe("Before");
          expect(
            screen.getByRole("textbox", { name: "Row 1 column 2 paragraph 1" }),
          ).toHaveTextContent("Neighbor");
        }
      });
