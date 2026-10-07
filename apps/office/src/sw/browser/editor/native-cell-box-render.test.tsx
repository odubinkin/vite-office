/** @fileoverview Verifies direct native box rendering on natural and fixed rows and through native history. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { SvxBoxItem } from "../../../editeng/source/items/frmitems";
import { SvxBorderLine } from "../../../editeng/source/items/borderline";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { RES_BOX } from "../../inc/hintids";
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { WriterTableDialog } from "../presentation/WriterTableDialog";

it("native empty box guides preserve column geometry and dialog retains a custom native border", /** Checks direct paint and existing UI ingress defaults over real owned cells. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    table = doc.nodes.MakeTableNode("Guides", { width: 3000 }, doc.paragraphs[0]);
  table.AddColumnWidth(1500);
  table.AddColumnWidth(1500);
  const empty = new SvxBoxItem(RES_BOX),
    owned = new SvxBoxItem(RES_BOX);
  owned.SetLine(new SvxBorderLine(0x112233, 40, 2), 0);
  doc.nodes.AppendTableRow(table, 2, {}, [{ box: empty }, { box: owned }]);
  try {
    render(<WriterWorkbench isActive view={session.view} />);
    const cell = required(
      screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" }).closest("td"),
    );
    expect(cell.style.borderTopStyle).toBe("none");
    expect(cell).toHaveStyle({
      outline: "1px dashed #cbd5e1",
      outlineOffset: "-1px",
      paddingTop: "0px",
    });
    cleanup();
    const first = required(table.GetTabLines()[0]?.GetTabBoxes()[0]);
    first.SetFormat({ box: owned });
    render(
      <WriterTableDialog
        table={table}
        availableWidth={3000}
        onCancel={/** Leaves the test dialog mounted. @returns Nothing. */ () => undefined}
        onSubmit={/** Keeps assertions at UI ingress. @returns Nothing. */ () => undefined}
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "Borders" }));
    expect(screen.getByRole("option", { name: "Current border" })).toHaveValue(
      "2pt dashed #112233",
    );
    cleanup();
    const noRows = doc.nodes.MakeTableNode("NoRows", { width: 3000 });
    noRows.AddColumnWidth(3000);
    render(
      <WriterTableDialog
        table={noRows}
        availableWidth={3000}
        onCancel={/** Leaves empty-table defaults inspectable. @returns Nothing. */ () => undefined}
        onSubmit={
          /** Observes defaults without changing the model. @returns Nothing. */ () => undefined
        }
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "Borders" }));
    expect(screen.getByRole("combobox", { name: "Cell border" })).toHaveValue("none");
    expect(screen.getByRole("spinbutton", { name: "Cell padding (cm)" })).toHaveValue(0);
  } finally {
    session.Close();
  }
});
afterEach(cleanup);
it("isolates missing-edge guides for every native paint family on natural and fixed rows", /** Checks all represented paint families alongside absent and authored empty lines. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    table = doc.nodes.MakeTableNode("GuideFamilies", { width: 3000 }, doc.paragraphs[0]);
  table.AddColumnWidth(3000);
  const paints = [
    "solid",
    "dotted",
    "dashed",
    "double",
    "double",
    "double",
    "double",
    "double",
    "double",
    "double",
    "ridge",
    "groove",
    "outset",
    "inset",
    "dashed",
    "double",
    "dashed",
    "dashed",
  ];
  for (const fixed of [false, true])
    for (let style = 0; style <= 17; style++) {
      const item = new SvxBoxItem(RES_BOX);
      item.SetLine(new SvxBorderLine(0x112233, 90, style), 0);
      item.SetLine(new SvxBorderLine(0, 0), 2);
      const box = required(
        doc.nodes
          .AppendTableRow(
            table,
            1,
            {
              frameSize: new SwFormatFrameSize(
                fixed ? SwFrameSize.Fixed : SwFrameSize.Minimum,
                0,
                600,
              ),
            },
            [{ box: item }],
          )
          .GetTabBoxes()[0],
      );
      required(box.GetParagraphs()[0]).SetText(`GuideFamily${fixed ? "Fixed" : "Natural"}${style}`);
    }
  try {
    render(<WriterWorkbench isActive view={session.view} />);
    for (const fixed of [false, true])
      for (let style = 0; style <= 17; style++) {
        const paragraph = required(
            screen.getAllByText(`GuideFamily${fixed ? "Fixed" : "Natural"}${style}`)[0],
          ),
          cell = required(paragraph.closest("td")),
          painted = fixed
            ? required(cell.querySelector<HTMLElement>("[data-writer-fixed-row-content]"))
            : cell;
        expect(painted).toHaveStyle({
          borderTopStyle: paints[style],
          borderBottomStyle: fixed ? "dashed" : "none",
          borderLeftStyle: fixed ? "dashed" : "none",
          paddingTop: "0px",
        });
        expect(painted.style.borderTopColor).toBe("rgb(17, 34, 51)");
      }
  } finally {
    session.Close();
  }
});
/** Requires a native owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw Error("Missing native rendered box");
  return value;
}
for (const fixed of [false, true])
  it(`renders independent native edges/distances and native history fixed=${fixed}`, /** Checks mounted original cell ownership and metric-driven geometry. @returns Nothing. */ () => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell(),
      table = doc.nodes.MakeTableNode("Paint", { width: 6000 }, doc.paragraphs[0]);
    table.AddColumnWidth(6000);
    const item = new SvxBoxItem(RES_BOX);
    for (const [edge, style] of [0, 1, 3, 11].entries()) {
      const line = new SvxBorderLine(0x112233 + edge, (edge + 1) * 20);
      line.SetBorderLineStyle(style);
      item.SetLine(line, edge);
      item.SetDistance((edge + 1) * 15, edge);
    }
    const row = doc.nodes.AppendTableRow(
        table,
        1,
        {
          frameSize: new SwFormatFrameSize(
            fixed ? SwFrameSize.Fixed : SwFrameSize.Minimum,
            0,
            1200,
          ),
        },
        [{ box: item }],
      ),
      box = required(row.GetTabBoxes()[0]),
      node = required(box.GetParagraphs()[0]);
    node.SetText("NativePaint");
    shell.FocusNode(node);
    try {
      render(<WriterWorkbench isActive view={session.view} />);
      const paragraph = screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" }),
        cell = required(paragraph.closest("td")),
        painted = fixed ? required(cell.querySelector("[data-writer-fixed-row-content]")) : cell;
      expect(painted).toHaveStyle({
        borderTop: "1pt solid #112233",
        borderBottom: "2pt dotted #112234",
        borderLeft: "3pt double #112235",
        borderRight: "4pt groove #112236",
        paddingTop: "1px",
        paddingBottom: "2px",
        paddingLeft: "3px",
        paddingRight: "4px",
      });
      if (fixed) {
        expect(cell.style.borderStyle).toBe("none");
        expect(cell).toHaveStyle({ padding: "0px" });
        expect(painted).toHaveStyle({ height: "80px", overflow: "hidden" });
      }
      const changed = new SvxBoxItem(RES_BOX);
      changed.SetAllDistances(75);
      changed.SetLine(new SvxBorderLine(0xaabbcc, 40, 2), 0);
      const items = new SfxItemSet(doc.GetAttrPool(), [[RES_BOX, RES_BOX]]);
      items.Put(changed);
      act(
        /** Applies native items through the original shell. @returns Nothing. */ () => {
          expect(shell.SetTabBorders(items)).toBe(true);
        },
      );
      expect(painted).toHaveStyle({
        borderTop: "2pt dashed #aabbcc",
        borderBottomStyle: fixed ? "dashed" : "none",
        paddingTop: "5px",
        paddingRight: "5px",
      });
      act(
        /** Restores native attributes. @returns Nothing. */ () => {
          expect(shell.Undo()).toBe(true);
        },
      );
      expect(painted).toHaveStyle({
        borderTop: "1pt solid #112233",
        borderLeft: "3pt double #112235",
        paddingRight: "4px",
      });
      act(
        /** Reapplies native attributes. @returns Nothing. */ () => {
          expect(shell.Redo()).toBe(true);
        },
      );
      expect(painted).toHaveStyle({ borderTop: "2pt dashed #aabbcc", paddingBottom: "5px" });
      expect(box.GetParagraphs()[0]).toBe(node);
      expect(node.GetText()).toBe("NativePaint");
    } finally {
      session.Close();
    }
  });
it.each([
  [0, "solid"],
  [1, "dotted"],
  [2, "dashed"],
  [3, "double"],
  [4, "double"],
  [5, "double"],
  [6, "double"],
  [7, "double"],
  [8, "double"],
  [9, "double"],
  [10, "ridge"],
  [11, "groove"],
  [12, "outset"],
  [13, "inset"],
  [14, "dashed"],
  [15, "double"],
  [16, "dashed"],
  [17, "dashed"],
] as const)(
  "projects native style=%s on the browser paint boundary",
  /** Checks numeric styles stay in the model while the device uses its supported paint families. @param style - Native ID. @param paint - Browser paint. @returns Nothing. */ (
    style,
    paint,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      table = doc.nodes.MakeTableNode("Styles", { width: 3000 }, doc.paragraphs[0]);
    table.AddColumnWidth(3000);
    const item = new SvxBoxItem(RES_BOX);
    item.SetLine(new SvxBorderLine(0x112233, 90, style), 0);
    const box = required(doc.nodes.AppendTableRow(table, 1, {}, [{ box: item }]).GetTabBoxes()[0]);
    required(box.GetParagraphs()[0]).SetText("StylePaint");
    try {
      render(<WriterWorkbench isActive view={session.view} />);
      const cell = required(
        screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" }).closest("td"),
      );
      expect(cell).toHaveStyle({ borderTopStyle: paint, paddingTop: "0px" });
      expect(box.GetBox().GetTop()?.GetBorderLineStyle()).toBe(style);
    } finally {
      session.Close();
    }
  },
);
