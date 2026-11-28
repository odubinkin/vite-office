/** @fileoverview Calc numeric shortcut states and ODS precision regression tdf133342. */
import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { createDocument } from "../../../sfx2/source/doc/objsh";
import { NfIndexTableOffset as Index, SvNumFormatType as T } from "../../../svl/inc/zforlist";
import { SfxUInt32Item } from "../../../svl/source/items/intitem";
import { ScAddress, ScRange } from "../../inc/address";
import { ScInputMode } from "../../inc/global";
import type { ScDocument } from "../../inc/document";
import { ATTR_VALUE_FORMAT } from "../../inc/scitems";
import { SID_NUMBER_CURRENCY } from "../../sdi/formatsh.numformat";
import { ScCellFormat } from "../../source/core/tool/cellform";
import { readOdsDocument, writeOdsDocument } from "../../source/filter/xml/xmlwrap";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";

afterEach(cleanup);

const a1 = new ScAddress(0, 0, 0);

/** Reads native cell-format output with the actual workbook locale and attributes. @param doc - Document. @returns Displayed A1 value. */
function display(doc: ScDocument): string {
  const context = doc.GetNonThreadedContext();
  const result = ScCellFormat.GetString(
    doc.GetRefCellValue(a1),
    doc.GetNumberFormat(0, 0, 0),
    [null],
    context,
    doc,
  );
  try {
    return text(result);
  } finally {
    result.dispose();
  }
}

it("ports tdf133342 using the original French percent fixture and retains precision through ODS and history", /** Ports tdf133342 using the original French percent fixture and retains precision through ODS and history. @returns Completion. */ async () => {
  const name = "tdf133342.ods";
  const bytes = new Uint8Array(
    readFileSync(`../../vendor/libreoffice-reference/sc/qa/unit/uicalc/data/${name}`),
  );
  const doc = await readOdsDocument(bytes);
  const session = createCalcSession();
  const { controller, frame } = session;
  controller.shell.ReplaceDocument(
    doc,
    createDocument({ id: name, suiteId: "calc", title: name }),
    { kind: "input", name, source: { kind: "external", reference: bytes } },
  );
  try {
    const dispatch = frame.GetDispatcher();
    expect(display(doc)).toBe("12,35 %");
    dispatch.Execute(".uno:NumberFormatIncDecimals");
    expect(display(doc)).toBe("12,346 %");

    const restored = await readOdsDocument(await writeOdsDocument(doc));
    try {
      expect(restored.GetValue(a1)).toBe(doc.GetValue(a1));
      expect(display(restored)).toBe("12,346 %");
    } finally {
      restored.Dispose();
    }

    for (let i = 0; i < 3; i++) dispatch.Execute(".uno:NumberFormatDecDecimals");
    expect(display(doc)).toBe("12 %");
    const history = controller.shell.GetUndoManager();
    const count = history.GetUndoActionCount();
    dispatch.Execute(".uno:NumberFormatDecDecimals");
    expect(history.GetUndoActionCount()).toBe(count);
    expect(display(doc)).toBe("12 %");
    expect(controller.Undo()).toBe(true);
    expect(display(doc)).toBe("12,3 %");
    expect(controller.Redo()).toBe(true);
    expect(display(doc)).toBe("12 %");
  } finally {
    session.Close();
  }
});

it("routes the visible number format controls and menu through native slot state and typed formats", /** Routes the visible number format controls and menu through native slot state and typed formats. @returns Nothing. */ () => {
  const session = createCalcSession();
  const { controller, frame, fileWorkflows, sheetWorkflows } = session;
  const doc = controller.shell.GetDocument();
  try {
    controller.EnterString("1234.5");
    render(
      <CalcWorkbench
        controller={controller}
        frame={frame}
        fileWorkflows={fileWorkflows}
        sheetWorkflows={sheetWorkflows}
      />,
    );
    const toolbar = within(screen.getByRole("toolbar", { name: "Calc formatting toolbar" }));
    const number = toolbar.getByRole("button", { name: "Number" });
    fireEvent.click(number);
    expect(number).toHaveAttribute("aria-pressed", "true");
    expect(display(doc)).toBe("1,234.50");
    fireEvent.click(toolbar.getByRole("button", { name: "Add Decimal Place" }));
    expect(display(doc)).toBe("1,234.500");
    expect(number).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(toolbar.getByRole("button", { name: "Delete Decimal Place" }));
    expect(display(doc)).toBe("1,234.50");
    fireEvent.click(screen.getByRole("menuitem", { name: "Format" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Number Format" }));
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Thousands Separator" }));
    expect(display(doc)).toBe("1234.50");
    expect(doc.GetValue(a1)).toBe(1234.5);
  } finally {
    cleanup();
    session.Close();
  }
});

it("uses native categories, mixed selection, and the explicit UInt32 currency argument", /** Uses native categories, mixed selection, and the explicit UInt32 currency argument. @returns Nothing. */ () => {
  const session = createCalcSession();
  const { controller, frame } = session;
  try {
    const doc = controller.shell.GetDocument();
    const formatter = doc.GetFormatTable();
    const dispatch = frame.GetDispatcher();
    doc.SetValue(a1, 0.25);
    for (const [command, type] of [
      ["Percent", T.PERCENT],
      ["Date", T.DATE],
      ["Time", T.TIME],
      ["Scientific", T.SCIENTIFIC],
      ["Currency", T.CURRENCY],
    ] as const) {
      const slot = `.uno:NumberFormat${command}`;
      dispatch.Execute(slot);
      expect(formatter.GetType(doc.GetNumberFormat(0, 0, 0)) & type).toBeTruthy();
      expect(dispatch.QueryState(slot).checked).toBe(true);
      dispatch.Execute(slot);
      expect(dispatch.QueryState(".uno:NumberFormatStandard").checked).toBe(true);
    }
    const euro = formatter.GetStandardFormat(T.CURRENCY, 0x0407);
    dispatch.Execute(".uno:NumberFormatCurrency", [new SfxUInt32Item(SID_NUMBER_CURRENCY, euro)]);
    expect(doc.GetNumberFormat(0, 0, 0)).toBe(euro);
    dispatch.Execute(".uno:NumberFormatCurrency", { NumberFormatCurrency: euro });
    expect(doc.GetNumberFormat(0, 0, 0)).toBe(formatter.GetStandardIndex(0x0407));
    const percent = formatter.GetFormatIndex(Index.NF_PERCENT_INT, 0x0407);
    doc.SetNumberFormat(a1, percent);
    controller.viewData.GetMarkData().SetMarkArea(new ScRange(0, 0, 0, 1, 0, 0));
    expect(dispatch.QueryState(".uno:NumberFormatPercent").checked).toBe(false);
    expect(dispatch.QueryState(".uno:NumberFormatThousands").enabled).toBe(false);
    dispatch.Execute(".uno:NumberFormatPercent");
    expect(dispatch.QueryState(".uno:NumberFormatPercent").checked).toBe(true);
    expect(doc.GetPattern(new ScAddress(1, 0, 0))?.GetItem(ATTR_VALUE_FORMAT)).toEqual(
      doc.GetPattern(a1)?.GetItem(ATTR_VALUE_FORMAT),
    );
    expect(formatter.GetType(doc.GetNumberFormat(1, 0, 0))).toBe(T.PERCENT);
    expect(controller.Undo()).toBe(true);
    expect(doc.GetNumberFormat(1, 0, 0)).toBe(0);
    expect(controller.Redo()).toBe(true);
    expect(doc.GetPattern(new ScAddress(1, 0, 0))?.GetItem(ATTR_VALUE_FORMAT)).toEqual(
      doc.GetPattern(a1)?.GetItem(ATTR_VALUE_FORMAT),
    );
    expect(formatter.GetType(doc.GetNumberFormat(1, 0, 0))).toBe(T.PERCENT);
  } finally {
    session.Close();
  }
});

it("retains the upstream time editing behavior and localized two-decimal checked state", /** Retains the upstream time editing behavior and localized two-decimal checked state. @returns Nothing. */ () => {
  const session = createCalcSession();
  const { controller, frame } = session;
  try {
    const doc = controller.shell.GetDocument();
    doc.SetNumberFormat(a1, doc.GetFormatTable().GetFormatIndex(Index.NF_NUMBER_1000DEC2, 0x0407));
    const localized = doc.GetNumberFormat(0, 0, 0);
    const dispatch = frame.GetDispatcher();
    expect(dispatch.QueryState(".uno:NumberFormatDecimal").checked).toBe(true);
    dispatch.Execute(".uno:NumberFormatDecimal");
    expect(doc.GetNumberFormat(0, 0, 0)).toBe(localized);
    controller.StartInput(ScInputMode.SC_INPUT_TYPE, "0.25");
    dispatch.Execute(".uno:NumberFormatTime");
    expect(controller.mode).not.toBe(ScInputMode.SC_INPUT_NONE);
    expect(doc.GetFormatTable().GetType(doc.GetNumberFormat(0, 0, 0))).toBe(T.TIME);
    expect(doc.GetValue(a1)).toBe(0);
  } finally {
    session.Close();
  }
});

it("reopens the elapsed-time, fraction and currency pictures generated by the shortcuts", /** Reopens the elapsed-time, fraction and currency pictures generated by the shortcuts. @returns Completion. */ async () => {
  const session = createCalcSession();
  try {
    const doc = session.controller.shell.GetDocument();
    const formatter = doc.GetFormatTable();
    const dispatch = session.frame.GetDispatcher();
    for (const [code, value, command, category] of [
      ["[HH]:MM:SS.00", 1.523405, "IncDecimals", T.TIME],
      ["# ??/??", 1234.25, "Thousands", T.FRACTION],
      ["[$€-407]#,##0.00", 1234.25, "IncDecimals", T.CURRENCY],
    ] as const) {
      const source = unicode(code);
      const key: [number] = [0];
      try {
        const error: [number] = [0];
        formatter.PutEntry(source, error, [T.ALL], key, 0x0409);
        expect(error[0]).toBe(0);
      } finally {
        source.dispose();
      }
      doc.SetValue(a1, value);
      doc.SetNumberFormat(a1, key[0]);
      const url = ".uno:NumberFormat" + command;
      expect(dispatch.QueryState(url).enabled).toBe(true);
      expect(dispatch.Execute(url)).toMatchObject({ value: true });
      const formatKey = doc.GetNumberFormat(0, 0, 0);
      expect(formatter.GetType(formatKey)).toBe(category);
      const displayed = display(doc);
      const options = formatter.GetFormatSpecialInfo(formatKey);
      expect(options.precision).toBe(category === T.FRACTION ? 2 : 3);

      const reopened = await readOdsDocument(await writeOdsDocument(doc));
      try {
        const newFormatter = reopened.GetFormatTable();
        const newKey = reopened.GetNumberFormat(0, 0, 0);
        expect(newFormatter.GetType(newKey)).toBe(category);
        expect(newFormatter.GetFormatSpecialInfo(newKey)).toEqual(options);
        expect(display(reopened)).toBe(displayed);
        expect(reopened.GetValue(a1)).toBeCloseTo(value, 12);
        if (category === T.CURRENCY) {
          const entry = newFormatter.GetEntry(newKey);
          expect(entry && text(entry.GetFormatstring())).toContain("[$€-407]");
        }
      } finally {
        reopened.Dispose();
      }
    }
  } finally {
    session.Close();
  }
});

it("classifies distinct percent keys according to the source's contiguous column-run lookup", /** Classifies distinct percent keys according to the source's contiguous column-run lookup. @returns Nothing. */ () => {
  const session = createCalcSession();
  try {
    const doc = session.controller.shell.GetDocument();
    const formatter = doc.GetFormatTable();
    const integer = formatter.GetFormatIndex(Index.NF_PERCENT_INT);
    const decimal = formatter.GetFormatIndex(Index.NF_PERCENT_DEC2);
    doc.SetNumberFormat(a1, integer);
    doc.SetNumberFormat(new ScAddress(0, 1, 0), decimal);
    doc.SetNumberFormat(new ScAddress(1, 0, 0), decimal);
    const marks = session.controller.viewData.GetMarkData();
    const dispatch = session.frame.GetDispatcher();
    marks.SetMarkArea(new ScRange(0, 0, 0, 0, 1, 0));
    expect(dispatch.QueryState(".uno:NumberFormatPercent").checked).toBe(false);
    marks.ResetMark();
    marks.SetMarkArea(new ScRange(0, 0, 0, 1, 0, 0));
    expect(dispatch.QueryState(".uno:NumberFormatPercent").checked).toBe(true);
    expect(dispatch.QueryState(".uno:NumberFormatThousands").enabled).toBe(false);
  } finally {
    session.Close();
  }
});
