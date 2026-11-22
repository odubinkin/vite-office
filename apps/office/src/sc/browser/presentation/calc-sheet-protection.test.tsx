/** @fileoverview Native Calc protectSheet.py workflow through the actual browser modal and sheet state. */
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { ScAddress } from "../../inc/address";
import { ScTableProtectionOption as Option } from "../../inc/tabprotection";
import { ScInputMode } from "../../inc/global";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { readOdsDocument, writeOdsDocument } from "../../source/filter/xml/xmlwrap";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";

let active: ReturnType<typeof createCalcSession> | undefined;
afterEach(
  /** Disposes mounted UI and real session. @returns Nothing. */ () => {
    cleanup();
    active?.Close();
    active = undefined;
  },
);

/** Mounts the actual Calc application and dispatcher. @returns Session. */
function mount() {
  active = createCalcSession();
  render(<CalcWorkbench {...active} />);
  return active;
}

/** Opens Sheet protection through Tools. @param name - Source dialog title. @returns Active dialog elements. */
async function openProtection(name: string) {
  fireEvent.click(screen.getByRole("menuitem", { name: "Tools" }));
  fireEvent.click(screen.getByRole("menuitemcheckbox", { name: /^Protect Sheet/ }));
  return within(await screen.findByRole("dialog", { name }));
}

/** Submits the protection form. @param dialog - Dialog elements. @returns Completion. */
async function accept(dialog: ReturnType<typeof within>): Promise<void> {
  await act(
    /** Acknowledges the native dialog. @returns Click result. */ async () =>
      fireEvent.click(dialog.getByRole("button", { name: "OK" })),
  );
}

it("ports the native protectSheet.py password, unlock, and cancel behavior", /** Exercises original options and cell editing. @returns Completion. */ async () => {
  const { controller, frame } = mount();
  const doc = controller.shell.GetDocument();
  const dialog = await openProtection("Protect Sheet");
  expect(dialog.getAllByRole("checkbox")).toHaveLength(9);
  expect(dialog.getByRole("checkbox", { name: "Select protected cells" })).toBeChecked();
  expect(dialog.getByRole("checkbox", { name: "Select unprotected cells" })).toBeChecked();
  const lock = dialog.getByRole("checkbox", { name: /^Protect this sheet/ });
  fireEvent.click(lock);
  expect(dialog.getByRole("button", { name: "OK" })).toBeDisabled();
  expect(dialog.getByLabelText("Password")).toBeDisabled();
  fireEvent.click(lock);
  fireEvent.change(dialog.getByLabelText("Password"), { target: { value: "aa" } });
  expect(dialog.getByRole("button", { name: "OK" })).toBeDisabled();
  fireEvent.change(dialog.getByLabelText("Confirm"), { target: { value: "aa" } });
  fireEvent.click(dialog.getByRole("checkbox", { name: "Use AutoFilter" }));
  await accept(dialog);
  await waitFor(
    /** Observes the real sheet lock. @returns Assertion. */ () =>
      expect(doc.GetTabProtection(0)?.isProtected()).toBe(true),
  );
  expect(doc.GetTabProtection(0)?.isOptionEnabled(Option.AUTOFILTER)).toBe(true);
  expect(frame.GetDispatcher().QueryState(".uno:Protect").checked).toBe(true);
  expect(screen.getByRole("tab", { name: "Sheet1" })).toHaveAccessibleDescription(
    "Protected sheet",
  );
  act(
    /** Tries to edit a protected cell. @returns Nothing. */ () => {
      expect(controller.StartInput(ScInputMode.SC_INPUT_TABLE, "blocked")).toBe(false);
    },
  );

  const incorrect = await openProtection("Unprotect Sheet");
  fireEvent.change(incorrect.getByLabelText("Password (optional)"), { target: { value: "bad" } });
  await accept(incorrect);
  await accept(within(await screen.findByRole("alertdialog", { name: "Incorrect Password" })));
  expect(doc.IsTabProtected(0)).toBe(true);

  const unlock = await openProtection("Unprotect Sheet");
  fireEvent.change(unlock.getByLabelText("Password (optional)"), { target: { value: "aa" } });
  await accept(unlock);
  await waitFor(
    /** Observes the successful unlock. @returns Assertion. */ () =>
      expect(doc.IsTabProtected(0)).toBe(false),
  );
  act(
    /** Writes B2 through the source input path. @returns Nothing. */ () => {
      controller.Select(1, 1);
      expect(controller.StartInput(ScInputMode.SC_INPUT_TABLE, "A")).toBe(true);
      expect(controller.Commit()).toBe(true);
    },
  );
  expect(text(doc.GetSharedString(new ScAddress(1, 1)).getString())).toBe("A");
  const cancelled = await openProtection("Protect Sheet");
  expect(cancelled.getByRole("checkbox", { name: "Use AutoFilter" })).toBeChecked();
  fireEvent.click(cancelled.getByRole("button", { name: "Cancel" }));
  expect(doc.IsTabProtected(0)).toBe(false);
  act(
    /** Checks input remains available after cancel. @returns Nothing. */ () => {
      expect(controller.StartInput(ScInputMode.SC_INPUT_TABLE, "B")).toBe(true);
      expect(controller.Commit()).toBe(true);
    },
  );
  expect(text(doc.GetSharedString(new ScAddress(1, 1)).getString())).toBe("B");
});

it("restores grouped sheet protection through history and preserves ODS password verification", /** Tests sheet identity, atomic undo, and the generated verifier. @returns Completion. */ async () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  act(
    /** Groups the two sheets through the browser controller. @returns Nothing. */ () => {
      controller.InsertSheet();
      controller.SelectTab(0, true);
    },
  );
  const first = await openProtection("Protect Sheet");
  fireEvent.change(first.getByLabelText("Password"), { target: { value: "café" } });
  fireEvent.change(first.getByLabelText("Confirm"), { target: { value: "café" } });
  await accept(first);
  await waitFor(
    /** Waits for Web Crypto and the grouped model application to finish. @returns Nothing. */
    () => {
      expect(doc.IsTabProtected(0)).toBe(true);
      expect(doc.IsTabProtected(1)).toBe(true);
    },
  );
  act(
    /** Reverses the grouped native action. @returns Nothing. */ () => {
      expect(controller.Undo()).toBe(true);
    },
  );
  expect(doc.IsTabProtected(0)).toBe(false);
  expect(doc.IsTabProtected(1)).toBe(false);
  act(
    /** Replays the grouped native action. @returns Nothing. */ () => {
      expect(controller.Redo()).toBe(true);
    },
  );
  expect(doc.IsTabProtected(0)).toBe(true);
  expect(doc.IsTabProtected(1)).toBe(true);
  const reopened = await readOdsDocument(await writeOdsDocument(doc));
  try {
    expect(await reopened.GetTabProtection(1)?.verifyPassword("café")).toBe(true);
    expect(await reopened.GetTabProtection(1)?.verifyPassword("cafe")).toBe(false);
  } finally {
    reopened.Dispose();
  }
});
