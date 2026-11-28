/** @fileoverview Format Cells tests over the real Calc frame, imported formatting and undo owners. */
import { afterEach, assert, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { implementations } from "../../../desktop/browser/app/uno-components";
import { InitApplicationServiceManager } from "../../../desktop/source/app/appinit";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import type { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import { SfxRequest } from "../../../sfx2/source/control/request";
import { SvNumFormatType as T } from "../../../svl/inc/zforlist";
import { SvxHorJustifyItem, SvxJustifyMethodItem } from "../../../editeng/inc/justifyitem";
import { SvxCellHorJustify, SvxCellJustifyMethod } from "../../../editeng/inc/svxenum";
import { SvxBrushItem } from "../../../editeng/inc/brushitem";
import { ComplexColor } from "../../../docmodel/inc/color/ComplexColor";
import { ThemeColorType } from "../../../docmodel/inc/theme/ThemeColorType";
import { Color } from "../../../tools/inc/color";
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
import { SvxRotateMode, SvxRotateModeItem } from "../../../svx/inc/rotmodit";
import { ScAddress, ScRange } from "../../inc/address";
import { ScProtectionAttr, ScLineBreakCell, ScRotateValueItem } from "../../inc/attrib";
import {
  ATTR_BACKGROUND,
  ATTR_LINEBREAK,
  ATTR_PROTECTION,
  ATTR_VERTICAL_ASIAN,
  ATTR_ROTATE_VALUE,
  ATTR_ROTATE_MODE,
  ATTR_HOR_JUSTIFY,
  ATTR_HOR_JUSTIFY_METHOD,
} from "../../inc/scitems";
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
    localStorage.clear();
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

it("ports the scientific options regression and keeps cancellation outside the document format table", /** Verifies automatic recognition through the actual input line and cancels a scientific draft. @returns Completion. */ async () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  const line = screen.getByRole("textbox", { name: "Input line" });
  fireEvent.focus(line);
  fireEvent.change(line, { target: { value: "1e-2" } });
  fireEvent.click(screen.getByRole("button", { name: "Accept input" }));
  expect(doc.GetValue(new ScAddress())).toBe(0.01);
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
  fireEvent.click(modal.getByRole("checkbox", { name: "Asian layout mode" }));
  fireEvent.click(modal.getByRole("checkbox", { name: "Wrap text automatically" }));
  fireEvent.click(modal.getByRole("checkbox", { name: "Hyphenation active" }));
  fireEvent.change(modal.getByLabelText("Text direction"), { target: { value: "0" } });
  fireEvent.click(modal.getByRole("tab", { name: "Background" }));
  const background = within(modal.getByRole("tabpanel", { name: "Background" }));
  fireEvent.click(background.getByRole("button", { name: "Color" }));
  fireEvent.change(background.getByLabelText("Custom Color"), { target: { value: "#1c8843" } });
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
      expect((pattern?.GetItem(ATTR_VERTICAL_ASIAN) as SfxBoolItem).GetValue()).toBe(true);
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

it("uses the native Add, Edit Comment and Remove controls for document number formats" /** Drives real formatter entries and defers catalog deletion through the typed response. @returns Completion. */, async () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  const formatter = doc.GetFormatTable();
  const code = '0.0000" custom unit"';
  open();
  let modal = dialog();
  expect(modal.getByRole("button", { name: /^Add$/ })).toBeDisabled();
  expect(modal.getByRole("button", { name: /^Remove$/ })).toBeDisabled();
  fireEvent.change(modal.getByRole("textbox", { name: "Format Code" }), {
    target: { value: code },
  });
  fireEvent.click(modal.getByRole("button", { name: "Edit Comment" }));
  const comment = modal.getByRole("textbox", { name: "Comment" });
  fireEvent.change(comment, { target: { value: "Data export" } });
  fireEvent.blur(comment);
  fireEvent.click(modal.getByRole("button", { name: /^Add$/ }));
  expect(modal.getByRole("button", { name: /^Add$/ })).toBeDisabled();
  expect(modal.getByRole("button", { name: /^Remove$/ })).toBeEnabled();
  expect(modal.getByText("Data export")).toBeVisible();
  await accept();

  const key = doc.GetNumberFormat(0, 0, 0);
  expect(formatter.IsUserDefined(key)).toBe(true);
  const saved = formatter.GetEntry(key);
  assert(saved);
  expect(text(saved.GetComment())).toBe("Data export");
  const reopened = await readOdsDocument(await writeOdsDocument(doc));
  try {
    const format = reopened.GetFormatTable().GetEntry(reopened.GetNumberFormat(0, 0, 0));
    assert(format);
    expect(text(format.GetComment())).toBe("Data export");
  } finally {
    reopened.Dispose();
  }

  open();
  modal = dialog();
  expect(modal.getByText("Data export")).toBeVisible();
  fireEvent.click(modal.getByRole("button", { name: "Edit Comment" }));
  const updated = modal.getByRole("textbox", { name: "Comment" });
  fireEvent.change(updated, { target: { value: "Measurement" } });
  fireEvent.blur(updated);
  fireEvent.click(modal.getByRole("button", { name: /^Remove$/ }));
  expect(formatter.GetEntry(key)).not.toBeNull();
  fireEvent.click(modal.getByRole("button", { name: "Cancel" }));
  expect(formatter.GetEntry(key)).toBe(saved);
  expect(text(saved.GetComment())).toBe("Measurement");

  open();
  modal = dialog();
  fireEvent.click(modal.getByRole("button", { name: /^Remove$/ }));
  await accept();
  expect(formatter.GetEntry(key)).toBeNull();
  expect(doc.GetNumberFormat(0, 0, 0)).not.toBe(key);
});

it("rolls back a newly added format on Cancel and accepts a comment on implicit Add" /** Checks the known native Add side effect and its acceptance boundary. @returns Completion. */, async () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  const formatter = doc.GetFormatTable();
  const code = '0.0000" temporary"';
  const size = formatter.GetROFormatData().GetFormatEntryMap().size;
  open();
  let modal = dialog();
  fireEvent.change(modal.getByRole("textbox", { name: "Format Code" }), {
    target: { value: code },
  });
  fireEvent.click(modal.getByRole("button", { name: /^Add$/ }));
  expect(formatter.GetROFormatData().GetFormatEntryMap().size).toBe(size + 1);
  await act(
    /** Waits for the dismissed dialog's formatter cleanup. @returns Completion. */ async () => {
      fireEvent.click(modal.getByRole("button", { name: "Cancel" }));
    },
  );
  expect(formatter.GetROFormatData().GetFormatEntryMap().size).toBe(size);

  open();
  modal = dialog();
  fireEvent.change(modal.getByRole("textbox", { name: "Format Code" }), {
    target: { value: code },
  });
  fireEvent.click(modal.getByRole("button", { name: "Edit Comment" }));
  const comment = modal.getByRole("textbox", { name: "Comment" });
  fireEvent.change(comment, { target: { value: "Reviewed" } });
  fireEvent.blur(comment);
  await accept();
  expect(formatter.IsUserDefined(doc.GetNumberFormat(0, 0, 0))).toBe(true);
  const saved = formatter.GetEntry(doc.GetNumberFormat(0, 0, 0));
  assert(saved);
  expect(text(saved.GetComment())).toBe("Reviewed");

  const reopened = await readOdsDocument(await writeOdsDocument(doc));
  try {
    const reopenedEntry = reopened.GetFormatTable().GetEntry(reopened.GetNumberFormat(0, 0, 0));
    assert(reopenedEntry);
    expect(text(reopenedEntry.GetComment())).toBe("Reviewed");
  } finally {
    reopened.Dispose();
  }
});

/** Opens the shared Area presentation through the native Calc Background tab. @returns Dialog and background queries. */
function backgroundPage() {
  open();
  const modal = dialog();
  fireEvent.click(modal.getByRole("tab", { name: "Background" }));
  return { modal, area: within(modal.getByRole("tabpanel", { name: "Background" })) };
}

it("uses the native Background palette, preview, Reset and selected-cell history", /** Verifies Calc's original no-fill and color choices and the common brush transaction. @returns Completion. */ async () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  const mark = new ScRange(0, 0, 0, 1, 0, 0);
  controller.viewData.GetMarkData().SetMarkArea(mark);
  let { modal, area } = backgroundPage();
  const fills = within(area.getByRole("group", { name: "Fill style" }));
  expect(fills.getAllByRole("button")).toHaveLength(2);
  expect(fills.getByRole("button", { name: "None" })).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(fills.getByRole("button", { name: "Color" }));
  fireEvent.click(area.getByRole("button", { name: "Red" }));
  expect(area.getByLabelText("Custom Color")).toHaveValue("#ff0000");
  expect(area.getByText("Previous")).toBeVisible();
  expect(area.getByText("New")).toBeVisible();
  fireEvent.click(modal.getByRole("button", { name: "Reset" }));
  expect(area.getByRole("button", { name: "None" })).toHaveAttribute("aria-pressed", "true");
  await accept();
  expect(controller.shell.GetUndoManager().GetUndoActionCount()).toBe(0);

  ({ modal, area } = backgroundPage());
  fireEvent.click(area.getByRole("button", { name: "Color" }));
  fireEvent.click(area.getByRole("button", { name: "Red" }));
  fireEvent.click(modal.getByRole("button", { name: "Cancel" }));
  expect(controller.shell.GetUndoManager().GetUndoActionCount()).toBe(0);

  ({ area } = backgroundPage());
  fireEvent.click(area.getByRole("button", { name: "Color" }));
  fireEvent.click(area.getByRole("button", { name: "Red" }));
  await accept();
  const brush =
    /** Reads selected native brush state. @param col - Selected column. @returns Actual brush. */ (
      col: number,
    ) => doc.GetPattern(new ScAddress(col, 0, 0))?.GetItem(ATTR_BACKGROUND) as SvxBrushItem;
  expect(brush(0).GetColor().toUInt32()).toBe(0xff0000);
  expect(brush(1).GetColor().toUInt32()).toBe(0xff0000);
  expect(controller.shell.GetUndoManager().GetUndoActionCount()).toBe(1);
  act(
    /** Applies the one actual grouped background undo. @returns Nothing. */
    () => {
      expect(controller.Undo()).toBe(true);
    },
  );
  expect(brush(0).GetColor().IsTransparent()).toBe(true);
  expect(brush(1).GetColor().IsTransparent()).toBe(true);

  act(
    /** Restores the applied group color before clearing the fill. @returns Nothing. */ () => {
      expect(controller.Redo()).toBe(true);
    },
  );
  ({ area } = backgroundPage());
  fireEvent.click(area.getByRole("button", { name: "None" }));
  await accept();
  expect(brush(0).GetColor().IsTransparent()).toBe(true);
  expect(brush(1).GetColor().IsTransparent()).toBe(true);
});

it("keeps unchanged themed brushes and retains the pinned visited partial-opacity transfer", /** Covers the source full-color comparison and native Background visit boundary. @returns Completion. */ async () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  const color = new Color(0xff0000);
  const themed = new SvxBrushItem(
    color,
    ComplexColor.Theme(ThemeColorType.Accent2),
    ATTR_BACKGROUND,
  );
  doc.ApplyAttr(0, 0, 0, themed);
  let { area } = backgroundPage();
  fireEvent.click(area.getByRole("button", { name: "Red" }));
  await accept();
  const current = /** Reads the original selected background brush. @returns Actual brush. */ () =>
    doc.GetPattern(new ScAddress())?.GetItem(ATTR_BACKGROUND) as SvxBrushItem;
  expect(current().getComplexColor().getThemeColorType()).toBe(ThemeColorType.Accent2);
  expect(controller.shell.GetUndoManager().GetUndoActionCount()).toBe(0);

  color.SetAlpha(128);
  doc.ApplyAttr(0, 0, 0, new SvxBrushItem(color, ATTR_BACKGROUND));
  open();
  await accept();
  expect(current().GetColor().GetAlpha()).toBe(128);
  const canceled = backgroundPage();
  fireEvent.click(canceled.modal.getByRole("button", { name: "Cancel" }));
  expect(current().GetColor().GetAlpha()).toBe(128);
  ({ area } = backgroundPage());
  expect(area.getByLabelText("Custom Color")).toHaveValue("#ff0000");
  await accept();
  expect(current().GetColor().GetAlpha()).toBe(255);
  act(
    /** Reverts the native change to the original semi-transparent brush. @returns Nothing. */
    () => {
      expect(controller.Undo()).toBe(true);
    },
  );
  expect(current().GetColor().GetAlpha()).toBe(128);
});

it("ports the original Background selector palettes and their named recent colors", /** Replays the source palette positions and opens another cell to pick its last named color. @returns Completion. */ async () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  let { area } = backgroundPage();
  fireEvent.click(area.getByRole("button", { name: "Color" }));
  const palette = area.getByRole("combobox", { name: "Palette" });
  const rows = [
    [
      "Chart Palettes",
      12,
      [
        [1, "Chart 2", "#ff420e"],
        [4, "Chart 5", "#7e0021"],
      ],
    ],
    [
      "LibreOffice",
      32,
      [
        [5, "Green Accent", "#2cee0e"],
        [29, "Yellow Accent", "#ffd74c"],
      ],
    ],
    [
      "HTML",
      139,
      [
        [0, "White", "#ffffff"],
        [119, "Navy", "#000080"],
      ],
    ],
    [
      "Freecolour HLC",
      1032,
      [
        [987, "HLC 350 60 10"],
        [574, "HLC 190 50 20"],
      ],
    ],
    [
      "Tonal",
      120,
      [
        [16, "Cyan 82%"],
        [12, "Magenta 82%"],
      ],
    ],
    ["Material", 228, [[8, "Gray 800"]]],
    ["Standard", 120, [[2, "Dark Gray 3"]]],
  ] as const;
  for (const [name, length, picks] of rows) {
    fireEvent.change(palette, { target: { value: name } });
    const colors = within(area.getByRole("group", { name: "Palette colors" })).getAllByRole(
      "button",
    );
    expect(colors).toHaveLength(length);
    for (const [index, tooltip, rgb] of picks) {
      const swatch = colors[index];
      assert(swatch);
      expect(swatch).toHaveAccessibleName(tooltip);
      if (rgb) expect(swatch).toHaveAttribute("data-rgb", rgb);
      fireEvent.click(swatch);
      expect(swatch).toHaveAttribute("aria-pressed", "true");
    }
  }

  fireEvent.change(palette, { target: { value: "Chart Palettes" } });
  fireEvent.click(area.getByRole("button", { name: "Chart 2" }));
  await accept();

  controller.viewData.SetCurX(3);
  controller.viewData.SetCurY(2);
  ({ area } = backgroundPage());
  fireEvent.click(area.getByRole("button", { name: "Color" }));
  const recent = within(area.getByRole("group", { name: "Recent Colors" })).getAllByRole("button");
  expect(recent).toHaveLength(1);
  const swatch = recent[0];
  assert(swatch);
  expect(swatch).toHaveAccessibleName("Chart 2");
  expect(swatch).toHaveAttribute("data-rgb", "#ff420e");
  fireEvent.click(swatch);
  await accept();
  const brush = doc.GetPattern(new ScAddress(3, 2, 0))?.GetItem(ATTR_BACKGROUND) as SvxBrushItem;
  expect(brush.GetColor().toUInt32()).toBe(0xff420e);
});

/** Opens the original Calc alignment page and returns its form queries. @returns Alignment panel. */
function alignmentPage() {
  open();
  const modal = dialog();
  fireEvent.click(modal.getByRole("tab", { name: "Alignment" }));
  return { modal, alignment: within(modal.getByRole("tabpanel", { name: "Alignment" })) };
}

it("tracks the native orientation dial and its three reference edges through grouped history", /** Exercises a drag through the dial and verifies the actual selected native angle and mode. @returns Completion. */ async () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  controller.viewData.GetMarkData().SetMarkArea(new ScRange(0, 0, 0, 1, 0, 0));
  const { alignment } = alignmentPage();
  const horizontal = alignment.getByRole("combobox", { name: "Horizontal" });
  const angle = alignment.getByRole("spinbutton", { name: "Degrees" });
  const dial = alignment.getByRole("slider", { name: "Rotation dial" });
  const stacked = alignment.getByRole("checkbox", { name: "Vertically stacked" });
  const asian = alignment.getByRole("checkbox", { name: "Asian layout mode" });
  const hyphen = alignment.getByRole("checkbox", { name: "Hyphenation active" });
  const shrink = alignment.getByRole("checkbox", { name: "Shrink to fit cell size" });
  expect(alignment.getAllByRole("radio")).toHaveLength(3);
  expect(
    alignment.getByRole("radio", { name: "Text Extension From Lower Cell Border" }),
  ).toBeChecked();
  expect(asian).toBeDisabled();
  expect(hyphen).toBeDisabled();
  expect(shrink).toBeEnabled();
  fireEvent.change(horizontal, { target: { value: "5" } });
  expect(angle).toBeDisabled();
  expect(stacked).toBeDisabled();
  expect(shrink).toBeDisabled();
  fireEvent.change(horizontal, { target: { value: "6" } });
  expect(hyphen).toBeDisabled();
  expect(shrink).toBeDisabled();
  fireEvent.change(horizontal, { target: { value: "4" } });
  expect(hyphen).toBeEnabled();
  expect(shrink).toBeDisabled();
  fireEvent.change(horizontal, { target: { value: "1" } });
  const indent = alignment.getByRole("spinbutton", { name: "Indent" });
  fireEvent.keyDown(indent, { key: "ArrowUp" });
  expect(indent).toHaveValue(10);

  fireEvent.change(angle, { target: { value: "33" } });
  expect(dial).toHaveAttribute("aria-valuenow", "33");
  dial.getBoundingClientRect =
    /** Supplies fixed dial geometry to the browser event runner. @returns Dial bounds. */ () =>
      new DOMRect(0, 0, 100, 100);
  /** Dispatches an actual left pointer event within the dial. @param type - Pointer event type. @param x - Horizontal coordinate. @param y - Vertical coordinate. @returns Nothing. */
  function pointer(type: string, x: number, y: number): void {
    const event = new MouseEvent(type, { bubbles: true, clientX: x, clientY: y, button: 0 });
    Object.defineProperties(event, { pointerId: { value: 1 }, isPrimary: { value: true } });
    fireEvent(dial, event);
  }
  pointer("pointerdown", 90, 30);
  expect(angle).toHaveValue(30);
  fireEvent.keyDown(dial, { key: "Escape" });
  expect(angle).toHaveValue(33);
  expect(angle).toHaveFocus();
  pointer("pointerdown", 90, 30);
  expect(angle).toHaveValue(30);
  pointer("pointermove", 90, 20);
  expect(angle).toHaveValue(37);
  pointer("pointerup", 90, 20);
  expect(angle).toHaveFocus();
  fireEvent.click(alignment.getByRole("radio", { name: "Text Extension From Upper Cell Border" }));
  await accept();

  for (const column of [0, 1]) {
    const pattern = doc.GetPattern(new ScAddress(column, 0, 0));
    expect((pattern?.GetItem(ATTR_ROTATE_VALUE) as ScRotateValueItem).GetValue()).toBe(3700);
    expect((pattern?.GetItem(ATTR_ROTATE_MODE) as SvxRotateModeItem).GetValue()).toBe(
      SvxRotateMode.SVX_ROTATE_MODE_TOP,
    );
  }
  expect(controller.shell.GetUndoManager().GetUndoActionCount()).toBe(1);
  act(
    /** Reverts the grouped alignment change on both selected cells. @returns Nothing. */ () => {
      expect(controller.Undo()).toBe(true);
    },
  );
  expect(
    (
      doc.GetPattern(new ScAddress(1, 0, 0))?.GetItem(ATTR_ROTATE_VALUE) as ScRotateValueItem
    ).GetValue(),
  ).toBe(0);
});

it("cycles the original mixed alignment checkbox and restores it on Reset and Cancel", /** Preserves true and false values until a mixed check reaches a saved change. @returns Nothing. */ () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  doc.ApplyAttr(0, 0, 0, new ScLineBreakCell(true));
  controller.viewData.GetMarkData().SetMarkArea(new ScRange(0, 0, 0, 1, 0, 0));
  const { modal, alignment } = alignmentPage();
  const wrap = alignment.getByRole("checkbox", { name: "Wrap text automatically" });
  const shrink = alignment.getByRole("checkbox", { name: "Shrink to fit cell size" });
  expect(wrap).toBePartiallyChecked();
  expect(shrink).toBeDisabled();
  fireEvent.click(wrap);
  expect(wrap).not.toBeChecked();
  expect(wrap).not.toBePartiallyChecked();
  expect(shrink).toBeEnabled();
  fireEvent.click(wrap);
  expect(wrap).toBeChecked();
  fireEvent.click(wrap);
  expect(wrap).toBePartiallyChecked();
  fireEvent.click(wrap);
  fireEvent.click(modal.getByRole("button", { name: "Reset" }));
  expect(wrap).toBePartiallyChecked();
  fireEvent.click(modal.getByRole("button", { name: "Cancel" }));
  expect(
    (doc.GetPattern(new ScAddress())?.GetItem(ATTR_LINEBREAK) as ScLineBreakCell).GetValue(),
  ).toBe(true);
  expect(
    (doc.GetPattern(new ScAddress(1, 0, 0))?.GetItem(ATTR_LINEBREAK) as ScLineBreakCell).GetValue(),
  ).toBe(false);
  expect(controller.shell.GetUndoManager().GetUndoActionCount()).toBe(0);
});

it("preserves the pinned justify-method rewrite after visiting a mixed Alignment page", /** Keeps the source independent method exchange when the mixed alignment combo has no active row. @returns Completion. */ async () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  for (const [column, align] of [
    [0, SvxCellHorJustify.Block],
    [1, SvxCellHorJustify.Left],
  ] as const) {
    doc.ApplyAttr(column, 0, 0, new SvxHorJustifyItem(align, ATTR_HOR_JUSTIFY));
    doc.ApplyAttr(
      column,
      0,
      0,
      new SvxJustifyMethodItem(SvxCellJustifyMethod.Distribute, ATTR_HOR_JUSTIFY_METHOD),
    );
  }
  controller.viewData.GetMarkData().SetMarkArea(new ScRange(0, 0, 0, 1, 0, 0));
  /** Reads the actual justification method carried by the selected cell. @param column - Selected column. @returns Stored method. */
  function method(column: number): SvxCellJustifyMethod {
    return (
      doc
        .GetPattern(new ScAddress(column, 0, 0))
        ?.GetItem(ATTR_HOR_JUSTIFY_METHOD) as SvxJustifyMethodItem
    ).GetValue();
  }
  open();
  await accept();
  expect(method(0)).toBe(SvxCellJustifyMethod.Distribute);
  const { alignment } = alignmentPage();
  expect(alignment.getByRole("combobox", { name: "Horizontal" })).toHaveValue("");
  await accept();
  expect(method(0)).toBe(SvxCellJustifyMethod.Auto);
  expect(method(1)).toBe(SvxCellJustifyMethod.Auto);
  expect(
    (doc.GetPattern(new ScAddress())?.GetItem(ATTR_HOR_JUSTIFY) as SvxHorJustifyItem).GetValue(),
  ).toBe(SvxCellHorJustify.Block);
  expect(controller.shell.GetUndoManager().GetUndoActionCount()).toBe(1);
});
