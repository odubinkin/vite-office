/** @fileoverview Native bookmark selection/name/rename controls with explicit owner ports;real model/ODT integration lives in writer-view tests. */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { WriterBookmarkDialog } from "./WriterBookmarkDialog";
import { WriterBookmarkRenameDialog } from "./WriterBookmarkRenameDialog";
afterEach(cleanup);
/** Selects real DOM rows including native empty/multiple selection. @param values - Row names. @returns Nothing. */
function select(values: readonly string[]): void {
  const list = screen.getByRole("listbox", { name: "Existing bookmarks" }) as HTMLSelectElement;
  for (const option of list.options) option.selected = values.includes(option.value);
  fireEvent.change(list);
}
/** Creates the existing controller protocol without inventing a mark manager. @param selectedName - Optional initial original mark. @returns Actual DOM and callback observations. */
function mount(selectedName?: string) {
  const operation = vi.fn(),
    submit = vi.fn(),
    cancel = vi.fn();
  const props = {
    names: ["A", "AB", "B"],
    onOperation: operation,
    onSubmit: submit,
    onCancel: cancel,
    ...(selectedName === undefined ? {} : { selectedName }),
  };
  return { ...render(<WriterBookmarkDialog {...props} />), props, operation, submit, cancel };
}
it("keeps raw typed values and distinct token counts while temporary forbidden matching selects original rows", /** Source sanitization is not a destructive input rewrite. @returns Nothing. */ () => {
  const f = mount(),
    input = screen.getByLabelText("Name");
  expect(input).toHaveValue("Bookmark 1");
  expect(input).toHaveFocus();
  fireEvent.submit(input.closest("form") as HTMLFormElement);
  expect(f.submit).toHaveBeenCalledWith({ action: "create", name: "Bookmark 1" });
  fireEvent.change(input, { target: { value: "" } });
  fireEvent.submit(input.closest("form") as HTMLFormElement);
  expect(f.submit).toHaveBeenCalledTimes(1);
  fireEvent.change(input, { target: { value: " A " } });
  fireEvent.click(screen.getByRole("button", { name: "Insert" }));
  expect(f.submit).toHaveBeenLastCalledWith({ action: "create", name: " A " });
  fireEvent.change(input, { target: { value: "A/B" } });
  expect(input).toHaveValue("A/B");
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(screen.getByRole("status")).toHaveTextContent("Forbidden characters:");
  fireEvent.click(screen.getByRole("button", { name: "Go to" }));
  expect(f.operation).toHaveBeenLastCalledWith({ action: "navigate", name: "AB" });
  fireEvent.change(input, { target: { value: "A;A" } });
  expect(screen.getByRole("button", { name: "Go to" })).toBeDisabled();
  fireEvent.doubleClick(screen.getByRole("listbox"));
  expect(f.operation).toHaveBeenLastCalledWith({ action: "navigate", name: "A" });
  fireEvent.change(input, { target: { value: "" } });
  fireEvent.doubleClick(screen.getByRole("listbox"));
  expect(f.operation).toHaveBeenCalledTimes(2);
});
it("uses selected row order for immediate multi-delete and keeps deletion applied when the parent closes", /** The callback port is immediate;only insertion completes the request. @returns Nothing. */ () => {
  const f = mount("A");
  expect(screen.getByRole("listbox")).toHaveFocus();
  select(["B", "A"]);
  expect(screen.getByLabelText("Name")).toHaveValue("A;B");
  expect(screen.getByRole("button", { name: "Rename" })).toBeDisabled();
  fireEvent.keyDown(screen.getByRole("listbox"), { key: "ArrowDown" });
  fireEvent.keyDown(screen.getByRole("listbox"), { key: "Enter" });
  expect(f.operation).toHaveBeenCalledWith({ action: "navigate", name: "A" });
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  expect(f.operation.mock.calls.slice(-2)).toEqual([
    [{ action: "remove", name: "A" }],
    [{ action: "remove", name: "B" }],
  ]);
  expect(screen.getByRole("dialog", { name: "Bookmark" })).toBeVisible();
  expect(screen.getByRole("button", { name: "Insert" })).toBeDisabled();
  select([]);
  expect(screen.getByRole("button", { name: "Insert" })).toBeEnabled();
  select(["AB"]);
  f.rerender(<WriterBookmarkDialog {...f.props} names={[]} />);
  expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
  fireEvent.keyDown(screen.getByRole("dialog", { name: "Bookmark" }), {
    key: "ArrowDown",
  });
  fireEvent.keyDown(screen.getByRole("dialog", { name: "Bookmark" }), {
    key: "Escape",
  });
  expect(f.cancel).toHaveBeenCalledOnce();
  expect(f.submit).not.toHaveBeenCalled();
});
it("opens an independent raw-name rename prompt and leaves the parent request open on cancel and accept", /** Native rename filters inserted characters and does not reuse the main field as a destination. @returns Nothing. */ () => {
  const f = mount();
  select(["A"]);
  fireEvent.click(screen.getByRole("button", { name: "Rename" }));
  let rename = screen.getByRole("dialog", { name: "Rename object: A" }),
    ui = within(rename),
    input = ui.getByLabelText("New name");
  expect(input).toHaveFocus();
  expect(ui.getByRole("button", { name: "OK" })).toBeDisabled();
  fireEvent.change(input, { target: { value: "" } });
  fireEvent.submit(input.closest("form") as HTMLFormElement);
  expect(f.operation).not.toHaveBeenCalled();
  fireEvent.keyDown(rename, { key: "ArrowDown" });
  fireEvent.keyDown(rename, { key: "Escape" });
  expect(f.cancel).not.toHaveBeenCalled();
  expect(screen.getByRole("dialog", { name: "Bookmark" })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Rename" }));
  rename = screen.getByRole("dialog", { name: "Rename object: A" });
  fireEvent.click(within(rename).getByRole("button", { name: "Cancel" }));
  fireEvent.click(screen.getByRole("button", { name: "Rename" }));
  rename = screen.getByRole("dialog", { name: "Rename object: A" });
  ui = within(rename);
  input = ui.getByLabelText("New name");
  fireEvent.change(input, { target: { value: " R/; " } });
  expect(input).toHaveValue(" R ");
  fireEvent.click(ui.getByRole("button", { name: "OK" }));
  expect(f.operation).toHaveBeenLastCalledWith({ action: "rename", name: "A", newName: " R " });
  expect(screen.queryByRole("dialog", { name: "Rename object: A" })).toBeNull();
  fireEvent.click(screen.getAllByRole("button", { name: "Close" })[0] as HTMLElement);
  expect(f.cancel).toHaveBeenCalledOnce();
});
it("uses actual pre-input selection ranges,including a whole imported name replacement and native history input", /** A common-prefix heuristic would incorrectly retain the semicolon when the selected name is replaced. @returns Nothing. */ () => {
  const accept = vi.fn();
  render(
    <WriterBookmarkRenameDialog name="A;B" names={["A;B"]} onCancel={vi.fn()} onSubmit={accept} />,
  );
  const input = screen.getByLabelText("New name") as HTMLInputElement;
  input.setSelectionRange(0, 3);
  fireEvent(
    input,
    new InputEvent("beforeinput", { bubbles: true, inputType: "insertText", data: "A;BC" }),
  );
  fireEvent.change(input, { target: { value: "A;BC" } });
  expect(input).toHaveValue("ABC");
  fireEvent(input, new InputEvent("beforeinput", { bubbles: true, inputType: "historyUndo" }));
  fireEvent.change(input, { target: { value: "A;B" } });
  expect(input).toHaveValue("A;B");
  input.setSelectionRange(3, 3);
  fireEvent(
    input,
    new InputEvent("beforeinput", { bubbles: true, inputType: "insertText", data: "X;" }),
  );
  fireEvent.change(input, { target: { value: "A;BX;" } });
  expect(input).toHaveValue("A;BX");
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(accept).toHaveBeenCalledWith("A;BX");
});
