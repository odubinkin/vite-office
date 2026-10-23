/** @fileoverview Verifies natural row device projection reads original native owners without formatting during paint. */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterViewStore } from "../presentation/writer-view-projection";
import { WriterEditableTable } from "./WriterEditableTable";
import { SwTabFrame, SwRowFrame } from "../../source/core/layout/tabfrm";
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
afterEach(cleanup);
it.each([SwFrameSize.Fixed, SwFrameSize.Minimum])(
  "measures natural content independently of authored size type=%i",
  /** Checks device presentation and paint ownership without synthetic model copies. @param type - Native size mode. @returns Nothing. */ (
    type,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      table = doc.nodes.MakeTableNode("Measure", { width: 6000 });
    table.AddColumnWidth(6000);
    doc.nodes.AppendTableRow(table, 1, { frameSize: new SwFormatFrameSize(type, 0, 600) });
    const store = new WriterViewStore(session.view),
      frame = new SwTabFrame(table),
      row = frame.Lower() as SwRowFrame | undefined;
    if (!row) throw new Error("Missing native measurement row");
    row.Format(1400);
    const before = row.getFrameArea().Height(),
      format = vi.spyOn(row, "Format"),
      paragraphs = new Map(
        store
          .GetSnapshot()
          .textNodes.map(
            /** Retains original projected node coordinates. @param paragraph - Actual view value. @returns Entry. */ (
              paragraph,
            ) => [paragraph.nodeIndex, paragraph],
          ),
      );
    try {
      const mounted = render(
        <WriterEditableTable table={table} nativeFrame={frame} paragraphs={paragraphs} />,
      );
      expect(screen.getByRole("row")).toHaveStyle({ height: "40px" });
      expect(format).not.toHaveBeenCalled();
      expect(row.getFrameArea().Height()).toBe(before);
      mounted.rerender(
        <WriterEditableTable
          table={table}
          nativeFrame={frame}
          paragraphs={paragraphs}
          measureNaturalRows
        />,
      );
      expect(screen.getByRole("row").style.height).toBe("");
      expect(document.querySelector('[data-writer-fixed-row-content="true"]')).toBeNull();
      expect(format).not.toHaveBeenCalled();
      expect(row.getFrameArea().Height()).toBe(before);
    } finally {
      cleanup();
      format.mockRestore();
      frame.DestroyImpl();
      store.Close();
      session.Close();
    }
  },
);
