/** @fileoverview Mounted production Calc workspace and real Sfx/model integration checks. */
import { ScInputMode } from "../../inc/global";
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createCalcModuleFactory, createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { ScAddress, ScRange } from "../../inc/address";

afterEach(
  /** Releases mounted clients and browser geometry overrides. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
  },
);

it("mounts the lazy production factory and edits actual scalar/formula cells through shared history controls", /** Real rendered inputs drive the actual production owner chain. @returns Nothing. */ () => {
  const factory = createCalcModuleFactory();
  expect(factory.suiteId).toBe("calc");
  expect(factory.workspaceRetention).toBe("dispose-on-unmount");
  render(factory.createWorkspace());
  const grid = screen.getByRole("grid"),
    line = screen.getByRole("textbox", { name: "Input line" });
  expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
  fireEvent.keyDown(grid, { key: "2" });
  const input = screen.getByRole("textbox", { name: "Edit cell A1" });
  fireEvent.change(input, { target: { value: "4" } });
  fireEvent.keyDown(input, { key: "Enter", isComposing: true });
  expect(screen.getByRole("textbox", { name: "Edit cell A1" })).toHaveValue("4");
  fireEvent.keyDown(input, { key: "Tab" });
  expect(screen.getByRole("gridcell", { name: "A1" })).toHaveTextContent("4");
  fireEvent.focus(line);
  fireEvent.change(line, { target: { value: "=A1*3" } });
  fireEvent.click(screen.getByRole("button", { name: "Accept input" }));
  expect(screen.getByRole("gridcell", { name: "B1" })).toHaveTextContent("12");
  fireEvent.click(screen.getByRole("button", { name: "Undo" }));
  expect(screen.getByRole("gridcell", { name: "B1" })).toHaveTextContent("");
  fireEvent.click(screen.getByRole("button", { name: "Redo" }));
  expect(screen.getByRole("gridcell", { name: "B1" })).toHaveTextContent("12");
  fireEvent.keyDown(grid, { key: "z", ctrlKey: true });
  fireEvent.keyDown(grid, { key: "z", metaKey: true, shiftKey: true });
  fireEvent.keyDown(grid, { key: "y", ctrlKey: true });
  expect(screen.getByRole("gridcell", { name: "B1" })).toHaveTextContent("12");
  fireEvent.keyDown(grid, { key: "F2" });
  fireEvent.change(screen.getByRole("textbox", { name: "Edit cell B1" }), {
    target: { value: "discard" },
  });
  fireEvent.keyDown(screen.getByRole("textbox", { name: "Edit cell B1" }), { key: "Escape" });
  expect(line).toHaveValue("=A1*3");
  fireEvent.click(screen.getByRole("button", { name: "Formula" }));
  expect(line).toHaveFocus();
  expect(line).toHaveValue("=A1*3");
  fireEvent.click(screen.getByRole("button", { name: "Cancel input" }));
  fireEvent.doubleClick(screen.getByRole("gridcell", { name: "A1" }));
  fireEvent.keyDown(screen.getByRole("textbox", { name: "Edit cell A1" }), {
    key: "Enter",
    shiftKey: true,
  });
  fireEvent.keyDown(grid, { key: "Enter", shiftKey: true });
  fireEvent.keyDown(grid, { key: "Tab", shiftKey: true });
  fireEvent.keyDown(grid, { key: "ArrowRight", shiftKey: true });
  fireEvent.keyDown(grid, { key: "ArrowDown" });
  fireEvent.keyDown(grid, { key: "ArrowUp" });
  fireEvent.keyDown(grid, { key: "ArrowLeft" });
  fireEvent.keyDown(grid, { key: "x", altKey: true });
  fireEvent.keyDown(grid, { key: "x", isComposing: true });
  fireEvent.keyDown(grid, { key: "Control" });
  fireEvent.click(screen.getByRole("button", { name: "Column C" }));
  fireEvent.click(screen.getByRole("button", { name: "Row 2" }));
  fireEvent.click(screen.getByRole("button", { name: "Select all cells" }));
});

it("keeps canonical selection,sheet ownership,failed drafts and physical scrolling independent", /** Platform geometry uses DOM getters while all spreadsheet state remains real. @returns Nothing. */ () => {
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(400);
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(960);
  const session = createCalcSession(),
    c = session.controller;
  const mounted = render(
    <CalcWorkbench
      controller={c}
      frame={session.frame}
      fileWorkflows={session.fileWorkflows}
      sheetWorkflows={session.sheetWorkflows}
    />,
  );
  const grid = screen.getByRole("grid"),
    name = screen.getByRole("textbox", { name: "Name Box" }),
    line = screen.getByRole("textbox", { name: "Input line" });
  fireEvent.change(name, { target: { value: "AA1000" } });
  fireEvent.keyDown(name, { key: "Enter" });
  expect(c.Address()).toBe("AA1000");
  expect(grid.scrollTop).toBeGreaterThan(0);
  expect(grid.scrollLeft).toBeGreaterThan(0);
  grid.scrollTop = 500000;
  fireEvent.scroll(grid);
  expect(grid.scrollTop).toBe(500000);
  expect(c.Address()).toBe("AA1000");
  fireEvent(window, new Event("resize"));
  fireEvent.change(name, { target: { value: "bad" } });
  fireEvent.keyDown(name, { key: "Enter" });
  expect(screen.getByRole("alert")).toHaveTextContent(/invalid address/i);
  fireEvent.keyDown(name, { key: "Escape" });
  expect(name).toHaveValue("AA1000");
  fireEvent.keyDown(name, { key: "a" });
  fireEvent.focus(line);
  fireEvent.change(line, { target: { value: "=UNPORTED(A1)" } });
  fireEvent.keyDown(line, { key: "Enter" });
  expect(c.mode).toBe(ScInputMode.SC_INPUT_TOP);
  expect(screen.getByRole("alert")).toBeVisible();
  fireEvent.keyDown(line, { key: "a" });
  fireEvent.keyDown(line, { key: "Escape" });
  fireEvent.focus(line);
  fireEvent.change(line, { target: { value: "9" } });
  fireEvent.keyDown(line, { key: "Tab", shiftKey: true });
  expect(c.Address()).toBe("Z1000");
  expect(c.shell.GetDocument().GetValue(new ScAddress(26, 999, 0))).toBe(9);
  fireEvent.click(screen.getByRole("button", { name: "Insert Sheet" }));
  expect(screen.getByRole("tab", { name: "Sheet2" })).toHaveAttribute("aria-selected", "true");
  fireEvent.click(screen.getByRole("tab", { name: "Sheet1" }), { ctrlKey: true });
  fireEvent.click(screen.getByRole("tab", { name: "Sheet2" }), { metaKey: true });
  fireEvent.click(screen.getByRole("tab", { name: "Sheet1" }));
  fireEvent.keyDown(screen.getByRole("tab", { name: "Sheet1" }), { key: "ArrowRight" });
  fireEvent.keyDown(screen.getByRole("tab", { name: "Sheet2" }), { key: "ArrowLeft" });
  fireEvent.keyDown(screen.getByRole("tab", { name: "Sheet1" }), { key: "Home" });
  for (const label of ["First sheet", "Previous sheet", "Next sheet", "Last sheet"])
    fireEvent.click(screen.getByRole("button", { name: label }));
  act(
    /** Returns actual source cursor to the origin. @returns Nothing. */ () => {
      c.Select(0, 0);
    },
  );
  fireEvent(
    screen.getByRole("gridcell", { name: "B1" }),
    new MouseEvent("pointerdown", { bubbles: true, button: 0 }),
  );
  expect(c.Address()).toBe("B1");
  fireEvent(
    screen.getByRole("gridcell", { name: "C1" }),
    new MouseEvent("pointerdown", { bubbles: true, button: 2 }),
  );
  expect(c.Address()).toBe("B1");
  mounted.unmount();
  session.Close();
  expect(session.frame.GetDispatcher().QueryDispatch(".uno:Undo")).toBeUndefined();
});

it("dispatches source SDI named arguments and defers input until InputLineEnter when requested", /** Exercises actual Sfx requests and validation instead of mocked handlers. @returns Nothing. */ () => {
  const session = createCalcSession(),
    dispatcher = session.frame.GetDispatcher(),
    c = session.controller;
  for (const value of [
    undefined,
    "1",
    null,
    {},
    { StringName: 1 },
    { StringName: "1", DontCommit: "yes" },
  ])
    expect(
      /** Dispatches an invalid real request. @returns Result. */ () =>
        dispatcher.Execute(".uno:EnterString", value),
    ).toThrow(/StringName/);
  expect(dispatcher.Execute(".uno:EnterString", { StringName: "2", DontCommit: true }).status).toBe(
    "executed",
  );
  expect(c.Input()).toBe("2");
  expect(c.shell.GetDocument().GetValue(new ScAddress())).toBe(0);
  dispatcher.Execute(".uno:InputLineEnter");
  expect(c.shell.GetDocument().GetValue(new ScAddress())).toBe(2);
  dispatcher.Execute(".uno:EnterString", { StringName: "3" });
  dispatcher.Execute(".uno:Undo");
  expect(c.shell.GetDocument().GetValue(new ScAddress())).toBe(2);
  dispatcher.Execute(".uno:Redo");
  expect(c.shell.GetDocument().GetValue(new ScAddress())).toBe(3);
  session.Close();
});

it("uses native Sum reference selection,accept/cancel and live formula history in the mounted input line", /** The actual formula button inserts source-derived ranges and selects only its arguments. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller;
  c.EnterString("4");
  c.Navigate(0, 1);
  c.EnterString("6");
  c.Navigate(0, 1);
  render(
    <CalcWorkbench
      controller={c}
      frame={session.frame}
      fileWorkflows={session.fileWorkflows}
      sheetWorkflows={session.sheetWorkflows}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Sum" }));
  const line = screen.getByRole("textbox", { name: "Input line" }) as HTMLInputElement;
  expect(line).toHaveValue("=SUM(A1:A2)");
  expect(line).toHaveFocus();
  expect([line.selectionStart, line.selectionEnd]).toEqual([5, 10]);
  fireEvent.click(screen.getByRole("button", { name: "Cancel input" }));
  expect(screen.getByRole("gridcell", { name: "A3" })).toHaveTextContent("");
  fireEvent.click(screen.getByRole("button", { name: "Sum" }));
  fireEvent.click(screen.getByRole("button", { name: "Accept input" }));
  expect(screen.getByRole("gridcell", { name: "A3" })).toHaveTextContent("10");
  fireEvent.click(screen.getByRole("button", { name: "Undo" }));
  expect(screen.getByRole("gridcell", { name: "A3" })).toHaveTextContent("");
  fireEvent.click(screen.getByRole("button", { name: "Redo" }));
  expect(screen.getByRole("gridcell", { name: "A3" })).toHaveTextContent("10");
  cleanup();
  session.Close();
});

it("keeps grid focus after selected AutoSum and executes native empty-block formula fill", /** Mounted controls and direct native command dispatch share actual marks and error presentation. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    doc = c.shell.GetDocument();
  doc.SetValue(new ScAddress(), 2);
  doc.SetValue(new ScAddress(0, 1, 0), 3);
  c.viewData.GetMarkData().SetMarkArea(new ScRange(0, 0, 0, 0, 1, 0));
  render(
    <CalcWorkbench
      controller={c}
      frame={session.frame}
      fileWorkflows={session.fileWorkflows}
      sheetWorkflows={session.sheetWorkflows}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Sum" }));
  expect(doc.GetValue(new ScAddress(0, 2, 0))).toBe(5);
  expect(screen.getByRole("grid")).toHaveFocus();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  doc.SetValue(new ScAddress(1, 0, 0), 4);
  act(
    /** Uses actual public view marks and the native command boundary. @returns Nothing. */ () => {
      c.viewData.SetCurX(1);
      c.viewData.SetCurY(1);
      c.viewData.GetMarkData().SetMarkArea(new ScRange(1, 1, 0, 1, 2, 0));
      expect(c.AutoSum()).toBeUndefined();
    },
  );
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(doc.GetValue(new ScAddress(1, 1, 0))).toBe(4);
  expect(doc.GetValue(new ScAddress(1, 2, 0))).toBe(4);
  expect(doc.GetValue(new ScAddress(0, 2, 0))).toBe(5);
  cleanup();
  session.Close();
});

it("starts an empty native Sum argument draft and cancels without a document edit or history", /** A fresh worksheet has no inferred range;native input selection stays inside the actual empty parentheses. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller;
  render(
    <CalcWorkbench
      controller={c}
      frame={session.frame}
      fileWorkflows={session.fileWorkflows}
      sheetWorkflows={session.sheetWorkflows}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Sum" }));
  const line = screen.getByRole("textbox", { name: "Input line" }) as HTMLInputElement;
  expect(line).toHaveValue("=SUM()");
  expect(line).toHaveFocus();
  expect([line.selectionStart, line.selectionEnd]).toEqual([5, 5]);
  expect(c.shell.GetDocument().GetFormulaCell(new ScAddress())).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Cancel input" }));
  expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(0);
  expect(c.shell.GetDocument().GetFormulaCell(new ScAddress())).toBeNull();
  expect(screen.getByRole("grid")).toHaveFocus();
  cleanup();
  session.Close();
});
