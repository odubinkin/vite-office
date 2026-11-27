/** @fileoverview Format Cells tests over the real Calc frame, imported formatting and undo owners. */
import { afterEach, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { implementations } from "../../../desktop/browser/app/uno-components";
import { InitApplicationServiceManager } from "../../../desktop/source/app/appinit";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import type { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import { SfxRequest } from "../../../sfx2/source/control/request";
import { SvNumFormatType as T } from "../../../svl/inc/zforlist";
import type { SvxBrushItem } from "../../../editeng/inc/brushitem";
import {
  ATTR_BORDER,
  ATTR_MARGIN,
  ATTR_FORBIDDEN_RULES,
  ATTR_FONT_HEIGHT,
  ATTR_CJK_FONT_HEIGHT,
  ATTR_CTL_FONT_HEIGHT,
  ATTR_FONT_RELIEF,
  ATTR_FONT_UNDERLINE,
  ATTR_FONT_EMPHASISMARK,
} from "../../inc/scitems";
import { SvxMarginItem } from "../../../svx/source/items/algitem";
import { SvxBoxItem } from "../../../editeng/source/items/frmitems";
import { SvxFontHeightItem } from "../../../editeng/source/items/textitem.height";
import { SvxCharReliefItem, SvxUnderlineItem } from "../../../editeng/source/items/textitem";
import { SvxEmphasisMarkItem } from "../../../editeng/source/items/textitem.effects";
import { FontEmphasisMark } from "../../../tools/inc/fontenum";
import {
  ATTR_BORDER_TLBR,
  ATTR_CJK_FONT_LANGUAGE,
  ATTR_CTL_FONT_LANGUAGE,
  ATTR_SHADOW,
} from "../../inc/scitems";
import { LANGUAGE_NONE } from "../../../i18nlangtag/inc/lang";
import { SvxLanguageItem } from "../../../editeng/source/items/textitem.language";
import { SvxLineItem } from "../../../editeng/inc/lineitem";
import { SvxShadowItem } from "../../../editeng/source/items/frmitems.shadow";
import { SvxShadowLocation } from "../../../editeng/inc/svxenum";
import { ScAddress, ScRange } from "../../inc/address";
import { ScProtectionAttr, ScLineBreakCell } from "../../inc/attrib";
import { ATTR_BACKGROUND, ATTR_LINEBREAK, ATTR_PROTECTION } from "../../inc/scitems";
import { FID_CELL_FORMAT } from "../../source/ui/attrdlg/attrdlg";
import { readOdsDocument, writeOdsDocument } from "../../source/filter/xml/xmlwrap";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";

InitApplicationServiceManager(implementations);

let session: ReturnType<typeof createCalcSession> | undefined;
afterEach(
  /** Releases the mounted Calc test session. @returns Nothing. */ () => {
    cleanup();
    session?.Close();
    session = undefined;
  },
);

/** Mounts the actual Calc session. @returns Live session. */
function mount() {
  session = createCalcSession();
  render(<CalcWorkbench {...session} />);
  return session;
}

/** Gets the current async dialog. @returns Native modal queries. */
function dialog() {
  return within(screen.getByRole("dialog", { name: "Format Cells" }));
}

/** Submits the current dialog and permits the actual async request to complete. @returns Completion. */
async function accept(): Promise<void> {
  await act(
    /** Accepts the pending modal response. @returns Completion. */ async () =>
      fireEvent.click(dialog().getByRole("button", { name: "OK" })),
  );
}

/** Dispatches the original no-argument cell command. @returns Nothing. */
function open(): void {
  act(
    /** Requests the dialog from the active native frame. @returns Nothing. */ () => {
      session?.frame.GetDispatcher().Execute(".uno:FormatCellDialog");
    },
  );
}

it("ports the original Numbers options result, locale and stored picture through reopen", /** Verifies native number options and locale after reopening. @returns Completion. */ async () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  fireEvent.click(screen.getByRole("menuitem", { name: "Format" }));
  fireEvent.click(screen.getByRole("menuitem", { name: /^Format Cells/ }));
  let modal = dialog();
  fireEvent.change(modal.getByLabelText("Locale"), { target: { value: "1033" } });
  fireEvent.change(modal.getByRole("spinbutton", { name: "Decimal places" }), {
    target: { value: "1" },
  });
  fireEvent.change(modal.getByRole("spinbutton", { name: "Leading zeroes" }), {
    target: { value: "2" },
  });
  fireEvent.click(modal.getByRole("checkbox", { name: "Negative numbers red" }));
  fireEvent.click(modal.getByRole("checkbox", { name: "Thousands separator" }));
  expect(modal.getByLabelText("Format Code")).toHaveValue("#,#00.0;[RED]-#,#00.0");
  await accept();
  const key = doc.GetNumberFormat(0, 0, 0);
  expect(doc.GetFormatTable().GetFormatSpecialInfo(key)).toEqual({
    grouped: true,
    red: true,
    precision: 1,
    leadingZeros: 2,
  });
  open();
  modal = dialog();
  expect(modal.getByLabelText("Locale")).toHaveValue("1033");
  expect(modal.getByLabelText("Format Code")).toHaveValue("#,#00.0;[RED]-#,#00.0");
});

it("ports the original spell-out gallery pictures and formatted names" /** Verifies the source native-number examples are gallery labels over real format codes. @returns Nothing. */, () => {
  mount();
  open();
  const modal = dialog();
  const gallery = modal.getByRole("listbox", { name: "Format" });
  const list = within(gallery);
  for (const [label, modifier] of [
    ["one hundred", ""],
    ["One hundred", "capitalize "],
    ["One Hundred", "title "],
    ["ONE HUNDRED", "upper "],
  ] as const) {
    const row = list.getByRole("option", { name: label });
    const code = "[NatNum12 " + modifier + "cardinal]0";
    expect(row).toHaveAttribute("value", code);
    fireEvent.change(gallery, { target: { value: code } });
    expect(modal.getByLabelText("Format Code")).toHaveValue(code);
  }
});

it("ports the scientific options regression and keeps cancellation outside the document format table", /** Verifies automatic recognition through the native document and cancels a scientific draft. @returns Completion. */ async () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  const source = unicode("1e-2");
  try {
    expect(doc.SetString(new ScAddress(), source)).toBe(true);
  } finally {
    source.dispose();
  }
  const table = doc.GetFormatTable();
  const count = table.GetROFormatData().GetFormatEntryMap().size;
  open();
  const modal = dialog();
  expect(modal.getByLabelText("Category")).toHaveValue(String(T.SCIENTIFIC));
  expect(modal.getByRole("spinbutton", { name: "Decimal places" })).toHaveValue(2);
  expect(modal.getByRole("spinbutton", { name: "Decimal places" })).toBeEnabled();
  expect(modal.getByRole("spinbutton", { name: "Leading zeroes" })).toHaveValue(1);
  expect(modal.getByLabelText("Format Code")).toHaveValue("0.00E+00");
  fireEvent.change(modal.getByLabelText("Format Code"), { target: { value: "0.0000E+00" } });
  fireEvent.click(modal.getByRole("button", { name: "Cancel" }));
  expect(table.GetROFormatData().GetFormatEntryMap().size).toBe(count);
  expect(table.GetFormatSpecialInfo(doc.GetNumberFormat(0, 0, 0)).precision).toBe(2);
});

it("applies alignment, fill and protection as one attribute transaction and preserves ODS values", /** Verifies the source alignment and protection pages, ODS and history. @returns Completion. */ async () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  const pos = new ScAddress(0, 0, 0);
  doc.SetValue(pos, 45.125);
  open();
  const modal = dialog();
  fireEvent.click(modal.getByRole("tab", { name: "Alignment" }));
  const angle = modal.getByRole("spinbutton", { name: "Degrees" });
  expect(angle).toHaveValue(0);
  fireEvent.keyDown(angle, { key: "ArrowDown" });
  expect(angle).toHaveValue(355);
  fireEvent.keyDown(angle, { key: "ArrowUp" });
  expect(angle).toHaveValue(0);
  fireEvent.change(modal.getByLabelText("Vertical"), { target: { value: "1" } });
  fireEvent.change(modal.getByLabelText("Horizontal"), { target: { value: "1" } });
  fireEvent.change(modal.getByLabelText("Indent"), { target: { value: "2" } });
  fireEvent.click(modal.getByRole("checkbox", { name: "Vertically stacked" }));
  fireEvent.click(modal.getByRole("checkbox", { name: "Wrap text automatically" }));
  fireEvent.click(modal.getByRole("checkbox", { name: "Hyphenation active" }));
  fireEvent.change(modal.getByLabelText("Text direction"), { target: { value: "0" } });
  fireEvent.click(modal.getByRole("tab", { name: "Background" }));
  fireEvent.change(modal.getByLabelText("Fill"), { target: { value: "color" } });
  fireEvent.change(
    within(modal.getByRole("tabpanel", { name: "Background" })).getByLabelText("Color"),
    { target: { value: "#1c8843" } },
  );
  fireEvent.click(modal.getByRole("tab", { name: "Cell Protection" }));
  fireEvent.click(modal.getByRole("checkbox", { name: "Protected" }));
  fireEvent.click(modal.getByRole("checkbox", { name: "Hide formula" }));
  fireEvent.click(modal.getByRole("checkbox", { name: "Hide when printing" }));
  await accept();

  const checkItems =
    /** Checks stored attributes on live and imported documents. @param value - New control value. @returns Nothing. */ (
      value: typeof doc,
    ) => {
      const pattern = value.GetPattern(pos);
      expect((pattern?.GetItem(ATTR_LINEBREAK) as ScLineBreakCell).GetValue()).toBe(true);
      expect((pattern?.GetItem(ATTR_BACKGROUND) as SvxBrushItem).GetColor().GetGreen()).toBe(136);
      const protection = pattern?.GetItem(ATTR_PROTECTION) as ScProtectionAttr;
      expect([
        protection.GetProtection(),
        protection.GetHideFormula(),
        protection.GetHidePrint(),
      ]).toEqual([false, true, true]);
      expect(value.GetValue(pos)).toBe(45.125);
    };
  checkItems(doc);
  open();
  const saved = dialog();
  fireEvent.click(saved.getByRole("tab", { name: "Alignment" }));
  expect(saved.getByLabelText("Horizontal")).toHaveDisplayValue("Left");
  expect(saved.getByLabelText("Vertical")).toHaveDisplayValue("Top");
  expect(saved.getByLabelText("Indent")).toHaveValue(2);
  expect(saved.getByLabelText("Vertically stacked")).toBeChecked();
  expect(saved.getByLabelText("Wrap text automatically")).toBeChecked();
  expect(saved.getByLabelText("Hyphenation active")).toBeChecked();
  expect(saved.getByLabelText("Text direction")).toHaveValue("0");
  fireEvent.click(saved.getByRole("button", { name: "Cancel" }));
  expect(controller.shell.GetUndoManager().GetUndoActionCount()).toBe(1);
  const reopened = await readOdsDocument(await writeOdsDocument(doc));
  try {
    checkItems(reopened);
  } finally {
    reopened.Dispose();
  }
  act(
    /** Verifies undo through the native view. @returns Nothing. */ () =>
      expect(controller.Undo()).toBe(true),
  );
  expect((doc.GetPattern(pos)?.GetItem(ATTR_PROTECTION) as ScProtectionAttr).GetProtection()).toBe(
    true,
  );
  act(
    /** Verifies redo through the native view. @returns Nothing. */ () =>
      expect(controller.Redo()).toBe(true),
  );
  checkItems(doc);
});

it("uses context and keyboard entry points, preserves mixed untouched formats and accepts native typed attributes", /** Verifies alternate entry points, mixed attributes and typed requests. @returns Completion. */ async () => {
  const { controller, frame } = mount();
  const doc = controller.shell.GetDocument();
  const second = new ScAddress(1, 0, 0);
  const key = doc.GetFormatTable().GetStandardFormat(T.PERCENT);
  doc.SetNumberFormat(second, key);
  controller.viewData.GetMarkData().SetMarkArea(new ScRange(0, 0, 0, 1, 0, 0));
  fireEvent.contextMenu(screen.getByRole("gridcell", { name: "A1" }), {
    clientX: 300,
    clientY: 200,
  });
  const context = within(screen.getByRole("menu", { name: "Calc cell context menu" }));
  fireEvent.click(context.getByRole("menuitem", { name: /^Format Cells/ }));
  const modal = dialog();
  expect(modal.getByLabelText("Format Code")).toHaveValue("");
  fireEvent.click(modal.getByRole("tab", { name: "Cell Protection" }));
  fireEvent.click(modal.getByRole("checkbox", { name: "Hide formula" }));
  await accept();
  expect(doc.GetNumberFormat(0, 0, 0)).toBe(0);
  expect(doc.GetNumberFormat(1, 0, 0)).toBe(key);
  controller.viewData.GetMarkData().ResetMark();
  fireEvent.keyDown(screen.getByRole("grid", { name: "Spreadsheet" }), {
    key: "1",
    code: "Digit1",
    ctrlKey: true,
  });
  expect(dialog().getByRole("tab", { name: "Numbers" })).toHaveFocus();
  fireEvent.keyDown(dialog().getByRole("tab", { name: "Numbers" }), { key: "Escape" });
  const request = new SfxRequest(FID_CELL_FORMAT, [new ScLineBreakCell(true)]);
  await act(
    /** Waits for the typed request and verifies its dispatcher outcome. @returns Completion. */ async () => {
      const outcome = frame.GetDispatcher().ExecuteRequest(request);
      expect(outcome.status).toBe("executed");
      if (outcome.status === "executed") await outcome.value;
    },
  );
  expect(request.IsDone()).toBe(true);
  expect(
    (doc.GetPattern(new ScAddress())?.GetItem(ATTR_LINEBREAK) as ScLineBreakCell).GetValue(),
  ).toBe(true);
  const entry = doc.GetFormatTable().GetEntry(key);
  expect(entry && text(entry.GetFormatstring())).toContain("%");
});

it("ports the three script sizes and native Font Effects selections through one undo" /** Exercises the original font and effects pages and their native payload. @returns Completion. */, async () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  open();
  const modal = dialog();
  fireEvent.click(modal.getByRole("tab", { name: "Font" }));
  fireEvent.change(
    within(modal.getByRole("group", { name: "Western" })).getByRole("spinbutton", { name: "Size" }),
    { target: { value: "18" } },
  );
  for (const script of ["Asian", "Complex"]) {
    fireEvent.click(modal.getByRole("tab", { name: script }));
    const group = within(modal.getByRole("tabpanel", { name: script }));
    fireEvent.change(group.getByRole("spinbutton", { name: "Size" }), { target: { value: "18" } });
    fireEvent.change(group.getByLabelText("Language"), { target: { value: "255" } });
  }
  fireEvent.click(modal.getByRole("tab", { name: "Font Effects" }));
  const effects = within(modal.getByRole("tabpanel", { name: "Font Effects" }));
  for (const name of ["Relief", "Overlining", "Strikethrough", "Underlining", "Emphasis mark"]) {
    fireEvent.change(effects.getByRole("combobox", { name }), { target: { value: "1" } });
  }
  fireEvent.change(effects.getByRole("combobox", { name: "Position" }), {
    target: { value: String(FontEmphasisMark.PosBelow) },
  });
  await accept();
  const position = new ScAddress();
  const pattern = doc.GetPattern(position);
  for (const which of [ATTR_FONT_HEIGHT, ATTR_CJK_FONT_HEIGHT, ATTR_CTL_FONT_HEIGHT]) {
    expect((pattern?.GetItem(which) as SvxFontHeightItem).GetHeight()).toBe(360);
  }
  expect((pattern?.GetItem(ATTR_FONT_RELIEF) as SvxCharReliefItem).GetValue()).toBe(1);
  expect((pattern?.GetItem(ATTR_FONT_UNDERLINE) as SvxUnderlineItem).GetLineStyle()).toBe(1);
  expect((pattern?.GetItem(ATTR_FONT_EMPHASISMARK) as SvxEmphasisMarkItem).GetEmphasisMark()).toBe(
    FontEmphasisMark.Dot | FontEmphasisMark.PosBelow,
  );
  const reopened = await readOdsDocument(await writeOdsDocument(doc));
  try {
    const imported = reopened.GetPattern(position);
    for (const which of [ATTR_CJK_FONT_LANGUAGE, ATTR_CTL_FONT_LANGUAGE]) {
      expect((imported?.GetItem(which) as SvxLanguageItem).GetLanguage()).toBe(LANGUAGE_NONE);
    }
    expect(
      (imported?.GetItem(ATTR_FONT_EMPHASISMARK) as SvxEmphasisMarkItem).GetEmphasisMark(),
    ).toBe(FontEmphasisMark.Dot | FontEmphasisMark.PosBelow);
  } finally {
    reopened.Dispose();
  }
  expect(controller.shell.GetUndoManager().GetUndoActionCount()).toBe(1);
  act(
    /** Undoes all character attributes. @returns Nothing. */ () => {
      expect(controller.Undo()).toBe(true);
    },
  );
  expect(
    (doc.GetPattern(position)?.GetItem(ATTR_FONT_RELIEF) as SvxCharReliefItem).GetValue(),
  ).toBe(0);
});

it("ports the Calc border width defaults and writes the shared padding item beside the frame" /** Covers the restricted line styles, native grouped frame and ODS padding. @returns Completion. */, async () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  controller.viewData.GetMarkData().SetMarkArea(new ScRange(0, 0, 0, 1, 1, 0));
  open();
  const modal = dialog();
  fireEvent.click(modal.getByRole("tab", { name: "Borders" }));
  const borders = within(modal.getByRole("tabpanel", { name: "Borders" }));
  const style = borders.getByRole("combobox", { name: "Border line style" });
  const width = borders.getByRole("combobox", { name: "Border thickness" });
  expect(width).toHaveValue("75");
  expect(within(style).getAllByRole("option")).toHaveLength(7);
  fireEvent.change(style, { target: { value: "15" } });
  expect(width).toHaveValue("150");
  fireEvent.click(borders.getByRole("button", { name: "Outer Border Only" }));
  fireEvent.click(borders.getByRole("button", { name: "Top-left to bottom-right border" }));
  fireEvent.change(borders.getByRole("combobox", { name: "Position" }), {
    target: { value: String(SvxShadowLocation.BottomRight) },
  });
  fireEvent.click(borders.getByRole("checkbox", { name: "Synchronize" }));
  fireEvent.keyDown(borders.getByRole("spinbutton", { name: /^Left padding/ }), { key: "ArrowUp" });
  await accept();
  const position = new ScAddress();
  const getPattern =
    /** Reads the selected anchor. @param value - Workbook. @returns Native pattern. */
    (value: typeof doc) => value.GetPattern(position);
  const border = (getPattern(doc)?.GetItem(ATTR_BORDER) as SvxBoxItem).GetLeft();
  const margin = getPattern(doc)?.GetItem(ATTR_MARGIN) as SvxMarginItem;
  expect(border?.GetWidth()).toBeGreaterThan(0);
  expect(
    (getPattern(doc)?.GetItem(ATTR_BORDER_TLBR) as SvxLineItem).GetLine()?.GetWidth(),
  ).toBeGreaterThan(0);
  expect(margin.GetLeftMargin()).not.toBe(margin.GetRightMargin());
  expect(controller.shell.GetUndoManager().GetUndoActionCount()).toBe(1);
  const reopened = await readOdsDocument(await writeOdsDocument(doc));
  try {
    expect((getPattern(reopened)?.GetItem(ATTR_SHADOW) as SvxShadowItem).GetLocation()).toBe(
      SvxShadowLocation.BottomRight,
    );
    expect(
      (getPattern(reopened)?.GetItem(ATTR_BORDER_TLBR) as SvxLineItem).GetLine()?.GetWidth(),
    ).toBeGreaterThan(0);
    expect((getPattern(reopened)?.GetItem(ATTR_MARGIN) as SvxMarginItem).equals(margin)).toBe(true);
    expect((getPattern(reopened)?.GetItem(ATTR_BORDER) as SvxBoxItem).GetLeft()?.GetWidth()).toBe(
      border?.GetWidth(),
    );
  } finally {
    reopened.Dispose();
  }
});

/** Opens the original notebook page through Calc's active frame. @returns Dialog and Line Change queries. */
function asianTypography() {
  open();
  const modal = dialog();
  const tab = modal.getByRole("tab", { name: "Asian Typography" });
  expect(modal.getAllByRole("tab").indexOf(tab)).toBe(4);
  fireEvent.click(tab);
  return { modal, group: within(modal.getByRole("group", { name: "Line Change" })) };
}

it("ports the Calc Asian Typography selection and reopen through the original command" /** Exercises formatCells.py's A1 checkbox with the original slot admission. @returns Completion. */, async () => {
  const { controller } = mount();
  controller.viewData.GetMarkData().SetMarkArea(new ScRange(0, 0, 0, 0, 0, 0));
  const selector = { name: /^Apply list of forbidden characters/ };
  const { group } = asianTypography();
  expect(group.getByRole("checkbox", { name: "Allow hanging punctuation" })).toBeDisabled();
  expect(
    group.getByRole("checkbox", { name: "Apply spacing between Asian and non-Asian text" }),
  ).toBeDisabled();
  fireEvent.click(group.getByRole("checkbox", selector));
  await accept();
  controller.viewData.GetMarkData().SetMarkArea(new ScRange(0, 0, 0, 0, 0, 0));
  expect(asianTypography().group.getByRole("checkbox", selector)).toBeChecked();
});

it("retains the native mixed forbidden-character selection through Reset, Cancel and history" /** Exercises a mixed selection plus reversible application to the real item set. @returns Completion. */, async () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  const history = controller.shell.GetUndoManager();
  const forbidden = { name: /^Apply list of forbidden characters/ };
  const address = new ScAddress();
  let page = asianTypography();
  fireEvent.click(page.group.getByRole("checkbox", forbidden));
  await accept();
  expect(history.GetUndoActionCount()).toBe(1);

  controller.viewData.GetMarkData().SetMarkArea(new ScRange(0, 0, 0, 1, 0, 0));
  page = asianTypography();
  const rule = page.group.getByRole("checkbox", forbidden);
  expect(rule).toBePartiallyChecked();
  fireEvent.click(rule);
  fireEvent.click(page.modal.getByRole("button", { name: "Reset" }));
  expect(rule).toBePartiallyChecked();
  await accept();
  expect(history.GetUndoActionCount()).toBe(1);

  controller.viewData.GetMarkData().SetMarkArea(new ScRange(0, 0, 0, 0, 0, 0));
  page = asianTypography();
  fireEvent.click(page.group.getByRole("checkbox", forbidden));
  fireEvent.click(page.group.getByRole("checkbox", forbidden));
  await accept();
  expect(history.GetUndoActionCount()).toBe(1);

  page = asianTypography();
  fireEvent.click(page.group.getByRole("checkbox", forbidden));
  fireEvent.click(page.modal.getByRole("button", { name: "Cancel" }));
  expect(history.GetUndoActionCount()).toBe(1);

  page = asianTypography();
  expect(page.group.getByRole("checkbox", forbidden)).toBeChecked();
  fireEvent.click(page.group.getByRole("checkbox", forbidden));
  await accept();
  expect(history.GetUndoActionCount()).toBe(2);
  const read = /** Reads the cell's native boolean item. @returns Value. */ () =>
    (doc.GetPattern(address)?.GetItem(ATTR_FORBIDDEN_RULES) as SfxBoolItem).GetValue();
  expect(read()).toBe(false);
  act(
    /** Performs the original grouped format undo. @returns Nothing. */
    () => {
      expect(controller.Undo()).toBe(true);
    },
  );
  expect(read()).toBe(true);
  act(
    /** Replays the original grouped format change. @returns Nothing. */
    () => {
      expect(controller.Redo()).toBe(true);
    },
  );
  expect(read()).toBe(false);
});
