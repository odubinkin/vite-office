/** @fileoverview Exercises insertion and editing in the Writer hyperlink dialog. */
/* eslint-disable @typescript-eslint/no-non-null-assertion -- Test fixture documents provide the first paragraph. */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WriterHyperlinkDialog } from "./WriterHyperlinkDialog";

describe("Writer hyperlink dialog", /** Groups Writer hyperlink dialog. @returns Test callback result. */ () => {
  it("requires a destination and inserts link text and a new-window target", /** Checks requires a destination and inserts link text and a new-window target. @returns Test callback result. */ () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(<WriterHyperlinkDialog onCancel={onCancel} onSubmit={onSubmit} />);

    const url = screen.getByLabelText("URL");
    expect(url).toHaveFocus();
    fireEvent.submit(url.closest("form")!);
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.change(url, { target: { value: "  https://example.com  " } });
    fireEvent.change(screen.getByLabelText("Text"), { target: { value: "Example" } });
    fireEvent.change(screen.getByLabelText("Target"), { target: { value: "_blank" } });
    fireEvent.click(screen.getByText("Apply"));
    expect(onSubmit).toHaveBeenCalledWith(
      { url: "https://example.com", targetFrame: "_blank" },
      "Example",
    );

    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("preserves an edited link's metadata and removes a cleared target", /** Checks preserves an edited link's metadata and removes a cleared target. @returns Test callback result. */ () => {
    const onSubmit = vi.fn();
    render(
      <WriterHyperlinkDialog
        initialHyperlink={{ url: "https://old.example", targetFrame: "_blank", name: "named" }}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />,
    );
    expect(screen.queryByLabelText("Text")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("URL"), {
      target: { value: "https://new.example" },
    });
    fireEvent.change(screen.getByLabelText("Target"), { target: { value: "" } });
    fireEvent.click(screen.getByText("Apply"));
    expect(onSubmit).toHaveBeenCalledWith({ url: "https://new.example", name: "named" }, "");
  });
});
