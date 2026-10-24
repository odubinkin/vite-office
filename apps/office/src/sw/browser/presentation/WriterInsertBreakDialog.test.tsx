/** @fileoverview Verifies mounted break choice focus,default form acceptance and original cancellation paths. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { WriterInsertBreakDialog } from "./WriterInsertBreakDialog";
afterEach(cleanup);
it("focuses the actual choice and retains native form/cancel keyboard ownership", /** No document mutation occurs before the original request completes. @returns Nothing. */ () => {
  const cancel = vi.fn(),
    submit = vi.fn();
  render(<WriterInsertBreakDialog onCancel={cancel} onSubmit={submit} />);
  const choice = screen.getByRole("radio");
  expect(choice).toHaveFocus();
  fireEvent.keyDown(choice, { key: "ArrowDown" });
  fireEvent.submit(choice.closest("form") as HTMLFormElement);
  expect(submit).toHaveBeenCalledOnce();
  fireEvent.keyDown(choice, { key: "Escape" });
  expect(cancel).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(cancel).toHaveBeenCalledTimes(2);
});
