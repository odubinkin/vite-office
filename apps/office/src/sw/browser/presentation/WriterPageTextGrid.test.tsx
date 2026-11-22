/** @fileoverview Verifies Writer's native Page Style grid exchange and restored body layout. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { SvxFrameDirection } from "../../../editeng/inc/frmdir";
import { SfxItemSet } from "../../../svl/inc/itemset";
import { RES_TEXTGRID } from "../../inc/hintids";
import { SwTextGrid, type SwTextGridItem } from "../../inc/tgrditem";
import { FormatBodyTextGrid } from "../../source/core/layout/pagechg";
import { formatPageBodyGeometry, getPageBodyGeometry } from "../../source/core/layout/pagedesc";
import { readOdtDocument } from "../../source/filter/xml/swxml";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { SwTextGridPage } from "../../source/ui/misc/pggrid";
import { PageDescToItemSet } from "../../source/uibase/utlui/uitool";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { createWriterDocumentSession } from "../composition/writer-module";
import { decodeWriterDocument, encodeWriterDocument } from "../filter/xml/writer-document-codec";
import { WriterPageStyleDialog } from "./WriterPageStyleDialog";

it("edits the existing native grid through Page Style and carries it through layout, history and storage", /** Exercises the original Page Style request with normal grid controls. @returns Completion. */ async () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const document = shell.GetDoc();
  document.SetDefaultPageMode(false);
  const page = document.GetPageDesc();
  const controller = session.view.GetDialogController();
  /** Mounts the native Page Style request and enters its Text Grid page. @returns Original command completion. */
  function open() {
    const executed = session.view.Execute(WRITER_COMMAND_IDS.pageDialog);
    const snapshot = controller.GetSnapshot();
    if (executed.status !== "executed" || snapshot?.request.kind !== "page-style")
      throw new Error("Missing native Page Style request");
    render(
      <WriterPageStyleDialog
        initialValue={snapshot.request.initialValue}
        pageInput={snapshot.request.pageInput}
        htmlMode={snapshot.request.htmlMode}
        onCancel={
          /** Cancels the request. @returns Nothing. */ () => {
            controller.Cancel(snapshot.id);
          }
        }
        onSubmit={
          /** Completes the request. @param pageDescriptor - Page draft. @param pageItems - Native item delta. @returns Nothing. */ (
            pageDescriptor,
            pageItems,
          ) => {
            if (
              !controller.Complete(snapshot.id, { pageDescriptor, ...(pageItems && { pageItems }) })
            )
              pageItems?.Dispose();
          }
        }
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "Text Grid" }));
    return executed.value;
  }
  try {
    const original = getPageBodyGeometry(page);
    const accepted = open();
    expect(screen.getByRole("radio", { name: "No grid" })).toBeChecked();
    expect(screen.getByRole("spinbutton", { name: "Lines per page:" })).toBeDisabled();
    fireEvent.click(screen.getByRole("radio", { name: "Grid (lines and characters)" }));
    expect(screen.getByRole("checkbox", { name: "Snap to characters" })).toBeEnabled();
    fireEvent.change(screen.getByRole("spinbutton", { name: "Max. base text size:" }), {
      target: { value: "18" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Character width:" }), {
      target: { value: "13" },
    });
    const display = screen.getByRole("checkbox", { name: "Display grid" });
    const print = screen.getByRole("checkbox", { name: "Print grid" });
    fireEvent.click(display);
    expect(print).toBeDisabled();
    expect(print).not.toBeChecked();
    expect(
      screen
        .getByRole("tabpanel", { name: "Text Grid" })
        .querySelector('[data-writer-page-text-grid="preview"]'),
    ).toBeInTheDocument();
    fireEvent.click(display);
    expect(print).toBeChecked();
    fireEvent.click(print);
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    await expect(accepted).resolves.toBe(true);
    const grid = page.GetMaster().GetTextGrid();
    expect(grid.GetGridType()).toBe(SwTextGrid.LinesAndChars);
    expect(grid.GetBaseHeight()).toBe(360);
    expect(grid.GetBaseWidth()).toBe(260);
    expect(grid.GetRubyHeight()).toBe(0);
    expect(grid.IsDisplayGrid()).toBe(true);
    expect(grid.IsPrintGrid()).toBe(false);
    const body = formatPageBodyGeometry(page, document);
    expect((body.width - body.leftMargin - body.rightMargin) % grid.GetBaseWidth()).toBe(0);
    expect(body.height - body.topMargin - body.bottomMargin).toBe(
      grid.GetLines() * grid.GetBaseHeight(),
    );

    const settings = grid.QueryValue();
    expect(shell.Undo()).toBe(true);
    expect(formatPageBodyGeometry(page, document)).toEqual(original);
    expect(shell.Redo()).toBe(true);
    expect(page.GetMaster().GetTextGrid().QueryValue()).toEqual(settings);
    const title = { title: "Grid" };
    document.GetDocumentSettingManager().set("MS_WORD_COMP_GRID_METRICS", true);
    expect(formatPageBodyGeometry(page, document)).toEqual(getPageBodyGeometry(page));
    const odt = await readOdtDocument(await writeOdtDocument(document, title), title);
    const worker = decodeWriterDocument(structuredClone(encodeWriterDocument(document)));
    try {
      for (const copy of [odt.document, worker]) {
        expect(copy.GetPageDesc().GetMaster().GetTextGrid().QueryValue()).toEqual(settings);
        expect(copy.GetDocumentSettingManager().get("MS_WORD_COMP_GRID_METRICS")).toBe(true);
      }
    } finally {
      odt.document.Dispose();
      worker.Dispose();
    }

    cleanup();
    const canceled = open();
    expect(screen.getByRole("spinbutton", { name: "Character width:" })).toHaveValue("13.0 pt");
    fireEvent.click(screen.getByRole("radio", { name: "No grid" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await expect(canceled).resolves.toBe(false);
    expect(page.GetMaster().GetTextGrid().QueryValue()).toEqual(settings);
  } finally {
    cleanup();
    session.Close();
  }
});

it("retains the squared paper size and uses the vertical body axes", /** Exercises squared-paper character sizing and ruby bands. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const document = session.view.GetWrtShell().GetDoc();
  document.SetDefaultPageMode(true);
  const input = PageDescToItemSet(document.GetPageDesc());
  const output = new SfxItemSet(input.GetPool(), [[RES_TEXTGRID, RES_TEXTGRID]]);
  const tab = new SwTextGridPage(input, { width: 3120, height: 4000 });
  try {
    expect(tab.FillItemSet(output)).toBe(false);
    tab.SetGridType(SwTextGrid.LinesAndChars);
    tab.SetCharactersPerLine(6);
    tab.SetRubyHeight(100);
    tab.SetRubyTextBelow(true);
    tab.SetLinesPerPage(5);
    expect(tab.GetCounts()).toMatchObject({ characters: 6, maxLines: 6 });
    expect(tab.FillItemSet(output)).toBe(true);
    const grid = output.Get(RES_TEXTGRID) as SwTextGridItem;
    expect(grid.IsSquaredMode()).toBe(true);
    expect(grid.GetBaseHeight()).toBe(520);
    expect(grid.GetRubyHeight()).toBe(100);
    expect(grid.IsRubyTextBelow()).toBe(true);
    expect(FormatBodyTextGrid(4000, 3120, grid, true, SvxFrameDirection.Vertical_RL_TB)).toEqual({
      top: 0,
      bottom: 0,
      left: 450,
      right: 450,
    });
  } finally {
    tab.Dispose();
    output.Dispose();
    input.Dispose();
    session.Close();
  }
});
