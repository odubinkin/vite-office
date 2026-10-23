/** @fileoverview Verifies table toolbar, menu and sidebar flow commands through a mounted real Writer frame. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { SwPosition } from "../../source/core/crsr/pam";
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
import { VertOrientation } from "../../../offapi/com/sun/star/text/VertOrientation";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases mounted observers before native frames. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Mounts the actual workbench with a two-row table and initial body cursor. @returns Original owners and cursor port. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const shell = session.view.GetWrtShell(),
    doc = shell.GetDoc();
  const table = doc.nodes.MakeTableNode("Flow UI", {
    width: 6000,
    headerRows: 0,
    repeatHeaderRows: false,
  });
  table.AddColumnWidth(6000);
  for (let i = 0; i < 2; i++) doc.nodes.AppendTableRow(table, 1);
  /** Moves the original native cursor. @param row - Table row or body. @returns Nothing. */
  function move(row: number | undefined) {
    const node =
      row === undefined
        ? doc.paragraphs[0]
        : table.GetTabLines()[row]?.GetTabBoxes()[0]?.GetParagraphs()[0];
    if (!node) throw new Error("Missing UI flow node");
    act(
      /** Publishes native cursor state. @returns Nothing. */ () => {
        const position = new SwPosition(node, 0);
        shell.SetCursor(position);
        position.Dispose();
      },
    );
  }
  move(undefined);
  render(<WriterWorkbench isActive view={session.view} />);
  return { session, shell, table, move };
}
it("shows a separate source-ordered contextual toolbar and updates checked cell alignment", /** Checks table entry/exit and actual model feedback. @returns Nothing. */ () => {
  const f = fixture();
  expect(screen.queryByRole("toolbar", { name: "Writer table toolbar" })).not.toBeInTheDocument();
  f.move(0);
  const bar = within(screen.getByRole("toolbar", { name: "Writer table toolbar" }));
  expect(screen.getByRole("toolbar", { name: "Writer table toolbar" }).nextElementSibling).toBe(
    screen.getByRole("status", { name: "Writer status bar" }),
  );
  expect(
    bar.getAllByRole("button").map(
      /** Reads actual accessible command order. @param button - Mounted command. @returns Label. */
      (button) => button.getAttribute("aria-label"),
    ),
  ).toEqual([
    "Insert Rows Above",
    "Insert Rows Below",
    "Insert Columns Before",
    "Insert Columns After",
    "Select Cell",
    "Select Table",
    "Top",
    "Center",
    "Bottom",
    "Table Properties",
  ]);
  const alignment = ["Top", "Center", "Bottom"].map(
    /** Reads distinct native alignment controls. @param name - Original label. @returns Control. */ (
      name,
    ) => bar.getByRole("button", { name }),
  );
  expect(
    alignment.map(
      /** Reads native state. @param button - Control. @returns State. */ (button) =>
        button.getAttribute("aria-pressed"),
    ),
  ).toEqual(["true", "false", "false"]);
  fireEvent.click(bar.getByRole("button", { name: "Bottom" }));
  expect(f.shell.GetBoxAlign()).toBe(VertOrientation.BOTTOM);
  expect(alignment[2]).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(screen.getByRole("button", { name: "Undo" }));
  expect(alignment[0]).toHaveAttribute("aria-pressed", "true");
  f.move(undefined);
  expect(screen.queryByRole("toolbar", { name: "Writer table toolbar" })).not.toBeInTheDocument();
});
it("connects native header/row-split menu checks and sidebar minimal height without retaining React state", /** Checks selected-row scope and native enablement. @returns Nothing. */ () => {
  const f = fixture();
  f.move(0);
  fireEvent.click(screen.getByRole("menuitem", { name: "Table" }));
  const headline = screen.getByRole("menuitemcheckbox", {
    name: "Header Rows Repeat Across Pages",
  });
  expect(headline).toHaveAttribute("aria-checked", "false");
  fireEvent.click(headline);
  expect(f.table.GetRowsToRepeat()).toBe(1);
  fireEvent.click(screen.getByRole("menuitem", { name: "Table" }));
  const split = screen.getByRole("menuitemcheckbox", { name: "Row to Break Across Pages" });
  expect(split).toHaveAttribute("aria-checked", "true");
  fireEvent.click(split);
  expect(f.shell.GetRowSplit()?.GetValue()).toBe(false);
  const minimal = within(screen.getByRole("region", { name: "Table" })).getByRole("button", {
    name: "Minimal Row Height",
  });
  expect(minimal).toBeDisabled();
  act(
    /** Authors an existing fixed native height. @returns Nothing. */ () => {
      f.shell.SetRowHeight(new SwFormatFrameSize(SwFrameSize.Fixed, 0, 900));
    },
  );
  expect(minimal).toBeEnabled();
  fireEvent.click(minimal);
  expect(f.shell.GetRowHeight()?.GetHeightSizeType()).toBe(SwFrameSize.Variable);
  expect(minimal).toBeDisabled();
  f.move(1);
  fireEvent.click(screen.getByRole("menuitem", { name: "Table" }));
  fireEvent.click(
    screen.getByRole("menuitemcheckbox", { name: "Header Rows Repeat Across Pages" }),
  );
  expect(f.table.GetRowsToRepeat()).toBe(0);
  fireEvent.click(screen.getByRole("menuitem", { name: "Table" }));
  expect(
    screen.getByRole("menuitemcheckbox", { name: "Header Rows Repeat Across Pages" }),
  ).toBeDisabled();
});
