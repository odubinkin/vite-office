/** @fileoverview Calc native page-break commands, history, drawing and workbook persistence. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { assert, afterEach, expect, it } from "vitest";
import { DocumentArchive } from "../../../package/source/zippackage/document-archive";
import { ViewOption } from "../../inc/viewopti";
import { ScTableProtection } from "../../source/core/data/tabprotection";
import { ExcelFilter } from "../../source/filter/oox/excelfilter";
import { readOdsDocument, writeOdsXml } from "../../source/filter/xml/xmlwrap";
import { decodeCalcDocument, encodeCalcDocument } from "../filter/xml/calc-document-codec";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";

afterEach(cleanup);

/** Opens the existing source menu resource for an axis break slot. @param insert - Insert or delete submenu. @param label - Exact resource label. @returns Menu button. */
function menuBreak(insert: boolean, label: string): HTMLElement {
  fireEvent.click(screen.getByRole("menuitem", { name: "Sheet" }));
  fireEvent.click(
    screen.getByRole("menuitem", { name: insert ? "Insert Page Break" : "Delete Page Break" }),
  );
  return screen.getByRole("menuitem", { name: label });
}

it("inserts and removes the manual breaks from the Sheet menu and restores them in history", /** Drives the actual menu, stored flags, view cursor and both paint axes. @returns Nothing. */ () => {
  const s = createCalcSession();
  const { controller, frame, fileWorkflows, sheetWorkflows } = s;
  try {
    const dispatch = frame.GetDispatcher();
    const doc = controller.shell.GetDocument();
    const table = doc.FetchTable(0);
    assert(table);
    expect(dispatch.QueryState(".uno:InsertRowBreak").enabled).toBe(false);
    expect(dispatch.QueryState(".uno:InsertColumnBreak").enabled).toBe(false);
    controller.Select(2, 4);
    table.SetRowBreak(4, true, false);
    table.SetStreamValid(true);
    const { container } = render(
      <CalcWorkbench {...{ controller, frame, fileWorkflows, sheetWorkflows }} />,
    );
    const row = '[data-calc-break="row"][data-calc-break-index="4"]';
    const column = '[data-calc-break="column"][data-calc-break-index="2"]';
    expect(container.querySelector(row)).toHaveAttribute("data-calc-break-kind", "computed");
    fireEvent.click(menuBreak(true, "Insert Row Break"));
    expect(dispatch.QueryState(".uno:InsertRowBreak").enabled).toBe(false);
    expect(dispatch.QueryState(".uno:DeleteRowbreak").enabled).toBe(true);
    expect(table.IsStreamValid()).toBe(false);
    expect(container.querySelector(row)).toHaveAttribute("data-calc-break-kind", "manual");
    fireEvent.click(menuBreak(true, "Insert Column Break"));
    expect(container.querySelector(column)).toHaveAttribute("data-calc-break-kind", "manual");

    fireEvent.click(menuBreak(false, "Remove Row Break"));
    expect(table.HasRowManualBreak(4)).toBe(false);
    expect(container.querySelector(row)).toHaveAttribute("data-calc-break-kind", "computed");
    fireEvent.click(menuBreak(false, "Remove Column Break"));
    expect(table.HasColManualBreak(2)).toBe(false);
    expect(container.querySelector(column)).toBeNull();

    act(
      /** Moves off the command cursor before Undo. @returns Nothing. */ () => {
        controller.Select(8, 8);
        controller.Undo();
      },
    );
    expect(controller.Address()).toBe("C5");
    expect(table.HasColManualBreak(2)).toBe(true);
    act(
      /** Restores the row break as well. @returns Nothing. */ () => {
        controller.Undo();
      },
    );
    expect(table.HasRowManualBreak(4)).toBe(true);
    act(
      /** Reapplies removal without losing the automatic break. @returns Nothing. */ () => {
        controller.Redo();
      },
    );
    expect(container.querySelector(row)).toHaveAttribute("data-calc-break-kind", "computed");
    expect(table.HasColManualBreak(2)).toBe(true);
  } finally {
    s.Close();
  }
});

it("keeps break lines independent of grid visibility and disables edits on protected sheets", /** Verifies hidden-span geometry, the persisted view gate, and native state admission. @returns Nothing. */ () => {
  const s = createCalcSession();
  const { controller, frame, fileWorkflows, sheetWorkflows } = s;
  try {
    const table = controller.shell.GetDocument().FetchTable(0);
    assert(table);
    table.SetRowHidden(2, 4, true);
    table.SetRowBreak(3, false, true);
    table.SetRowBreak(4, true, false);
    controller.Select(2, 5);
    controller.viewData.GetOptions().SetOption(ViewOption.GRID, false);
    const { container, rerender } = render(
      <CalcWorkbench {...{ controller, frame, fileWorkflows, sheetWorkflows }} />,
    );
    const rules = container.querySelectorAll('[data-calc-break="row"]');
    expect(rules).toHaveLength(1);
    expect(rules[0]).toHaveAttribute("data-calc-break-index", "3");
    controller.viewData.GetOptions().SetOption(ViewOption.PAGEBREAKS, false);
    rerender(<CalcWorkbench {...{ controller, frame, fileWorkflows, sheetWorkflows }} />);
    expect(container.querySelector('[data-calc-break="row"]')).toBeNull();
    const protection = new ScTableProtection();
    protection.setProtected(true);
    table.SetProtection(protection);
    const dispatch = frame.GetDispatcher();
    expect(dispatch.QueryState(".uno:InsertRowBreak").enabled).toBe(false);
    expect(dispatch.QueryState(".uno:InsertColumnBreak").enabled).toBe(false);
    expect(dispatch.QueryState(".uno:DeleteRowbreak").enabled).toBe(false);
    expect(table.HasRowManualBreak(3)).toBe(true);
  } finally {
    s.Close();
  }
});

it("stores changes made by the page-break commands in XLSX, ODS, and the Worker graph", /** Verifies commands against all represented file owners and normal-view break visibility. @returns Completion. */ async () => {
  const s = createCalcSession();
  try {
    const { controller, frame } = s;
    const doc = controller.shell.GetDocument();
    controller.Select(2, 4);
    const dispatch = frame.GetDispatcher();
    dispatch.Execute(".uno:InsertRowBreak");
    dispatch.Execute(".uno:InsertColumnBreak");
    doc.GetViewOptions().SetOption(ViewOption.PAGEBREAKS, false);
    const transferred = decodeCalcDocument(structuredClone(encodeCalcDocument(doc)));
    try {
      const ods = await writeOdsXml(transferred);
      expect(ods.files["settings.xml"]).toContain(
        'config:name="ShowPageBreaks" config:type="boolean">false',
      );
      const reopened = await readOdsDocument(ods);
      try {
        expect(reopened.GetViewOptions().GetOption(ViewOption.PAGEBREAKS)).toBe(false);
        expect(reopened.FetchTable(0)?.HasRowManualBreak(4)).toBe(true);
        expect(reopened.FetchTable(0)?.HasColManualBreak(2)).toBe(true);
      } finally {
        reopened.Dispose();
      }
      const bytes = await controller.shell.SerializeXlsx();
      const archive = await DocumentArchive.open(bytes);
      const xml = await archive.readTextEntry("xl/worksheets/sheet1.xml");
      expect(xml).toMatch(/<rowBreaks[^>]*><brk id="4" man="true"/u);
      expect(xml).toMatch(/<colBreaks[^>]*><brk id="2" man="true"/u);
      const xlsx = await ExcelFilter.importDocument(bytes);
      try {
        expect(xlsx.FetchTable(0)?.HasRowManualBreak(4)).toBe(true);
        expect(xlsx.FetchTable(0)?.HasColManualBreak(2)).toBe(true);
      } finally {
        xlsx.Dispose();
      }
    } finally {
      transferred.Dispose();
    }
  } finally {
    s.Close();
  }
});
