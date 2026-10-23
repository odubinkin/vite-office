/** @fileoverview Independent SfxNewStyleDlg raw-name validation, user-list and overwrite/GetName contracts. */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { DialogHeader } from "../../../framework/browser/presentation/DialogHeader";
import { NewStyleDialog } from "./NewStyleDialog";
afterEach(
  /** Removes modal ownership after each case. @returns Nothing. */
  () => cleanup(),
);
/** Mounts an actual family pool projection. @returns User ports. */
function mount() {
  const onSubmit = vi.fn(),
    onCancel = vi.fn();
  render(
    <NewStyleDialog
      getText={
        /** Supplies native fallback strings through the presentation port. @param key - Source identity. @param fallback - English text. @returns Text. */
        (key, fallback) => {
          void key;
          return fallback;
        }
      }
      header={<DialogHeader title="New Style from Selection" onClose={onCancel} />}
      names={["User A", "User B"]}
      reservedNames={["Heading 1"]}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />,
  );
  return {
    onSubmit,
    onCancel,
    input: screen.getByRole("textbox", { name: "Style name" }),
    dialog: screen.getByRole("dialog"),
  };
}
it("lists only user styles and disables ASCII-space-only entry", /** Checks source ModifyHdl without trimming other Unicode whitespace. @returns Nothing. */ () => {
  const f = mount();
  expect(screen.getAllByRole("option")).toHaveLength(2);
  expect(screen.getByRole("button", { name: "OK" })).toBeDisabled();
  fireEvent.change(f.input, { target: { value: "   " } });
  expect(screen.getByRole("button", { name: "OK" })).toBeDisabled();
  fireEvent.submit(f.input.closest("form") as HTMLFormElement);
  expect(f.onSubmit).not.toHaveBeenCalled();
  fireEvent.change(f.input, { target: { value: "\t" } });
  expect(screen.getByRole("button", { name: "OK" })).toBeEnabled();
});
it("strips only leading ASCII spaces after exact raw-name validation", /** Preserves source GetName asymmetry rather than sanitizing it. @returns Nothing. */ () => {
  const f = mount();
  fireEvent.change(f.input, { target: { value: "  Heading 1 " } });
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(f.onSubmit).toHaveBeenCalledWith("Heading 1 ");
  expect(screen.queryByRole("alertdialog")).toBeNull();
});
it("protects an exact builtin name and leaves the editable parent open", /** Checks source information response and dismissal. @returns Nothing. */ () => {
  const f = mount();
  fireEvent.change(f.input, { target: { value: "Heading 1" } });
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  const message = screen.getByRole("alertdialog");
  fireEvent.keyDown(message, { key: "Tab" });
  expect(f.onSubmit).not.toHaveBeenCalled();
  fireEvent.click(within(message).getByRole("button", { name: "OK" }));
  expect(screen.queryByRole("alertdialog")).toBeNull();
  expect(f.input).toHaveValue("Heading 1");
});
it("requires overwrite approval after selection or activation", /** Checks original Yes/No operation without extra command dispatch. @returns Nothing. */ () => {
  const f = mount();
  fireEvent.click(screen.getByRole("option", { name: "User A" }));
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  const query = screen.getByRole("alertdialog");
  expect(screen.getByRole("button", { name: "Yes" })).toHaveFocus();
  fireEvent.keyDown(query, { key: "a" });
  fireEvent.keyDown(query, { key: "Tab" });
  expect(screen.getByRole("button", { name: "No" })).toHaveFocus();
  fireEvent.keyDown(query, { key: "Tab", shiftKey: true });
  expect(screen.getByRole("button", { name: "Yes" })).toHaveFocus();
  fireEvent.click(screen.getByRole("button", { name: "No" }));
  expect(f.onSubmit).not.toHaveBeenCalled();
  fireEvent.doubleClick(screen.getByRole("option", { name: "User A" }));
  fireEvent.click(screen.getByRole("button", { name: "Yes" }));
  expect(f.onSubmit).toHaveBeenCalledTimes(1);
  expect(f.onSubmit).toHaveBeenCalledWith("User A");
});
it("cancels the child query before the parent and preserves unrelated keys", /** Checks native dialog hierarchy. @returns Nothing. */ () => {
  const f = mount();
  fireEvent.keyDown(f.dialog, { key: "a" });
  expect(f.onCancel).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("option", { name: "User B" }));
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  fireEvent.keyDown(f.dialog, { key: "Escape" });
  expect(screen.queryByRole("alertdialog")).toBeNull();
  expect(f.onCancel).not.toHaveBeenCalled();
  fireEvent.keyDown(f.dialog, { key: "Escape" });
  expect(f.onCancel).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(f.onCancel).toHaveBeenCalledTimes(2);
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(f.onCancel).toHaveBeenCalledTimes(3);
});
