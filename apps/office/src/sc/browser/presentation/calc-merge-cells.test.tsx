/** @fileoverview Mounted Calc merge slots, native content dialog choices and upstream worksheet regressions. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { createDocument } from "../../../sfx2/source/doc/objsh";
import { ScAddress } from "../../inc/address";
import { CellType } from "../../inc/global";
import { readOdsDocument } from "../../source/filter/xml/xmlwrap";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";

let active: ReturnType<typeof createCalcSession> | undefined;
afterEach(() => {
  cleanup();
  active?.Close();
  active = undefined;
});

/** Mounts the actual Calc workbench. @returns Active session. */
function mount() {
  active = createCalcSession();
  render(<CalcWorkbench {...active} />);
  return active;
}

/** Selects a range through the native Name Box. @param address - Sheet address. @returns Nothing. */
function select(address: string): void {
  const box = screen.getByRole("textbox", { name: "Name Box" });
  fireEvent.change(box, { target: { value: address } });
  fireEvent.keyDown(box, { key: "Enter" });
}

/** Opens the original Format submenu and returns the requested source item. @param name - Command label. @param checkable - Whether to query the toggle role. @returns Native menu item. */
function command(name: string, checkable = false): HTMLElement {
  fireEvent.click(screen.getByRole("menuitem", { name: "Format" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Merge and Unmerge Cells" }));
  return screen.getByRole(checkable ? "menuitemcheckbox" : "menuitem", { name });
}

/** Dispatches the source command after its menus have rendered. @param name - Command label. @param checkable - Whether to query the toggle role. @returns Completion. */
async function execute(name: string, checkable = false): Promise<void> {
  const item = command(name, checkable);
  await act(async () => fireEvent.click(item));
}

/** Accepts the current source policy. @param name - Radio label prefix. @returns Completion. */
async function choose(name: RegExp): Promise<void> {
  const dialog = within(screen.getByRole("dialog", { name: "Merge Cells" }));
  fireEvent.click(dialog.getByRole("radio", { name }));
  await act(async () => fireEvent.click(dialog.getByRole("button", { name: "OK" })));
}

/** Reopens the original LibreOffice test workbook in the live Calc document. @param filename - ODS fixture. @returns Mounted session. */
async function loadOds(filename: string) {
  const bytes = new Uint8Array(
    await readFile(`../../vendor/libreoffice-reference/sc/qa/uitest/data/${filename}`),
  );
  const doc = await readOdsDocument(bytes);
  const session = mount();
  act(() =>
    session.controller.shell.ReplaceDocument(
      doc,
      createDocument({ id: filename, suiteId: "calc", title: filename }),
      { kind: "input", name: filename, source: { kind: "external", reference: bytes } },
    ),
  );
  return { ...session, doc };
}

it("ports tdf117367 and keeps the three merge policies mutually exclusive", /** Ports tdf117367 and keeps the three merge policies mutually exclusive. @returns Completion. */ async () => {
  const { controller, frame } = mount();
  const doc = controller.shell.GetDocument();
  const a1 = new ScAddress(0, 0),
    a2 = new ScAddress(0, 1);
  expect(frame.GetDispatcher().QueryState(".uno:ToggleMergeCells").enabled).toBe(false);
  act(() => {
    doc.SetTextCell(a1, unicode("AAA"));
    doc.SetTextCell(a2, unicode("BBB"));
  });
  select("A1:B4");
  await execute("Merge Cells");
  const dialog = within(screen.getByRole("dialog", { name: "Merge Cells" }));
  const move = dialog.getByRole("radio", { name: /^Move the contents/ });
  const keep = dialog.getByRole("radio", { name: /^Keep the contents/ });
  const empty = dialog.getByRole("radio", { name: /^Empty the contents/ });
  expect(keep).toBeChecked();
  fireEvent.click(move);
  fireEvent.click(move);
  expect(move).toBeChecked();
  expect(keep).not.toBeChecked();
  expect(empty).not.toBeChecked();
  fireEvent.click(empty);
  expect(move).not.toBeChecked();
  expect(keep).not.toBeChecked();
  expect(empty).toBeChecked();
  fireEvent.click(keep);
  expect(move).not.toBeChecked();
  expect(keep).toBeChecked();
  expect(empty).not.toBeChecked();
  await act(async () => fireEvent.click(dialog.getByRole("button", { name: "OK" })));
  expect(doc.IsMerged(a1)).toBe(true);
  expect(text(doc.GetSharedString(a2).getString())).toBe("BBB");
  expect(screen.getByRole("gridcell", { name: "A1 AAA" })).toHaveAttribute("aria-rowspan", "4");
  expect(command("Merge and Center Cells", true)).toBeChecked();
  await act(async () => fireEvent.click(screen.getByRole("menuitem", { name: "Unmerge Cells" })));
  expect(doc.IsMerged(a1)).toBe(false);
  expect(screen.getByRole("gridcell", { name: "A2 BBB" })).toBeVisible();
  act(() => expect(controller.Undo()).toBe(true));
  expect(doc.IsMerged(a1)).toBe(true);
});

it("ports tdf51368 and recalculates the original workbook after move, keep and empty", /** Ports tdf51368 and recalculates the original workbook after move, keep and empty. @returns Completion. */ async () => {
  const { controller, doc } = await loadOds("tdf51368.ods");
  const a11 = new ScAddress(0, 10),
    a12 = new ScAddress(0, 11),
    b12 = new ScAddress(1, 11);
  const policies = [
    { label: /^Move the contents/, dependent: 0, anchor: "2 3", covered: CellType.CELLTYPE_NONE },
    { label: /^Keep the contents/, dependent: 3, anchor: "", covered: CellType.CELLTYPE_VALUE },
    { label: /^Empty the contents/, dependent: 0, anchor: "", covered: CellType.CELLTYPE_NONE },
  ];
  for (const policy of policies) {
    select("A11:A12");
    await execute("Merge and Center Cells", true);
    await choose(policy.label);
    expect(doc.IsMerged(a11)).toBe(true);
    expect(doc.GetValue(b12)).toBe(policy.dependent);
    expect(text(doc.GetSharedString(a11).getString())).toBe(policy.anchor);
    expect(doc.GetCellType(a12)).toBe(policy.covered);
    act(() => expect(controller.Undo()).toBe(true));
    expect(doc.IsMerged(a11)).toBe(false);
    expect(doc.GetValue(a11)).toBe(2);
    expect(doc.GetValue(b12)).toBe(3);
  }
});

it("ports the tdf37901 merge block and restores Key# from both merge commands", /** Ports the tdf37901 merge block and restores Key# from both merge commands. @returns Completion. */ async () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  const key = new ScAddress(1, 1);
  // The source's A1:B2 block contains only this text. Its other formulas are outside the regression.
  act(() => doc.SetTextCell(key, unicode("Key#")));
  const count = controller.shell.GetUndoManager().GetUndoActionCount();
  for (const range of ["B1:B2", "A2:B2"]) {
    for (const toggle of [false, true]) {
      select(range);
      await execute(toggle ? "Merge and Center Cells" : "Merge Cells", toggle);
      expect(controller.shell.GetUndoManager().GetUndoActionCount()).toBe(count + 1);
      expect(screen.queryByRole("dialog", { name: "Merge Cells" })).toBeNull();
      act(() => expect(controller.Undo()).toBe(true));
      expect(text(doc.GetSharedString(key).getString())).toBe("Key#");
    }
  }
});

it("cancels a pending merge if the originating worksheet selection changes", async () => {
  const { controller, frame } = mount();
  const doc = controller.shell.GetDocument();
  const a1 = new ScAddress(0, 0),
    b1 = new ScAddress(1, 0);
  act(() => {
    doc.SetValue(a1, 2);
    doc.SetValue(b1, 3);
  });
  select("A1:B1");
  await execute("Merge Cells");
  expect(frame.GetDispatcher().QueryState(".uno:MergeCells").enabled).toBe(false);
  act(() => expect(controller.Select(2, 1)).toBe(true));
  await choose(/^Move the contents/);
  expect(doc.GetValue(b1)).toBe(3);
  expect(doc.IsMerged(a1)).toBe(false);
});
