/** @fileoverview Checks that XML-imported original table owners participate in mounted native attribute history. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { SwXMLTableImport } from "../../source/filter/xml/xmltbli";
import { SvxULSpaceItem } from "../../../editeng/source/items/frmitems";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { RES_UL_SPACE } from "../../inc/hintids";
import { readOdtDocument } from "../../source/filter/xml/swxml";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
/** Requires an original imported owner. @param value - Candidate. @returns Connected owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing mounted imported owner");
  return value;
}
it("imported header and table spacing retain original owners through mounted UndoRedo and ODT", /** Checks real import callbacks, native rendering and original history. @returns Completion. */ async () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    importer = new SwXMLTableImport(doc);
  try {
    importer.registerTableStyle("table", {
      family: "table",
      width: 3000,
      marginTop: 120,
      marginBottom: 240,
    });
    importer.registerTableStyle("column", { family: "table-column", columnWidth: 3000 });
    importer.beginTable("MountedImport", "table");
    importer.addTableColumn("column");
    importer.beginTableHeaderRows();
    importer.beginTableRow("");
    importer.beginTableCell("");
    importer.endTableCell();
    importer.endTableRow();
    importer.endTableHeaderRows();
    importer.endTable();
    const table = required(doc.GetTables()[0]),
      row = required(table.GetTabLines()[0]),
      box = required(row.GetTabBoxes()[0]),
      node = required(box.GetParagraphs()[0]),
      frame = table.GetFrameFormat();
    node.SetText("Original imported header");
    shell.FocusNode(node);
    const cursor = shell.CaptureCursorState();
    doc.GetUndoManager().Clear();
    render(<WriterWorkbench isActive view={session.view} />);
    const input = new SfxItemSet(doc.GetAttrPool(), [[RES_UL_SPACE, RES_UL_SPACE]]);
    input.Put(new SvxULSpaceItem(300, 450, RES_UL_SPACE));
    act(
      /** Changes the original imported spacing. @returns Nothing. */ () => {
        expect(shell.SetTableAttr(input)).toBe(true);
      },
    );
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(screen.getByRole("table", { name: "MountedImport" })).toHaveStyle({
        marginTop: "20px",
        marginBottom: "30px",
      });
      expect(screen.getByRole("columnheader")).toHaveTextContent("Original imported header");
      act(
        /** Restores imported native items. @returns Nothing. */ () => {
          expect(shell.Undo()).toBe(true);
        },
      );
      expect(frame.GetULSpace().GetUpper()).toBe(120);
      expect(frame.GetULSpace().GetLower()).toBe(240);
      expect(screen.getByRole("table", { name: "MountedImport" })).toHaveStyle({
        marginTop: "8px",
        marginBottom: "16px",
      });
      act(
        /** Replays the native mutation. @returns Nothing. */ () => {
          expect(shell.Redo()).toBe(true);
        },
      );
      expect(table.GetTabLines()[0]).toBe(row);
      expect(row.GetTabBoxes()[0]).toBe(box);
      expect(box.GetParagraphs()[0]).toBe(node);
      expect(table.GetRowsToRepeat()).toBe(1);
      expect(shell.CaptureCursorState()).toEqual(cursor);
    }
    const reopened = (
      await readOdtDocument(writeOdtDocument(doc, { title: "Mounted" }), { title: "Mounted" })
    ).document;
    try {
      const t = required(reopened.GetTables()[0]);
      expect(t.GetRowsToRepeat()).toBe(1);
      expect(t.GetFrameFormat().GetULSpace().GetUpper()).toBe(300);
      expect(
        required(
          required(required(t.GetTabLines()[0]).GetTabBoxes()[0]).GetParagraphs()[0],
        ).GetText(),
      ).toBe("Original imported header");
    } finally {
      reopened.Dispose();
    }
  } finally {
    cleanup();
    session.Close();
  }
});
