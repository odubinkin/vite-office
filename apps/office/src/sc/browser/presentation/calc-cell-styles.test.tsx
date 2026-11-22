/** @fileoverview Mounted Calc Styles menu, typed request, history, and ODS regressions. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { SfxRequest } from "../../../sfx2/source/control/request";
import { SfxUInt16Item } from "../../../svl/source/items/intitem";
import { SfxStringItem } from "../../../svl/source/items/stritem";
import { SfxStyleFamily, SfxStyleSearchBits } from "../../../svl/inc/style-values";
import type { ScDocument } from "../../inc/document";
import { ScAddress } from "../../inc/address";
import { readOdsDocument, writeOdsDocument } from "../../source/filter/xml/xmlwrap";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";

let active: ReturnType<typeof createCalcSession> | undefined;
afterEach(
  /** Releases the mounted workbench and native session. @returns Nothing. */ () => {
    cleanup();
    active?.Close();
    active = undefined;
  },
);

/** Mounts a session with actual slots and a populated row. @returns Mounted session. */
function mount() {
  active = createCalcSession();
  const doc = active.controller.shell.GetDocument();
  const label = unicode("sample");
  try {
    doc.SetTextCell(new ScAddress(0, 0), label);
    doc.SetTextCell(new ScAddress(1, 0), label);
  } finally {
    label.dispose();
  }
  render(<CalcWorkbench {...active} />);
  return { ...active, doc, dispatch: active.frame.GetDispatcher() };
}

/** Selects actual cells through the Name Box. @param address - A1 selection. @returns Nothing. */
function select(address: string): void {
  const box = screen.getByRole("textbox", { name: "Name Box" });
  fireEvent.change(box, { target: { value: address } });
  fireEvent.keyDown(box, { key: "Enter" });
}

/** Opens Styles. @returns Source menu trigger. */
function openStyles(): HTMLElement {
  const trigger = screen.getByRole("menuitem", { name: "Styles" });
  fireEvent.click(trigger);
  return trigger;
}

/** Builds an original parameterized binding URL. @param name - Programmatic cell style. @returns Native command. */
function styleCommand(name: string): string {
  return `.uno:StyleApply?Style:string=${encodeURIComponent(name)}&FamilyName:string=CellStyles`;
}

/** Reads the selected style from the actual cell pattern. @param doc - Workbook. @param cell - Cell address. @returns Style name if attached. */
function styleAt(doc: ScDocument, cell: ScAddress): string | undefined {
  const name = doc.GetPattern(cell)?.GetStyleSheet()?.GetName();
  return name && text(name);
}

/** Dispatches a command through the mounted frame. @param dispatch - Actual Calc dispatcher. @param command - Original UNO command. @returns Nothing. */
function execute(
  dispatch: ReturnType<ReturnType<typeof createCalcSession>["frame"]["GetDispatcher"]>,
  command: string,
): void {
  act(
    /** Flushes workbench state after the slot executes. @returns Nothing. */ () => {
      dispatch.Execute(command);
    },
  );
}

it("uses native radio presets and synchronizes mixed selection, inherited rendering, and history", /** Exercises the native radio group and cell style history. @returns Completion. */ async () => {
  const { dispatch, doc } = mount();
  select("A1");
  openStyles();
  const radios = screen.getAllByRole("menuitemradio");
  const names = [
    "Default",
    "Accent 1",
    "Accent 2",
    "Accent 3",
    "Heading 1",
    "Heading 2",
    "Good",
    "Bad",
    "Neutral",
    "Error",
    "Warning",
    "Footnote",
    "Note",
  ];
  expect(radios).toHaveLength(names.length);
  for (const [index, name] of names.entries()) expect(radios[index]).toHaveAccessibleName(name);
  expect(screen.getByRole("menuitemradio", { name: "Default" })).toBeChecked();
  const good = screen.getByRole("menuitemradio", { name: "Good" });
  await act(
    /** Activates Good from the mounted menu. @returns Click result. */ async () =>
      fireEvent.click(good),
  );
  const a1 = new ScAddress(0, 0);
  expect(styleAt(doc, a1)).toBe("Good");
  expect(screen.getByRole("gridcell", { name: "A1 sample" })).toHaveStyle({
    backgroundColor: "#ccffcc",
  });
  select("A1:B1");
  const trigger = openStyles();
  expect(screen.queryAllByRole("menuitemradio", { checked: true })).toHaveLength(0);
  fireEvent.click(trigger);
  expect(dispatch.QueryState(styleCommand("Good")).checked).toBe(false);

  openStyles();
  const heading = screen.getByRole("menuitemradio", { name: "Heading 1" });
  await act(
    /** Activates Heading 1 from the mounted menu. @returns Click result. */ async () =>
      fireEvent.click(heading),
  );
  expect(dispatch.QueryState(styleCommand("Heading 1")).checked).toBe(true);
  execute(dispatch, ".uno:Undo");
  expect(dispatch.QueryState(styleCommand("Heading 1")).checked).toBe(false);
  expect(dispatch.QueryState(styleCommand("Good")).checked).toBe(false);
  execute(dispatch, ".uno:Redo");
  expect(dispatch.QueryState(styleCommand("Heading 1")).checked).toBe(true);
  expect(styleAt(doc, a1)).toBe("Heading 1");
});

it("executes typed style arguments with native precedence and preserves the result in ODS", /** Exercises original Which IDs, family precedence, and stored style ownership. @returns Completion. */ async () => {
  const { dispatch, doc } = mount();
  const pool = doc.GetStyleSheetPool();
  const display = unicode("Review");
  try {
    pool?.Make(display, SfxStyleFamily.Para, SfxStyleSearchBits.UserDefined);
  } finally {
    display.dispose();
  }
  const request = new SfxRequest(5552, [
    new SfxStringItem(5552, "Default"),
    new SfxUInt16Item(5553, SfxStyleFamily.Para),
    new SfxStringItem(5566, "CellStyles"),
    new SfxStringItem(6703, "Review"),
  ]);
  act(
    /** Dispatches the caller-owned typed request. @returns Nothing. */ () => {
      dispatch.ExecuteRequest(request);
    },
  );
  expect(request.IsDone()).toBe(true);
  expect(request.GetReturnValue()).toBeInstanceOf(SfxUInt16Item);
  expect(request.GetReturnValue()?.QueryValue()).toBe(0xffff);
  expect(dispatch.QueryState(styleCommand("Review")).checked).toBe(true);
  expect(dispatch.QueryState(styleCommand("review")).checked).toBe(false);

  const conflicting = new SfxRequest(5552, [
    new SfxUInt16Item(5553, SfxStyleFamily.Page),
    new SfxStringItem(5566, "CellStyles"),
    new SfxStringItem(6703, "Good"),
  ]);
  act(
    /** Dispatches the caller-owned conflicting request. @returns Nothing. */ () => {
      dispatch.ExecuteRequest(conflicting);
    },
  );
  expect(conflicting.IsDone()).toBe(false);
  expect(dispatch.QueryState(styleCommand("Review")).checked).toBe(true);
  const saved = await writeOdsDocument(doc);
  const reopened = await readOdsDocument(saved);
  try {
    expect(styleAt(reopened, new ScAddress(0, 0))).toBe("Review");
  } finally {
    reopened.Dispose();
  }
});

it("ports tdf158254 for full-column style application and Undo", /** Exercises the original full-column range. @returns Nothing. */ () => {
  const { dispatch, doc } = mount();
  const f1 = new ScAddress(5, 0);
  select("A:G");
  execute(dispatch, styleCommand("Accent 1"));
  expect(styleAt(doc, f1)).toBe("Accent 1");
  execute(dispatch, ".uno:Undo");
  expect(styleAt(doc, f1)).toBe("Default");
});

it("ports tdf125030 for repeating a cell style at another selection", /** Reapplies the retained style action to the new cell. @returns Nothing. */ () => {
  const { dispatch, doc } = mount();
  select("A1");
  execute(dispatch, styleCommand("Accent 1"));
  expect(styleAt(doc, new ScAddress(0, 0))).toBe("Accent 1");
  select("A2");
  expect(dispatch.QueryState(".uno:Repeat").enabled).toBe(true);
  execute(dispatch, ".uno:Repeat");
  expect(styleAt(doc, new ScAddress(0, 1))).toBe("Accent 1");
});

it("preserves CALC-823 style state at the unallocated column boundary", /** Exercises the allocated column cutoff for marked style state. @returns Nothing. */ () => {
  const { dispatch } = mount();
  select("B1");
  execute(dispatch, styleCommand("Good"));
  select("B1:E1");
  expect(dispatch.QueryState(styleCommand("Good")).checked).toBe(true);
  select("E1");
  expect(dispatch.QueryState(styleCommand("Default")).checked).toBe(true);
});
