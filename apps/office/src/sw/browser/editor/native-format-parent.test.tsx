/** @fileoverview Verifies mounted native table inheritance returns to the existing root and rejects cycles without a UI translation layer. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwFormatVertOrient } from "../../inc/fmtornt";

it("original cell parent reset refreshes inherited root alignment and rejected cycles leave mounted content unchanged", /** Checks actual native UI subscriptions and original node identity. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc();
  try {
    const root = doc.GetDfltFrameFormat(),
      parent = doc.MakeTableBoxFormat(),
      table = doc.nodes.MakeTableNode("Parent rendering", { width: 3000 }, doc.paragraphs[0]);
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 1),
      box = row.GetTabBoxes()[0],
      node = box?.GetParagraphs()[0];
    if (!box || !node) throw Error("Missing mounted original format owners");
    node.SetText("Original inherited cell");
    root.SetFormatAttr(new SwFormatVertOrient(480, 3, 7));
    parent.SetFormatAttr(new SwFormatVertOrient(720, 2, 7));
    const format = box.GetFrameFormat(),
      set = format.GetAttrSet();
    format.SetDerivedFrom(parent);
    render(<WriterWorkbench isActive view={session.view} />);
    const editor = screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" }),
      cell = editor.closest("td");
    expect(cell).toHaveStyle({ verticalAlign: "middle" });
    const revision = doc.GetDocumentStateManager().GetModelRevision();
    act(
      /** Attempts a native transitive cycle while the main UI is mounted. @returns Nothing. */ () => {
        expect(parent.SetDerivedFrom(format)).toBe(false);
        expect(format.SetDerivedFrom(format)).toBe(false);
      },
    );
    expect(cell).toHaveStyle({ verticalAlign: "middle" });
    expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
    act(
      /** Restores the actual root instead of detaching cell inheritance. @returns Nothing. */ () => {
        expect(format.SetDerivedFrom()).toBe(true);
      },
    );
    expect(cell).toHaveStyle({ verticalAlign: "bottom" });
    expect(box.GetFrameFormat()).toBe(format);
    expect(format.GetAttrSet()).toBe(set);
    expect(format.GetRegisteredIn()).toBe(root);
    expect(set.GetParent()).toBe(root.GetAttrSet());
    act(
      /** Changes the original default owner to exercise retained native subscriptions. @returns Nothing. */ () => {
        root.SetFormatAttr(new SwFormatVertOrient());
        parent.SetFormatAttr(new SwFormatVertOrient(240, 2, 7));
        expect(format.SetDerivedFrom(undefined)).toBe(false);
      },
    );
    expect(cell).toHaveStyle({ verticalAlign: "top" });
    expect(box.GetParagraphs()[0]).toBe(node);
    expect(node.GetText()).toBe("Original inherited cell");
    expect(screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" })).toBe(editor);
  } finally {
    cleanup();
    session.Close();
  }
});
