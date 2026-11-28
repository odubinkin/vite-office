/** @fileoverview Native Calc cell text layout through the mounted grid and the source ODS fixture. */
import { readFileSync } from "node:fs";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, assert, expect, it } from "vitest";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { SvxHorJustifyItem } from "../../../editeng/inc/justifyitem";
import { SvxCellHorJustify } from "../../../editeng/inc/svxenum";
import { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import { NfIndexTableOffset as Index } from "../../../svl/inc/zforlist";
import { SvxRotateMode, SvxRotateModeItem } from "../../../svx/inc/rotmodit";
import { ATTR_HOR_JUSTIFY, ATTR_ROTATE_MODE, ATTR_VERTICAL_ASIAN } from "../../inc/scitems";
import { ScAddress } from "../../inc/address";
import { ScLineBreakCell, ScRotateValueItem, ScVerticalStackCell } from "../../inc/attrib";
import { getCellTextLayout } from "../../source/ui/view/output2";
import { readOdsDocument, writeOdsDocument } from "../../source/filter/xml/xmlwrap";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";

let session: ReturnType<typeof createCalcSession> | undefined;
afterEach(
  /** Releases the mounted grid and native workbook. @returns Nothing. */ () => {
    cleanup();
    session?.Close();
    session = undefined;
  },
);

/** Opens a session for setting up real cell formats. @returns Live Calc session. */
function create() {
  session = createCalcSession();
  return session;
}

/** Finds the existing text box owned by the named grid cell. @param address - Cell address. @returns Painted text. */
function cellText(address: string): HTMLElement {
  const cell = screen.getByRole("gridcell", { name: new RegExp(`^${address}(?: |$)`) });
  const text = document.getElementById(`${cell.id}-text`);
  assert(text);
  return text;
}

it("paints the stacked Asian setting from Format Cells and restores it through history", /** Drives the original slot through the mounted workbook. @returns Completion. */ async () => {
  const current = create();
  const doc = current.controller.shell.GetDocument();
  const value = unicode("漢字 Latin");
  doc.SetTextCell(new ScAddress(), value);
  value.dispose();
  render(<CalcWorkbench {...current} />);
  act(
    /** Opens the original notebook. @returns Nothing. */ () => {
      current.frame.GetDispatcher().Execute(".uno:FormatCellDialog");
    },
  );
  const modal = within(screen.getByRole("dialog", { name: "Format Cells" }));
  fireEvent.click(modal.getByRole("tab", { name: "Alignment" }));
  fireEvent.click(modal.getByRole("checkbox", { name: "Vertically stacked" }));
  fireEvent.click(modal.getByRole("checkbox", { name: "Asian layout mode" }));
  await act(
    /** Applies the typed selection update. @returns Completion. */ async () => {
      fireEvent.click(modal.getByRole("button", { name: "OK" }));
    },
  );
  expect(cellText("A1").style.writingMode).toBe("vertical-rl");
  expect(cellText("A1").style.textOrientation).toBe("mixed");
  expect(cellText("A1").style.alignSelf).toBe("end");
  expect(cellText("A1").parentElement).toHaveStyle({ justifyContent: "flex-start" });
  expect(cellText("A1")).toHaveTextContent("漢字 Latin");
  const copy = await readOdsDocument(await writeOdsDocument(doc));
  try {
    const pattern = copy.GetPattern(new ScAddress());
    expect((pattern?.GetItem(ATTR_VERTICAL_ASIAN) as SfxBoolItem).GetValue()).toBe(true);
  } finally {
    copy.DisposeAttributes();
  }
  act(
    /** Undoes the applied alignment. @returns Nothing. */ () => {
      expect(current.controller.Undo()).toBe(true);
    },
  );
  expect(cellText("A1").style.writingMode).toBe("");
});

it("distinguishes source wrapping, stacked text, quarter turns, and unrotated filled cells", /** Checks the real grid's resolved output choices. @returns Nothing. */ () => {
  const current = create();
  const doc = current.controller.shell.GetDocument();
  const label = unicode("Cell text");
  for (let column = 0; column < 5; column++) doc.SetTextCell(new ScAddress(column, 0), label);
  label.dispose();
  doc.ApplyAttr(0, 0, 0, new ScVerticalStackCell(true));
  doc.ApplyAttr(1, 0, 0, new ScRotateValueItem(9000));
  doc.ApplyAttr(2, 0, 0, new ScRotateValueItem(4500));
  doc.ApplyAttr(
    2,
    0,
    0,
    new SvxRotateModeItem(SvxRotateMode.SVX_ROTATE_MODE_TOP, ATTR_ROTATE_MODE),
  );
  doc.ApplyAttr(3, 0, 0, new ScRotateValueItem(27000));
  doc.ApplyAttr(3, 0, 0, new SvxHorJustifyItem(SvxCellHorJustify.Repeat, ATTR_HOR_JUSTIFY));
  doc.ApplyAttr(3, 0, 0, new ScLineBreakCell(true));
  doc.ApplyAttr(4, 0, 0, new ScRotateValueItem(18000));
  doc.ApplyAttr(
    4,
    0,
    0,
    new SvxRotateModeItem(SvxRotateMode.SVX_ROTATE_MODE_BOTTOM, ATTR_ROTATE_MODE),
  );
  for (const row of [1, 2]) {
    doc.SetValue(new ScAddress(0, row), 12345.6789);
    doc.ApplyAttr(0, row, 0, new ScLineBreakCell(true));
  }
  doc.SetNumberFormat(
    new ScAddress(0, 1),
    doc.GetFormatTable().GetFormatIndex(Index.NF_NUMBER_1000DEC2),
  );
  doc.SetNumberFormat(
    new ScAddress(0, 2),
    doc.GetFormatTable().GetFormatIndex(Index.NF_PERCENT_DEC2),
  );
  render(<CalcWorkbench {...current} />);
  expect(cellText("A1").style.textOrientation).toBe("upright");
  expect(cellText("B1").style.textOrientation).toBe("sideways");
  expect(cellText("B1").style.transform).toBe("rotate(180deg)");
  expect(cellText("C1").style.transform).toBe("rotate(-45deg)");
  expect(cellText("C1").style.transformOrigin).toBe("50% 0%");
  expect(cellText("D1").style.writingMode).toBe("");
  expect(cellText("D1").style.whiteSpace).toBe("pre-wrap");
  expect(cellText("E1").style.transform).toBe("rotate(-179.5deg)");
  expect(cellText("E1").style.transformOrigin).toBe("50% 50%");
  expect(cellText("A2").style.whiteSpace).toBe("pre");
  expect(cellText("A3").style.whiteSpace).toBe("pre-wrap");
});

it("ports the tdf121040 source ODS row-height check", /** Checks the first nine rows from the pinned Calc workbook. @returns Completion. */ async () => {
  const bytes = new Uint8Array(
    readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/ods/tdf121040.ods"),
  );
  const doc = await readOdsDocument(bytes);
  try {
    const height = doc.GetRowHeight(0, 0, false);
    for (let row = 1; row < 9; row++) expect(doc.GetRowHeight(row, 0, false)).toBe(height);
  } finally {
    doc.DisposeAttributes();
  }
});

it("uses conditional cell attributes ahead of direct paint settings", /** Resolves the real conditional item set over the owning native pool. @returns Nothing. */ () => {
  const current = create();
  const doc = current.controller.shell.GetDocument();
  const pos = new ScAddress(0, 0, 0);
  doc.ApplyAttr(0, 0, 0, new ScRotateValueItem(4500));
  const pattern = doc.GetPattern(pos);
  assert(pattern);
  const conditional = pattern.GetItemSet().Clone(false);
  try {
    conditional.Put(new ScVerticalStackCell(true));
    conditional.Put(new SfxBoolItem(ATTR_VERTICAL_ASIAN, true));
    conditional.Put(new ScLineBreakCell(true));
    expect(getCellTextLayout(doc, pos, pattern, conditional)).toMatchObject({
      asianVertical: true,
      lineBreak: true,
      rotation: 0,
    });
    expect(getCellTextLayout(doc, pos, pattern).rotation).toBe(4500);
  } finally {
    conditional.Dispose();
  }
});
