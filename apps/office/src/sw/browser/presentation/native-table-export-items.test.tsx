/** @fileoverview Checks mounted native spacing history, actual XML and ordinary ODT reopening of the same original table. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { SvxULSpaceItem } from "../../../editeng/source/items/frmitems";
import { exportContentXml } from "../../source/filter/xml/xmlexp";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { readOdtDocument } from "../../source/filter/xml/swxml";
/** Requires a concrete original owner or parsed XML field. @param value - Candidate. @returns Present value. */
function required<T>(value: T | undefined | null): T {
  if (value === undefined || value === null) throw Error("Missing native export owner");
  return value;
}

it("mounted direct items paint, export and reopen across native Undo and Redo", /** Checks original owners, cursor, authored text and current direct-item serialization. @returns Completion. */ async () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const table = doc.nodes.MakeTableNode(
      "ExportHistory",
      { width: 6000 },
      required(doc.paragraphs[0]),
    );
    table.AddColumnWidth(6000);
    const row = doc.nodes.AppendTableRow(table, 1),
      box = required(row.GetTabBoxes()[0]),
      node = required(box.GetParagraphs()[0]),
      format = table.GetFrameFormat();
    node.SetText("Original export history");
    shell.FocusNode(node);
    shell.SetParagraphListKind("bullet");
    const cursor = shell.CaptureCursorState(),
      list = node.GetListId();
    doc.GetUndoManager().Clear();
    render(<WriterWorkbench isActive view={session.view} />);
    const input = new SfxItemSet(doc.GetAttrPool(), [[99, 99]]);
    input.Put(new SvxULSpaceItem(120, 240, 99));
    act(
      /** Applies original table items. @returns Nothing. */ () => {
        expect(shell.SetTableAttr(input)).toBe(true);
      },
    );
    for (let cycle = 0; cycle < 2; cycle++) {
      expect(screen.getByRole("table", { name: "ExportHistory" })).toHaveStyle({
        marginTop: "8px",
        marginBottom: "16px",
      });
      const projection = vi.spyOn(table, "GetFormat");
      try {
        expect(exportContentXml(doc)).toContain('fo:margin-top="0.2117cm"');
        const reopened = required(
          (
            await readOdtDocument(writeOdtDocument(doc, { title: "History" }), { title: "History" })
          ).document.GetTables()[0],
        );
        expect(reopened.GetFrameFormat().GetULSpace().GetUpper()).toBe(120);
        expect(
          required(
            required(required(reopened.GetTabLines()[0]).GetTabBoxes()[0]).GetParagraphs()[0],
          ).GetText(),
        ).toBe("Original export history");
        expect(projection).not.toHaveBeenCalled();
      } finally {
        projection.mockRestore();
      }
      act(
        /** Restores absent original item. @returns Nothing. */ () => {
          expect(shell.Undo()).toBe(true);
        },
      );
      expect(format.GetAttrSet().GetItemIfSet(99, false)).toBeUndefined();
      const tableAttrs = required(
        required(exportContentXml(doc).match(/<style:table-properties([^>]*)\/>/))[1],
      );
      expect(tableAttrs).not.toContain("fo:margin-top");
      expect(screen.getByRole("table", { name: "ExportHistory" })).toHaveStyle({
        marginTop: "0px",
        marginBottom: "0px",
      });
      act(
        /** Replays original direct item. @returns Nothing. */ () => {
          expect(shell.Redo()).toBe(true);
        },
      );
      expect(table.GetFrameFormat()).toBe(format);
      expect(table.GetTabLines()[0]).toBe(row);
      expect(row.GetTabBoxes()[0]).toBe(box);
      expect(box.GetParagraphs()[0]).toBe(node);
      expect(node.GetListId()).toBe(list);
      expect(shell.CaptureCursorState()).toEqual(cursor);
    }
  } finally {
    cleanup();
    vi.restoreAllMocks();
    session.Close();
  }
});
