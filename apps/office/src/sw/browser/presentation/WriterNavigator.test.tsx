/** @fileoverview Verifies native Writer Navigator content ownership, keyboard activation and physical page movement. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { assert, expect, it } from "vitest";
import { HoriOrientation } from "../../../offapi/com/sun/star/text/HoriOrientation";
import { SfxInt16Item } from "../../../svl/inc/intitem";
import { RES_BREAK } from "../../inc/hintids";
import { SwFormatLayoutSplit } from "../../inc/fmtlsplt";
import { SwPosition } from "../../source/core/crsr/pam";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";

it("retains native Navigator expansion and activates live headings, tables and bookmarks", /** Drives the actual child-window command and registered content owners. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const document = shell.GetDoc();
  const first = document.paragraphs[0];
  assert(first);
  first.SetText("Chapter title");
  first.SetAttrOutlineLevel(1);
  const second = document.nodes.MakeTextNode();
  second.SetText("Chapter details");
  second.SetAttrOutlineLevel(2);
  const tail = document.nodes.MakeTextNode();
  tail.SetText("Body text");
  const at = new SwPosition(tail, 0);
  const table = document.InsertTable(
    { mnInsMode: 0, mnRowsToRepeat: 0 },
    at,
    1,
    1,
    HoriOrientation.FULL,
    null,
    null,
    false,
    true,
    "Summary table",
  );
  at.Dispose();
  assert(table);
  const marks = document.GetIDocumentMarkAccess();
  marks.MakeMark(second, 8, "Draft bookmark");
  const tree = session.view.GetNavigator();
  const originalBookmark = tree
    .GetContents()
    .find(
      /** Finds the native bookmark root. @param group - Existing content root. @returns Whether bookmarks. */ (
        group,
      ) => group.type === "bookmark",
    )?.contents[0];
  assert(originalBookmark);
  try {
    render(<WriterWorkbench view={session.view} isActive />);
    const modified = session.docShell.IsModified();
    act(
      /** Opens the original View Navigator command. @returns Nothing. */ () => {
        expect(session.view.Execute(WRITER_COMMAND_IDS.toggleNavigator).status).toBe("executed");
      },
    );
    const navigator = screen.getByRole("dialog", { name: "Navigator" });
    const contents = within(navigator).getByRole("tree", { name: "Document content" });
    const level = within(navigator).getByRole("combobox", { name: "Show Up to Outline Level" });
    expect(within(contents).getByRole("treeitem", { name: "Chapter title" })).toHaveAttribute(
      "aria-level",
      "2",
    );
    expect(within(contents).getByRole("treeitem", { name: "Chapter details" })).toHaveAttribute(
      "aria-level",
      "3",
    );
    fireEvent.change(level, { target: { value: "1" } });
    expect(within(contents).queryByRole("treeitem", { name: "Chapter details" })).toBeNull();
    fireEvent.click(within(contents).getByRole("treeitem", { name: "Headings" }));
    fireEvent.click(within(navigator).getByRole("button", { name: "Close Navigator" }));
    expect(screen.queryByRole("dialog", { name: "Navigator" })).toBeNull();
    act(
      /** Restores the retained Navigator child window. @returns Nothing. */ () => {
        session.view.ToggleNavigator();
      },
    );
    expect(within(contents).getByRole("treeitem", { name: "Headings" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(level).toHaveValue("1");
    fireEvent.click(within(contents).getByRole("treeitem", { name: "Headings" }));
    fireEvent.change(level, { target: { value: "10" } });
    fireEvent.doubleClick(within(contents).getByRole("treeitem", { name: "Chapter details" }));
    expect(shell.GetCursor().GetPoint().GetNode()).toBe(second);
    fireEvent.doubleClick(within(contents).getByRole("treeitem", { name: "Summary table" }));
    expect(shell.GetCursor().GetPoint().GetNode().FindTableNode()?.GetTable()).toBe(table);
    const bookmark = within(contents).getByRole("treeitem", { name: "Draft bookmark" });
    fireEvent.click(bookmark);
    fireEvent.keyDown(bookmark, { key: "Enter" });
    expect(shell.GetCursor().GetPoint().GetNode()).toBe(second);
    expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(8);
    expect(session.docShell.IsModified()).toBe(modified);
    act(
      /** Renames the existing bookmark without retaining a copied navigation graph. @returns Nothing. */ () => {
        expect(marks.RenameMark("Draft bookmark", "Final bookmark")).toBe(true);
      },
    );
    expect(tree.GotoContent(originalBookmark.id)).toBe(true);
    expect(within(contents).getByRole("treeitem", { name: "Final bookmark" })).toBeInTheDocument();
  } finally {
    cleanup();
    session.Close();
  }
});

it("goes to the first row of a follow table on its physical page", /** Uses actual table fragments and registered cell positions. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const document = shell.GetDoc();
  const table = document.nodes.MakeTableNode("Split table", { width: 6000 });
  table.AddColumnWidth(6000);
  document.nodes.AppendTableRow(table, 1);
  document.nodes.AppendTableRow(table, 1);
  table.SetRowsToRepeat(0);
  const split = new SwFormatLayoutSplit(true);
  table.GetFrameFormat().SetFormatAttr(split);
  split.Dispose();
  try {
    const layout = session.view.GetLayout().Format(
      document.paragraphs.map(
        /** Supplies a single physical line for actual body paragraphs. @param node - Body paragraph. @returns Formatter input. */
        (node) => ({
          id: String(node.GetIndex()),
          lines: [{ start: 0, end: node.GetText().length, height: 240 }],
        }),
      ),
      document.GetPageDesc().GetValue(),
      undefined,
      document.GetLineNumberInfo().QueryValue(),
      0,
      [{ tableName: table.GetName(), rowHeights: [9000, 9000] }],
    );
    expect(layout.pages[1]?.tableFrames[0]?.firstRow).toBe(1);
    const tree = session.view.GetNavigator();
    expect(tree.GotoPage(2)).toBe(true);
    expect(shell.GetCursor().GetPoint().GetNode().GetTableBox()?.GetUpper()).toBe(
      table.GetTabLines()[1],
    );
    expect(tree.GetPageState().current).toBe(2);
  } finally {
    session.Close();
  }
});

it("uses the current formatted physical pages and exact follow cursor offsets", /** Shapes two actual pages and moves the original Writer cursor. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const document = shell.GetDoc();
  const body = document.paragraphs[0];
  assert(body);
  body.SetText("Page one");
  const second = document.nodes.MakeTextNode();
  second.SetText("Page two");
  const before = new SfxInt16Item(RES_BREAK, 4);
  second.SetAttr(before);
  before.Dispose();
  try {
    const layout = session.view.GetLayout();
    layout.Format(
      [
        { id: "first", lines: [{ start: 0, end: 8, height: 300 }] },
        { id: "second", lines: [{ start: 0, end: 8, height: 300 }] },
      ],
      document.GetPageDesc().GetValue(),
      undefined,
      document.GetLineNumberInfo().QueryValue(),
    );
    const tree = session.view.GetNavigator();
    expect(tree.GetPageState()).toEqual({ count: 2, current: 1 });
    expect(tree.GotoPage(3)).toBe(false);
    expect(tree.GotoPage(2)).toBe(true);
    expect(tree.GetPageState()).toEqual({ count: 2, current: 2 });
    expect(shell.GetCursor().GetPoint().GetNode()).toBe(second);
    expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(0);
  } finally {
    session.Close();
  }
});
