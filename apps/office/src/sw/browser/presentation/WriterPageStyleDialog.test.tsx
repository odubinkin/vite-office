/** @fileoverview Verifies page geometry editing and validation in the Writer dialog. */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  createDefaultWriterPageDescriptor,
  WRITER_PAPER_SIZES,
} from "../../source/core/layout/pagedesc";
import { swapOrientation, WriterPageStyleDialog } from "./WriterPageStyleDialog";

describe("Writer Page Style dialog", /** Groups Writer Page Style dialog. @returns Test callback result. */ () => {
  it("keeps selected paper dimensions consistent with landscape orientation", /** Checks keeps selected paper dimensions consistent with landscape orientation. @returns Test callback result. */ () => {
    const onSubmit = vi.fn();
    const initialValue = createDefaultWriterPageDescriptor("en-US").GetValue();
    expect(swapOrientation(initialValue, false)).toBe(initialValue);
    render(
      <WriterPageStyleDialog initialValue={initialValue} onCancel={vi.fn()} onSubmit={onSubmit} />,
    );
    fireEvent.click(screen.getByLabelText("Landscape"));
    fireEvent.change(screen.getByLabelText("Paper format"), { target: { value: "A4" } });
    fireEvent.click(screen.getByText("OK"));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        landscape: true,
        height: WRITER_PAPER_SIZES.A4.width,
        width: WRITER_PAPER_SIZES.A4.height,
      }),
    );
    fireEvent.click(screen.getByLabelText("Landscape"));
    fireEvent.click(screen.getByLabelText("Portrait"));
    fireEvent.change(screen.getByLabelText("Paper format"), { target: { value: "Letter" } });
    fireEvent.click(screen.getByText("OK"));
    expect(onSubmit).toHaveBeenLastCalledWith(
      expect.objectContaining({
        landscape: false,
        height: WRITER_PAPER_SIZES.Letter.height,
        width: WRITER_PAPER_SIZES.Letter.width,
      }),
    );
  });

  it("reports a non-Error callback failure without dismissing the dialog", /** Checks reports a non-Error callback failure without dismissing the dialog. @returns Test callback result. */ () => {
    const initialValue = createDefaultWriterPageDescriptor("en-US").GetValue();
    render(
      <WriterPageStyleDialog
        initialValue={initialValue}
        onCancel={vi.fn()}
        onSubmit={
          /** Runs the test callback. @returns Test callback result. */ () => {
            throw "rejected";
          }
        }
      />,
    );
    fireEvent.click(screen.getByText("OK"));
    expect(screen.getByText("Invalid page geometry.")).toBeInTheDocument();
  });
});
