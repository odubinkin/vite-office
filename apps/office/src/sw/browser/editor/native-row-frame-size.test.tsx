/** @fileoverview Verifies mounted native fixed-row clipping and current-row properties metric. */
import { nativeBoxFormat } from "../../../test/table-box-test-helpers";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
import { SwPosition } from "../../source/core/crsr/pam";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
/** Requires actual UI owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw new Error("Missing fixed-row UI owner");
  return value;
}
it("mounted fixed row clips original editable text while minimum row keeps natural content", /** Checks item-driven render and shell current-row metric. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    table = doc.nodes.MakeTableNode("Frame", { width: 3000, align: "left" }, doc.paragraphs[0]);
  table.AddColumnWidth(3000);
  const fixed = doc.nodes.AppendTableRow(table, 1, {
      frameSize: new SwFormatFrameSize(SwFrameSize.Fixed, 0, 600),
    }),
    minimum = doc.nodes.AppendTableRow(table, 1, {
      frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 900),
    });
  const fixedNode = required(required(fixed.GetTabBoxes()[0]).GetParagraphs()[0]),
    node = required(required(minimum.GetTabBoxes()[0]).GetParagraphs()[0]);
  fixedNode.SetText("fixed native");
  node.SetText("minimum native");
  const position = new SwPosition(node, 2);
  shell.SetCursor(position);
  position.Dispose();
  try {
    render(<WriterWorkbench isActive view={session.view} />);
    const fixedText = screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" }),
      clip = required(fixedText.closest("[data-writer-fixed-row-content]"));
    expect(clip).toHaveStyle({ height: "40px", overflow: "hidden", boxSizing: "border-box" });
    expect(
      screen
        .getByRole("textbox", { name: "Row 2 column 1 paragraph 1" })
        .closest("[data-writer-fixed-row-content]"),
    ).toBeNull();
    const position2 = new SwPosition(node, 2);
    act(
      /** Sets current native row after mount. @returns Nothing. */ () => {
        shell.SetCursor(position2);
      },
    );
    position2.Dispose();
    fireEvent.click(screen.getByRole("button", { name: "Table" }));
    fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Size" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Row Height…" }));
    expect(screen.getByRole("spinbutton", { name: "Height (cm)" })).toHaveValue(1.59);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(table.GetTabLines()[0]).toBe(fixed);
    expect(required(fixed.GetTabBoxes()[0]).GetParagraphs()[0]).toBe(fixedNode);
  } finally {
    cleanup();
    session.Close();
  }
});

it("fixed native row retains a visible guide for authored border none", /** Checks the independent fixed-cell guide branch. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    table = doc.nodes.MakeTableNode("Guide", { width: 3000, align: "left" }, doc.paragraphs[0]);
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(
    table,
    1,
    { frameSize: new SwFormatFrameSize(SwFrameSize.Fixed, 0, 600) },
    [nativeBoxFormat({ border: "none", padding: 0 })],
  );
  required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]).SetText("Guide");
  try {
    render(<WriterWorkbench isActive view={session.view} />);
    const paragraph = screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" }),
      clip = required(paragraph.closest("[data-writer-fixed-row-content]"));
    expect(clip).toHaveStyle({ height: "40px", overflow: "hidden", border: "1px dashed #cbd5e1" });
    expect(paragraph.closest<HTMLTableCellElement>("td,th")).toHaveAttribute(
      "data-writer-border-guide",
      "true",
    );
  } finally {
    cleanup();
    session.Close();
  }
});

it("fixed row owns bounds independently of clipped guide and authored border content", /** Checks fixed positioning without changing natural row ownership. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    table = doc.nodes.MakeTableNode("Bounds", { width: 3000, align: "left" }, doc.paragraphs[0]);
  table.AddColumnWidth(3000);
  for (const [type, border] of [
    [SwFrameSize.Fixed, "none"],
    [SwFrameSize.Fixed, "1px solid #000000"],
    [SwFrameSize.Minimum, "none"],
  ] as const) {
    const row = doc.nodes.AppendTableRow(
      table,
      1,
      { frameSize: new SwFormatFrameSize(type, 0, 600) },
      [nativeBoxFormat({ border, padding: 0 })],
    );
    required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]).SetText("Original row bounds");
  }
  try {
    render(<WriterWorkbench isActive view={session.view} />);
    const a = required(
        screen
          .getByRole("textbox", { name: "Row 1 column 1 paragraph 1" })
          .closest("[data-writer-fixed-row-content]"),
      ),
      b = required(
        screen
          .getByRole("textbox", { name: "Row 2 column 1 paragraph 1" })
          .closest("[data-writer-fixed-row-content]"),
      );
    expect(a).toHaveStyle({
      position: "absolute",
      top: "0px",
      left: "0px",
      right: "0px",
      height: "40px",
      border: "1px dashed #cbd5e1",
    });
    expect(b).toHaveStyle({
      position: "absolute",
      height: "40px",
      borderTop: "0.75pt solid #000000",
      borderBottom: "0.75pt solid #000000",
      borderLeft: "0.75pt solid #000000",
      borderRight: "0.75pt solid #000000",
    });
    expect(
      screen
        .getByRole("textbox", { name: "Row 3 column 1 paragraph 1" })
        .closest("[data-writer-fixed-row-content]"),
    ).toBeNull();
  } finally {
    cleanup();
    session.Close();
  }
});
