/** @fileoverview Verifies mixed-unit browser edits reach real Writer document fields and ODT bytes. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { WriterPageStyleDialog } from "./WriterPageStyleDialog";
import { WriterLineNumberingDialog } from "./WriterLineNumberingDialog";
import { WriterRowHeightDialog } from "./WriterRowHeightDialog";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { SwLineNumberInfo } from "../../inc/lineinfo";
import { SwTableHeightDlg } from "../../source/ui/table/rowht";
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
import { createWriterDocumentSession } from "../composition/writer-module";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { readOdtDocument } from "../../source/filter/xml/swxml";
afterEach(cleanup);
it("keeps page and numbering physical lengths through explicit inch/mm input and ODT reopen", /** Checks actual document fields and serialized bytes. @returns Completion. */ async () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    metadata = { title: "Mixed units" };
  try {
    render(
      <WriterPageStyleDialog
        initialValue={doc.GetPageDesc().GetValue()}
        unit={FieldUnit.INCH}
        onCancel={vi.fn()}
        onSubmit={
          /** Accepts real page geometry. @param page - Accepted physical values. @returns Nothing. */ (
            page,
          ) => doc.ChgPageDesc(page)
        }
      />,
    );
    const width = doc.GetPageDesc().GetValue().width;
    fireEvent.blur(screen.getByLabelText("Width (in)"));
    fireEvent.change(screen.getByLabelText("Left (in)"), { target: { value: "1 in" } });
    fireEvent.change(screen.getByLabelText("Right (in)"), { target: { value: "25.4 mm" } });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    cleanup();
    expect(doc.GetPageDesc().GetValue()).toMatchObject({
      width,
      leftMargin: 1440,
      rightMargin: 1440,
    });
    render(
      <WriterLineNumberingDialog
        value={doc.GetLineNumberInfo().QueryValue()}
        unit={FieldUnit.INCH}
        onCancel={vi.fn()}
        onSubmit={
          /** Accepts real line numbering fields. @param value - Physical draft. @returns Nothing. */ (
            value,
          ) => doc.SetLineNumberInfo(SwLineNumberInfo.FromValue(value))
        }
      />,
    );
    fireEvent.change(screen.getByLabelText("Spacing (in)"), { target: { value: "36 pt" } });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(doc.GetLineNumberInfo().QueryValue().posFromLeft).toBe(720);
    const reopened = await readOdtDocument(writeOdtDocument(doc, metadata), metadata);
    try {
      expect(reopened.document.GetPageDesc().GetValue()).toMatchObject({
        width,
        leftMargin: 1440,
        rightMargin: 1440,
      });
      expect(reopened.document.GetLineNumberInfo().QueryValue().posFromLeft).toBe(720);
    } finally {
      reopened.document.Dispose();
    }
  } finally {
    session.Close();
  }
});
it("applies inch row heights through native shell history and ODT without a display-roundtrip edit", /** Checks original Apply,Undo/Redo and actual byte reopen. @returns Completion. */ async () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    table = doc.nodes.MakeTableNode("MetricRow", { width: 3000 });
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 1, {
      frameSize: new SwFormatFrameSize(SwFrameSize.Fixed, 0, 601),
    }),
    node = row.GetTabBoxes()[0]?.GetParagraphs()[0];
  if (node === undefined) throw Error("Missing row node");
  shell.FocusNode(node);
  try {
    const draft = new SwTableHeightDlg(shell);
    render(
      <WriterRowHeightDialog
        draft={draft}
        unit={FieldUnit.INCH}
        onCancel={vi.fn()}
        onSubmit={
          /** Applies the actual row owner. @returns Nothing. */ () => {
            draft.Apply();
          }
        }
      />,
    );
    fireEvent.blur(screen.getByLabelText("Height (in)"));
    expect(draft.height).toBe(601);
    fireEvent.change(screen.getByLabelText("Height (in)"), { target: { value: "0.5 in" } });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(row.GetFrameSize().GetHeight()).toBe(720);
    expect(shell.Undo()).toBe(true);
    expect(row.GetFrameSize().GetHeight()).toBe(601);
    expect(shell.Redo()).toBe(true);
    expect(row.GetFrameSize().GetHeight()).toBe(720);
    const metadata = { title: "Metric row" },
      reopened = await readOdtDocument(writeOdtDocument(doc, metadata), metadata);
    try {
      expect(reopened.document.GetTables()[0]?.GetTabLines()[0]?.GetFrameSize().GetHeight()).toBe(
        720,
      );
    } finally {
      reopened.document.Dispose();
    }
  } finally {
    session.Close();
  }
});
