/** @fileoverview Verifies the browser page dialog, rulers, pagination, and paged workspace chrome. */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { paginateWriterParagraphs } from "../editor/writer-page-pagination";
import { createDefaultWriterPageDescriptor } from "../../source/core/layout/pagedesc";
import { WriterPageStyleDialog } from "./WriterPageStyleDialog";
import { WriterRulers } from "./WriterRulers";
import { WriterWorkspaceChrome } from "./WriterWorkspaceChrome";
import type { WriterParagraphProjection } from "./writer-view-projection";

const page = createDefaultWriterPageDescriptor("en-GB").GetValue();

/** Creates the minimum complete paragraph projection used by browser pagination and ruler tests. @param id - Projection identity. @param text - Paragraph text. @returns Paragraph projection. */
function paragraph(id: string, text: string): WriterParagraphProjection {
  return {
    alignment: "left",
    computedStyle: {
      firstLineIndentPt: 3,
      fontStyle: "normal",
      fontSizePt: 12,
      fontWeight: 400,
      lineHeight: 1.2,
      lowerSpacingPt: 0,
      rightMarginPt: 4,
      upperSpacingPt: 0,
    },
    id,
    list: { kind: "none", level: 0 },
    listId: "",
    numRuleName: "",
    nodeIndex: 0,
    runs: [],
    style: "body-text",
    styleDisplayName: "Body Text",
    text,
    textLeftMargin: 120,
  };
}

describe("Writer physical page browser UI", /** Registers page-layout UI cases. @returns Nothing. */ () => {
  it("validates and submits page format, orientation, dimensions, and margins", /** Exercises every Page tab field. @returns Nothing. */ () => {
    const onCancel = vi.fn();
    const onSubmit = vi.fn();
    render(<WriterPageStyleDialog initialValue={page} onCancel={onCancel} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Paper format"), { target: { value: "custom" } });
    fireEvent.change(screen.getByLabelText("Height (cm)"), { target: { value: "31" } });
    fireEvent.change(screen.getByLabelText("Left (cm)"), { target: { value: "20" } });
    fireEvent.change(screen.getByLabelText("Top (cm)"), { target: { value: "1.5" } });
    fireEvent.change(screen.getByLabelText("Bottom (cm)"), { target: { value: "1.5" } });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(screen.getByText("Writer horizontal page margins leave no text area.")).toBeVisible();

    fireEvent.change(screen.getByLabelText("Width (cm)"), { target: { value: "30" } });
    fireEvent.change(screen.getByLabelText("Right (cm)"), { target: { value: "1" } });
    fireEvent.click(screen.getByLabelText("Landscape"));
    fireEvent.click(screen.getByLabelText("Portrait"));
    fireEvent.change(screen.getByLabelText("Left (cm)"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("Paper format"), { target: { value: "Letter" } });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ paperFormat: "Letter" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("commits every horizontal and vertical ruler handle and supports hidden rulers", /** Exercises every ruler handle. @returns Nothing. */ () => {
    const onPageChange = vi.fn();
    const onParagraphIndentChange = vi.fn();
    const { rerender } = render(
      <WriterRulers
        horizontalVisible
        onPageChange={onPageChange}
        onParagraphIndentChange={onParagraphIndentChange}
        page={page}
        paragraph={paragraph("p1", "Ruler")}
        verticalVisible
      />,
    );
    for (const [name, axis] of [
      ["Left page margin", "x"],
      ["Right page margin", "x"],
      ["Paragraph left indent", "x"],
      ["First line indent", "x"],
      ["Paragraph right indent", "x"],
      ["Top page margin", "y"],
      ["Bottom page margin", "y"],
    ] as const) {
      const handle = screen.getByRole("button", { name });
      fireEvent.pointerDown(handle, { clientX: 40, clientY: 40 });
      fireEvent.pointerUp(window, {
        clientX: axis === "x" ? 48 : 40,
        clientY: axis === "y" ? 48 : 40,
      });
    }
    expect(onPageChange).toHaveBeenCalledTimes(4);
    expect(onParagraphIndentChange).toHaveBeenCalledTimes(3);

    rerender(
      <WriterRulers
        horizontalVisible={false}
        onPageChange={onPageChange}
        onParagraphIndentChange={onParagraphIndentChange}
        page={page}
        paragraph={paragraph("p1", "Ruler")}
        verticalVisible={false}
      />,
    );
    expect(screen.queryByLabelText("Writer horizontal ruler")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Writer vertical ruler")).not.toBeInTheDocument();
  });

  it("paginates by physical text area and renders optional workspace regions", /** Exercises page grouping and workspace branches. @returns Nothing. */ () => {
    const paragraphs = [paragraph("p1", "first\nline"), paragraph("p2", "second")];
    const tinyPage = { ...page, bottomMargin: 100, height: 800, topMargin: 100 };
    expect(paginateWriterParagraphs(paragraphs, tinyPage)).toHaveLength(2);
    expect(paginateWriterParagraphs([], page)).toEqual([[]]);

    const onDocumentTitleChange = vi.fn();
    const { rerender } = render(
      <WriterWorkspaceChrome
        documentTitle="Document"
        formattingToolbar={<span>Formatting</span>}
        isPropertiesSidebarVisible={false}
        isStatusBarVisible={false}
        menuBar={<span>Menu</span>}
        onDocumentTitleChange={onDocumentTitleChange}
        propertiesSidebar={<span>Properties</span>}
        rulers={<span>Rulers</span>}
        status="Ready"
        toolbar={<span>Toolbar</span>}
      >
        <span>Pages</span>
      </WriterWorkspaceChrome>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit document title" }));
    const title = screen.getByRole("textbox", { name: "Document title" });
    fireEvent.change(title, { target: { value: "  Renamed  " } });
    fireEvent.keyDown(title, { key: "Enter" });
    expect(onDocumentTitleChange).toHaveBeenCalledWith("Renamed");

    rerender(
      <WriterWorkspaceChrome
        documentTitle="Renamed"
        formattingToolbar={<span>Formatting</span>}
        isPropertiesSidebarVisible
        isStatusBarVisible
        menuBar={<span>Menu</span>}
        onDocumentTitleChange={onDocumentTitleChange}
        propertiesSidebar={<span>Properties</span>}
        rulers={<span>Rulers</span>}
        status="Ready"
        toolbar={<span>Toolbar</span>}
      >
        <span>Pages</span>
      </WriterWorkspaceChrome>,
    );
    expect(screen.getByRole("complementary", { name: "Writer properties sidebar" })).toBeVisible();
    expect(screen.getByRole("status", { name: "Writer status bar" })).toHaveTextContent("Ready");
  });
});
