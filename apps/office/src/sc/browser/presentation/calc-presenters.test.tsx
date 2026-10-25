/** @fileoverview Calc presenters exercise actual document/view/mark owners and forward input to their controllers without retaining a cell or draft model. */
import { ScInputMode } from "../../inc/global";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { ScDocument } from "../../inc/document";
import { ScAddress, ScRange, MAXCOL, MAXROW } from "../../inc/address";
import { ScViewData } from "../../source/ui/inc/viewdata";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { ScGridWindow, type ScGridWindowProps } from "./ScGridWindow";
import { ScInputWindow, type ScInputWindowProps, type CalcInputAction } from "./ScInputWindow";
import { ScTabControl } from "./ScTabControl";
/** Creates real document and view owners, avoiding a browser-side cell array. @returns Canonical owners. */
function owners() {
  const document = new ScDocument();
  document.InsertTab(0, unicode("Data"));
  document.InsertTab(1, unicode("More"));
  return { document, view: new ScViewData(document) };
}
it("renders canonical grid coordinates,marks and bounded cells while forwarding pointer and keyboard input", /** Tests native view data with accessible virtual grid positions. @returns Nothing. */ () => {
  const { document, view } = owners();
  document.SetValue(new ScAddress(26, 4, 0), 42);
  view.SetCurX(26);
  view.SetCurY(4);
  view.GetMarkData().SetMarkArea(new ScRange(27, 4, 0, 27, 5, 0));
  const props: ScGridWindowProps = {
    idPrefix: "grid",
    viewData: view,
    viewport: {
      firstColumn: 26,
      firstRow: 4,
      columns: 2,
      rows: 2,
      scrollWidth: 1_000_000,
      scrollLeft: 0,
      columnOffset: 0,
      rowHeight: 22,
      scrollTop: 0,
      rowOffset: 0,
      scrollHeight: 1_000_000,
    },
    inputMode: ScInputMode.SC_INPUT_NONE,
    inputText: "=A1+1",
    getCell: vi.fn(
      /** Formats actual numeric values supplied by the document. @param position - Native address. @returns Controlled presentation. */ (
        position: ScAddress,
      ) => ({
        text: String(document.GetValue(position)),
        alignment: position.Col() === 26 ? ("right" as const) : ("left" as const),
      }),
    ),
    onSelect: vi.fn(),
    onHeader: vi.fn(),
    onEdit: vi.fn(),
    onKeyDown: vi.fn(),
    onScroll: vi.fn(),
    onInput: vi.fn(),
    onInputKeyDown: vi.fn(),
  };
  const { rerender } = render(<ScGridWindow {...props} />);
  const grid = screen.getByRole("grid"),
    cell = screen.getByRole("gridcell", { name: "AA5" });
  expect(grid).toHaveFocus();
  fireEvent.scroll(grid);
  expect(props.onScroll).toHaveBeenCalledOnce();
  expect(grid).toHaveAttribute("aria-activedescendant", cell.id);
  expect(grid).toHaveAttribute("aria-rowcount", String(MAXROW + 2));
  expect(grid).toHaveAttribute("aria-colcount", String(MAXCOL + 2));
  expect(cell).toHaveTextContent("42");
  expect(cell).toHaveAttribute("aria-colindex", "28");
  expect(cell).toHaveAttribute("aria-selected", "false");
  expect(cell.parentElement).toHaveAttribute("aria-rowindex", "6");
  expect(screen.getByRole("gridcell", { name: "AB5" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("gridcell", { name: "AA6" })).toHaveAttribute("aria-selected", "false");
  fireEvent.pointerDown(cell, { shiftKey: true, button: 0 });
  const selected = vi.mocked(props.onSelect).mock.calls[0];
  expect(selected?.[0].Col()).toBe(26);
  expect(selected?.[0].Row()).toBe(4);
  expect(selected?.[0].Tab()).toBe(0);
  fireEvent.pointerUp(cell);
  fireEvent.doubleClick(cell);
  expect(props.onEdit).toHaveBeenCalledOnce();
  fireEvent.keyDown(grid, { key: "ArrowDown", shiftKey: true });
  expect(props.onKeyDown).toHaveBeenCalledOnce();
  for (const label of ["Select all cells", "Column AA", "Row 5"])
    fireEvent.click(screen.getByRole("button", { name: label }));
  expect(
    vi
      .mocked(props.onHeader)
      .mock.calls.map(
        /** Reads semantic header intents. @param call - Recorded intent. @returns Header kind/index. */ (
          call,
        ) => call.slice(0, 2),
      ),
  ).toEqual([
    ["all", 0],
    ["column", 26],
    ["row", 4],
  ]);
  fireEvent.keyDown(screen.getByRole("button", { name: "Column AA" }), { key: "ArrowLeft" });
  expect(props.onKeyDown).toHaveBeenCalledOnce();
  rerender(<ScGridWindow {...props} inputMode={ScInputMode.SC_INPUT_TABLE} />);
  const input = screen.getByRole("textbox", { name: "Edit cell AA5" });
  expect(input).toHaveFocus();
  fireEvent.pointerDown(input);
  fireEvent.doubleClick(input);
  expect(input).toHaveFocus();
  expect(props.onSelect).toHaveBeenCalledOnce();
  expect(props.onEdit).toHaveBeenCalledOnce();
  expect(input).toHaveValue("=A1+1");
  fireEvent.change(input, { target: { value: "=B2" } });
  expect(props.onInput).toHaveBeenCalledWith("=B2", [3, 3]);
  fireEvent.keyDown(input, { key: "Enter", isComposing: true });
  expect(props.onInputKeyDown).toHaveBeenCalledOnce();
  expect(props.onKeyDown).toHaveBeenCalledOnce();
  expect(vi.mocked(props.onInputKeyDown).mock.calls[0]?.[0].nativeEvent.isComposing).toBe(true);
  rerender(
    <ScGridWindow
      {...props}
      viewport={{ ...props.viewport, firstColumn: MAXCOL, firstRow: MAXROW }}
      inputMode={ScInputMode.SC_INPUT_TABLE}
    />,
  );
  expect(screen.getAllByRole("gridcell")).toHaveLength(1);
  expect(screen.getByRole("gridcell", { name: "XFD1048576" })).not.toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(screen.getByRole("grid")).not.toHaveAttribute("aria-activedescendant");
  expect(screen.getByRole("gridcell", { name: "XFD1048576" }).parentElement).toHaveStyle({
    top: "22px",
  });
  rerender(<ScGridWindow {...props} />);
  expect(screen.getByRole("grid")).toHaveFocus();
});
it("keeps formula-line state controlled and preserves source action modes", /** Covers name/input events and all enabled/disabled command buttons. @returns Nothing. */ () => {
  const actions = new Set<CalcInputAction>([
    "names",
    "function",
    "sum",
    "equals",
    "cancel",
    "accept",
    "expand",
  ]);
  const props: ScInputWindowProps = {
    addressText: "A1",
    inputText: "=1+2",
    editing: false,
    enabledActions: actions,
    onAddressChange: vi.fn(),
    onAddressKeyDown: vi.fn(),
    onInput: vi.fn(),
    onInputFocus: vi.fn(),
    onInputKeyDown: vi.fn(),
    onAction: vi.fn(),
  };
  const { rerender } = render(<ScInputWindow {...props} />);
  fireEvent.change(screen.getByRole("textbox", { name: "Name Box" }), { target: { value: "B2" } });
  expect(props.onAddressChange).toHaveBeenCalledWith("B2");
  fireEvent.keyDown(screen.getByRole("textbox", { name: "Name Box" }), { key: "Enter" });
  expect(props.onAddressKeyDown).toHaveBeenCalledOnce();
  const line = screen.getByRole("textbox", { name: "Input line" });
  fireEvent.focus(line);
  expect(props.onInputFocus).toHaveBeenCalledOnce();
  fireEvent.change(line, { target: { value: "=2" } });
  expect(props.onInput).toHaveBeenCalledWith("=2", [2, 2]);
  fireEvent.keyDown(line, { key: "Escape" });
  expect(props.onInputKeyDown).toHaveBeenCalledOnce();
  for (const label of ["Named ranges", "Function Wizard", "Sum", "Formula", "Expand formula bar"])
    fireEvent.click(screen.getByRole("button", { name: label }));
  expect(vi.mocked(props.onAction).mock.calls.flat()).toEqual([
    "names",
    "function",
    "sum",
    "equals",
    "expand",
  ]);
  expect(fireEvent.mouseDown(screen.getByRole("button", { name: "Formula" }))).toBe(false);
  rerender(<ScInputWindow {...props} editing />);
  expect(screen.queryByRole("button", { name: "Sum" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Formula" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Cancel input" }));
  fireEvent.click(screen.getByRole("button", { name: "Accept input" }));
  expect(vi.mocked(props.onAction).mock.calls.slice(-2).flat()).toEqual(["cancel", "accept"]);
  rerender(<ScInputWindow {...props} editing enabledActions={new Set()} />);
  for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled();
  rerender(<ScInputWindow {...props} enabledActions={new Set()} />);
  for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled();
});
it("projects actual sheet names and separate selected/active tabs without retaining a tab inventory", /** Sheet mutations remain in the document/controller. @returns Nothing. */ () => {
  const { document, view } = owners(),
    onSelect = vi.fn(),
    onInsert = vi.fn(),
    onScroll = vi.fn(),
    onTabKeyDown = vi.fn();
  const { rerender } = render(
    <ScTabControl
      viewData={view}
      canInsert
      onSelect={onSelect}
      onInsert={onInsert}
      onContextPopup={vi.fn()}
      onScroll={onScroll}
      onKeyDown={onTabKeyDown}
    />,
  );
  const tabs = within(screen.getByRole("tablist", { name: "Sheets" }));
  fireEvent.keyDown(tabs.getByRole("tab", { name: "Data" }), { key: "ArrowRight" });
  expect(onTabKeyDown).toHaveBeenCalledOnce();
  expect(tabs.getByRole("tab", { name: "Data" })).toHaveAttribute("aria-selected", "true");
  expect(tabs.getByRole("tab", { name: "Data" })).toHaveAttribute("aria-current", "page");
  expect(tabs.getByRole("tab", { name: "More" })).toHaveAttribute("tabindex", "-1");
  fireEvent.click(tabs.getByRole("tab", { name: "More" }), { ctrlKey: true });
  expect(onSelect.mock.calls[0]?.[0]).toBe(1);
  expect(onSelect.mock.calls[0]?.[1].ctrlKey).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Insert Sheet" }));
  expect(onInsert).toHaveBeenCalledOnce();
  for (const label of ["First sheet", "Previous sheet", "Next sheet", "Last sheet"])
    fireEvent.click(screen.getByRole("button", { name: label }));
  expect(onScroll.mock.calls.flat()).toEqual(["first", "previous", "next", "last"]);
  view.SetTabNo(1);
  view.GetMarkData().SelectTable(1, true);
  document.InsertTab(2, unicode("Third"));
  rerender(
    <ScTabControl
      viewData={view}
      canInsert={false}
      onSelect={onSelect}
      onInsert={onInsert}
      onContextPopup={vi.fn()}
      onScroll={onScroll}
      onKeyDown={onTabKeyDown}
    />,
  );
  expect(screen.getByRole("tab", { name: "More" })).toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("tab", { name: "Data" })).not.toHaveAttribute("aria-current");
  expect(screen.getByRole("tab", { name: "Third" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Insert Sheet" })).toBeDisabled();
});
