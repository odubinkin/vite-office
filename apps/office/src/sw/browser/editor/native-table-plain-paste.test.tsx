/** @fileoverview Checks real mounted plain-text table reading, inherited formatting and native Undo painting. */
import { selectMountedTableRow } from "../../../../test-support/table-mouse-dom";
import { render, cleanup, screen, fireEvent, act, within } from "@testing-library/react";
import { it, expect, afterEach } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import {
  SwFormatAutoFormat,
  createWriterCharacterItemSet,
} from "../../source/core/txtnode/txatbase";
import { SetAttrMode } from "../../inc/swtypes";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Coordinates native ASCII insertion and retained history. @returns Operation result. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Requires a native owner. @param value - Owner. @returns Defined owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing mounted ASCII owner");
  return value;
}
it.each(["X", "A\nB\n", "A\r\n\r\nB"])(
  "mounted plain clipboard %j reads all selected cells through native document undo",
  /** Coordinates native ASCII insertion and retained history. @param text - Native operation input. @returns Operation result. */ (
    text,
  ) => {
    const session = createWriterDocumentSession();
    sessions.push(session);
    const doc = session.docShell.GetDoc(),
      table = doc.nodes.MakeTableNode("Grid");
    table.AddColumnWidth(3000);
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 2),
      other = doc.nodes.AppendTableRow(table, 2),
      firstBox = required(row.GetTabBoxes()[0]),
      secondBox = required(row.GetTabBoxes()[1]),
      first = required(firstBox.GetParagraphs()[0]),
      second = required(secondBox.GetParagraphs()[0]),
      keep = required(required(other.GetTabBoxes()[0]).GetParagraphs()[0]);
    first.SetText("First");
    second.SetText("Second");
    keep.SetText("Keep");
    const tail = doc.nodes.AppendTableCellParagraph(firstBox);
    tail.SetText("Tail");
    for (const node of [tail, second])
      node.InsertItem(
        new SwFormatAutoFormat(
          createWriterCharacterItemSet(doc.GetAttrPool(), {
            bold: true,
            italic: false,
            underline: false,
          }),
        ),
        0,
        node.Len(),
        SetAttrMode.NOHINTADJUST,
      );
    render(<WriterWorkbench isActive view={session.view} />);
    selectMountedTableRow("Grid", 1);
    const element = screen.getByRole("table", { name: "Grid" }),
      target = within(element).getByLabelText("Row 1 column 1 paragraph 1");
    expect(
      fireEvent.paste(target, {
        clipboardData: {
          getData:
            /** Coordinates native ASCII insertion and retained history. @param type - Native operation input. @returns Operation result. */ (
              type: string,
            ) => (type === "text/plain" ? text : ""),
        },
      }),
    ).toBe(false);
    const extra = text === "X" ? ["X"] : text.includes("\r") ? ["A", "", "B"] : ["A", "B"];
    expect(
      firstBox
        .GetParagraphs()
        .map(
          /** Coordinates native ASCII insertion and retained history. @param n - Native operation input. @returns Operation result. */ (
            n,
          ) => n.GetText(),
        ),
    ).toEqual(["First", "Tail" + extra[0], ...extra.slice(1)]);
    expect(
      secondBox
        .GetParagraphs()
        .map(
          /** Coordinates native ASCII insertion and retained history. @param n - Native operation input. @returns Operation result. */ (
            n,
          ) => n.GetText(),
        ),
    ).toEqual(["Second" + extra[0], ...extra.slice(1)]);
    expect(keep.GetText()).toBe("Keep");
    expect(tail.GetTextRangeFormatState(4, 5, "bold")).toBe("on");
    expect(element.querySelectorAll('[data-writer-editor-selected="true"]')).toHaveLength(2);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    act(
      /** Coordinates native ASCII insertion and retained history. @returns Operation result. */ () => {
        expect(session.view.GetWrtShell().Undo()).toBe(true);
      },
    );
    expect(
      firstBox
        .GetParagraphs()
        .map(
          /** Coordinates native ASCII insertion and retained history. @param n - Native operation input. @returns Operation result. */ (
            n,
          ) => n.GetText(),
        ),
    ).toEqual(["First", "Tail"]);
    expect(second.GetText()).toBe("Second");
    expect(element.querySelectorAll('[data-writer-editor-selected="true"]')).toHaveLength(2);
    act(
      /** Coordinates native ASCII insertion and retained history. @returns Operation result. */ () => {
        expect(session.view.GetWrtShell().Redo()).toBe(true);
      },
    );
    expect(
      firstBox
        .GetParagraphs()
        .map(
          /** Coordinates native ASCII insertion and retained history. @param n - Native operation input. @returns Operation result. */ (
            n,
          ) => n.GetText(),
        ),
    ).toEqual(["First", "Tail" + extra[0], ...extra.slice(1)]);
    expect(element.querySelectorAll('[data-writer-editor-selected="true"]')).toHaveLength(2);
  },
);
