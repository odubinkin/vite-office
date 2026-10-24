/** @fileoverview Exercises actual native line-number dialog control events,source sensitivity and cancellation. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { WriterLineNumberingDialog } from "./WriterLineNumberingDialog";
import { SwLineNumberInfo } from "../../inc/lineinfo";
import { FieldUnit } from "../../../tools/inc/fldunit";
afterEach(cleanup);
it("retains inactive draft values and accepts every represented source field", /** Original body and separator sensitivity follow checkbox/text state. @returns Nothing. */ () => {
  const submit = vi.fn(),
    cancel = vi.fn();
  render(
    <WriterLineNumberingDialog
      value={new SwLineNumberInfo().QueryValue()}
      onSubmit={submit}
      onCancel={cancel}
    />,
  );
  const show = screen.getByLabelText("Show numbering"),
    every = screen.getByLabelText("Every");
  expect(show).toHaveFocus();
  expect(screen.getByLabelText("Position")).toBeDisabled();
  expect(every).toBeDisabled();
  fireEvent.click(show);
  expect(screen.getByLabelText("Position")).toBeEnabled();
  expect(every).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Separator text"), { target: { value: " " } });
  expect(every).toBeEnabled();
  fireEvent.change(every, { target: { value: "0" } });
  fireEvent.change(screen.getByLabelText("Interval"), { target: { value: "8" } });
  fireEvent.change(screen.getByLabelText("Position"), { target: { value: "3" } });
  fireEvent.change(screen.getByLabelText("Spacing (cm)"), { target: { value: "1 cm" } });
  fireEvent.blur(screen.getByLabelText("Spacing (cm)"));
  fireEvent.click(screen.getByLabelText("Blank lines"));
  fireEvent.click(screen.getByLabelText("Lines in text frames"));
  fireEvent.click(screen.getByLabelText("Restart every new page"));
  fireEvent.click(show);
  expect(every).toBeDisabled();
  expect(every).toHaveValue(0);
  fireEvent.click(show);
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(submit).toHaveBeenCalledWith(
    expect.objectContaining({
      paintLineNumbers: true,
      divider: " ",
      dividerCountBy: 0,
      countBy: 8,
      position: 3,
      posFromLeft: 567,
      countBlankLines: false,
      countInFlys: true,
      restartEachPage: true,
    }),
  );
  fireEvent.keyDown(show, { key: "ArrowDown" });
  fireEvent.keyDown(show, { key: "Escape" });
  expect(cancel).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(cancel).toHaveBeenCalledTimes(2);
});
it("uses source physical unit for the actual input", /** Explicit inch preferences do not fall back to centimeters. @returns Nothing. */ () => {
  render(
    <WriterLineNumberingDialog
      value={new SwLineNumberInfo().QueryValue()}
      unit={FieldUnit.INCH}
      onSubmit={vi.fn()}
      onCancel={vi.fn()}
    />,
  );
  expect(screen.getByLabelText("Spacing (in)")).toBeDisabled();
});
