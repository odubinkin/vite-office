/** @fileoverview Verifies native format allocation preserves actual Writer document lifecycle and mounted UI state. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwFrameFormat } from "../../source/core/layout/atrfrm";
import { SwRowFrame, SwCellFrame } from "../../source/core/layout/tabfrm";
import { SwFormatVertOrient } from "../../inc/fmtornt";
/** Requires an original model or element. @param value - Optional owner. @returns Original owner. */
function required<T>(value: T | undefined | null): T {
  if (value === undefined || value === null)
    throw Error("Missing original format construction owner");
  return value;
}
it.each([false, true])(
  "native format creation preserves actual shell modification and history state modified=%s",
  /** Checks the clean and already-modified native shell lifecycle independently. @param modified - Initial shell state. @returns Nothing. */ (
    modified,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc();
    if (modified) session.view.GetWrtShell().Insert("Authored");
    const before = session.docShell.GetDocumentState(),
      revision = doc.GetDocumentStateManager().GetModelRevision(),
      undos = doc.GetUndoManager().GetUndoActionCount();
    const format = new SwFrameFormat(
      doc.GetAttrPool(),
      "Root candidate",
      undefined,
      doc.GetDfltFrameFormat(),
    );
    try {
      expect(before.isModified).toBe(modified);
      expect(session.docShell.GetDocumentState()).toEqual(before);
      expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(undos);
      expect(format.GetDoc()).toBe(doc);
      expect(format.GetAttrSet().GetParent()).toBe(doc.GetDfltFrameFormat().GetAttrSet());
    } finally {
      format.DisposeModify();
      session.Close();
    }
  },
);
it("mounted Writer retains original text and lifecycle while constructed formats still feed native frame invalidation", /** Checks the actual view and native attribute channel after silent initial linking. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc();
  session.view.GetWrtShell().Insert("Original text");
  const table = doc.nodes.MakeTableNode("Original", { width: 3000 }, doc.paragraphs[0]);
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 1),
    box = required(row.GetTabBoxes()[0]),
    node = required(box.GetParagraphs()[0]);
  node.SetText("Original cell");
  const rowFrame = new SwRowFrame(row),
    cellFrame = required(rowFrame.Lower()) as SwCellFrame;
  let parent: SwFrameFormat | undefined;
  try {
    render(<WriterWorkbench isActive view={session.view} />);
    const body = screen.getByRole("textbox", { name: "Writer document text" }),
      cell = screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" }),
      before = session.docShell.GetDocumentState(),
      revision = doc.GetDocumentStateManager().GetModelRevision();
    act(
      /** Allocates a native format with original default inheritance. @returns Nothing. */ () => {
        parent = new SwFrameFormat(
          doc.GetAttrPool(),
          "Native parent",
          undefined,
          doc.GetDfltFrameFormat(),
        );
      },
    );
    expect(session.docShell.GetDocumentState()).toEqual(before);
    expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
    expect(body).toHaveTextContent("Original text");
    expect(cell).toHaveTextContent("Original cell");
    expect(box.GetParagraphs()[0]).toBe(node);
    expect(rowFrame.Lower()).toBe(cellFrame);
    cellFrame.ResetCompletePaint();
    cellFrame.setFramePrintAreaValid(true);
    act(
      /** Mutates the original native cell attribute after construction. @returns Nothing. */ () => {
        box.GetFrameFormat().SetFormatAttr(new SwFormatVertOrient(720, 2, 7));
      },
    );
    expect(cellFrame.IsCompletePaint()).toBe(true);
    expect(cellFrame.isFramePrintAreaValid()).toBe(false);
    expect(required(cell.closest("td"))).toHaveStyle({ verticalAlign: "middle" });
    expect(box.GetParagraphs()[0]).toBe(node);
    expect(rowFrame.Lower()).toBe(cellFrame);
    expect(session.docShell.GetDocumentState()).toEqual(before);
  } finally {
    cleanup();
    rowFrame.DestroyImpl();
    parent?.DisposeModify();
    session.Close();
  }
});
