/** @fileoverview Interaction coverage for Writer quick controls and line numbering. */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { WriterTableInsertControl } from "./WriterTableInsertControl";
import { WriterLineNumberingDialog } from "./WriterLineNumberingDialog";
import { SwLineNumberInfo, LineNumberPosition } from "../../inc/lineinfo";

/** Exercises the bounded upstream quick panels. */
describe("Writer upstream quick controls", /** Groups quick-panel interactions. @returns Nothing. */ () => {
  it("dismisses the table grid outside and with Escape, and supports hover and More Options", /** Checks grid dismissal and selection. @returns Nothing. */ () => {
    const onInsert = vi.fn();
    const onMoreOptions = vi.fn();
    render(<WriterTableInsertControl onInsert={onInsert} onMoreOptions={onMoreOptions} />);
    fireEvent.click(screen.getByRole("button", { name: "Insert Table" }));
    expect(screen.getByRole("button", { name: "More Options" }).parentElement?.parentElement).toBe(
      document.body,
    );
    fireEvent.mouseEnter(screen.getByRole("button", { name: "2 columns, 3 rows" }));
    expect(screen.getByText("2 × 3")).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByRole("button", { name: "2 columns, 3 rows" }));
    expect(screen.getByRole("button", { name: "More Options" })).toBeInTheDocument();
    fireEvent.focus(screen.getByRole("button", { name: "4 columns, 5 rows" }));
    expect(screen.getByText("4 × 5")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("button", { name: "More Options" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Insert Table" }));
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("button", { name: "More Options" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Insert Table" }));
    fireEvent.click(screen.getByRole("button", { name: "More Options" }));
    expect(onMoreOptions).toHaveBeenCalledOnce();
    expect(onInsert).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Insert Table" }));
    fireEvent.keyDown(screen.getByLabelText("Table size"), { key: "x" });
    const firstCell = screen.getByRole("button", { name: "1 columns, 1 rows" });
    fireEvent.focus(firstCell);
    fireEvent.keyDown(firstCell, { key: "ArrowRight" });
    fireEvent.keyDown(firstCell, { key: "ArrowDown" });
    expect(screen.getByText("2 × 2")).toBeInTheDocument();
    fireEvent.keyDown(firstCell, { key: "ArrowLeft" });
    fireEvent.keyDown(firstCell, { key: "ArrowUp" });
    fireEvent.keyDown(firstCell, { key: "Enter" });
    expect(onInsert).toHaveBeenCalledWith(1, 1);
  });

  it("edits all supported line numbering settings and cancels a draft", /** Checks document-settings draft. @returns Nothing. */ () => {
    const onCancel = vi.fn();
    const onSubmit = vi.fn();
    render(
      <WriterLineNumberingDialog
        value={new SwLineNumberInfo().QueryValue()}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.change(screen.getByLabelText("Position"), {
      target: { value: String(LineNumberPosition.Right) },
    });
    fireEvent.change(screen.getByLabelText("Spacing (cm)"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Interval"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("Separator text"), { target: { value: "*" } });
    fireEvent.change(screen.getByLabelText("Every"), { target: { value: "4" } });
    fireEvent.click(screen.getByLabelText("Blank lines"));
    fireEvent.click(screen.getByLabelText("Lines in text frames"));
    fireEvent.click(screen.getByLabelText("Restart every new page"));
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        position: LineNumberPosition.Right,
        posFromLeft: 567,
        countBy: 2,
        divider: "*",
        dividerCountBy: 4,
        countBlankLines: false,
        countInFlys: true,
        restartEachPage: true,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
