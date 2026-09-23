/** @fileoverview Verifies the browser page dialog, rulers, pagination, and paged workspace chrome. */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getWriterParagraphGap } from "../editor/writer-page-pagination";
import { createSwPageFrames } from "../../source/core/layout/newfrm";
import { getWriterDomSelection } from "../editor/writer-selection";
import { WriterPlainTextEditor } from "../editor/WriterPlainTextEditor";
import { createDefaultWriterPageDescriptor } from "../../source/core/layout/pagedesc";
import type { SwEditWin } from "../../source/uibase/docvw/edtwin";
import { WriterPageStyleDialog } from "./WriterPageStyleDialog";
import { WriterRulers, WriterVerticalRuler } from "./WriterRulers";
import { WriterWorkspaceChrome } from "./WriterWorkspaceChrome";
import type { WriterParagraphProjection } from "./writer-view-projection";

const page = createDefaultWriterPageDescriptor("en-GB").GetValue();

describe("Writer paragraph gaps", /** Covers upstream contextual spacing decisions. @returns Nothing. */ () => {
  it("uses configured additive spacing and suppresses contextual gaps for matching styles", /** Checks normal and contextual gap formulas. @returns Nothing. */ () => {
    const first = {
      ...paragraph("first", "A"),
      computedStyle: {
        ...paragraph("first", "A").computedStyle,
        lowerSpacingPt: 12,
        contextualSpacing: true,
      },
    };
    const second = {
      ...paragraph("second", "B"),
      computedStyle: {
        ...paragraph("second", "B").computedStyle,
        upperSpacingPt: 12,
        contextualSpacing: true,
      },
    };
    expect(getWriterParagraphGap(undefined, second)).toBe(12);
    expect(getWriterParagraphGap(first, second)).toBe(0);
    expect(
      getWriterParagraphGap(
        { ...first, computedStyle: { ...first.computedStyle, contextualSpacing: false } },
        second,
      ),
    ).toBe(12);
    expect(
      getWriterParagraphGap(first, {
        ...second,
        computedStyle: { ...second.computedStyle, contextualSpacing: false },
      }),
    ).toBe(12);
    expect(
      getWriterParagraphGap(
        {
          ...first,
          computedStyle: { ...first.computedStyle, lowerSpacingPt: 4, contextualSpacing: false },
        },
        second,
      ),
    ).toBe(4);
    expect(
      getWriterParagraphGap(first, {
        ...second,
        computedStyle: { ...second.computedStyle, upperSpacingPt: 4, contextualSpacing: false },
      }),
    ).toBe(4);
    expect(getWriterParagraphGap({ ...first, style: "heading-1" }, second)).toBe(24);
    expect(
      getWriterParagraphGap(
        { ...first, computedStyle: { ...first.computedStyle, contextualSpacing: false } },
        { ...second, computedStyle: { ...second.computedStyle, contextualSpacing: false } },
      ),
    ).toBe(24);
    expect(
      getWriterParagraphGap(
        { ...first, computedStyle: { ...first.computedStyle, contextualSpacing: false } },
        { ...second, computedStyle: { ...second.computedStyle, contextualSpacing: false } },
        { paraSpaceMax: false, paraSpaceMaxAtPages: false },
      ),
    ).toBe(12);
    expect(
      getWriterParagraphGap(undefined, second, {
        paraSpaceMax: true,
        paraSpaceMaxAtPages: false,
      }),
    ).toBe(0);
  });
});

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
    runs: [{ startOffset: 0, text, attributes: { bold: false, italic: false, underline: false } }],
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
      <>
        <WriterRulers
          horizontalVisible
          onPageChange={onPageChange}
          onParagraphIndentChange={onParagraphIndentChange}
          page={page}
          paragraph={paragraph("p1", "Ruler")}
        />
        <WriterVerticalRuler onPageChange={onPageChange} page={page} />
      </>,
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
      const originalPosition = axis === "x" ? handle.style.left : handle.style.top;
      fireEvent.pointerDown(handle, { clientX: 40, clientY: 40 });
      fireEvent.pointerMove(window, {
        clientX: axis === "x" ? 48 : 40,
        clientY: axis === "y" ? 48 : 40,
      });
      expect(axis === "x" ? handle.style.left : handle.style.top).not.toBe(originalPosition);
      fireEvent.pointerUp(window, {
        clientX: axis === "x" ? 48 : 40,
        clientY: axis === "y" ? 48 : 40,
      });
    }
    expect(onPageChange).toHaveBeenCalledTimes(4);
    expect(onParagraphIndentChange).toHaveBeenCalledTimes(3);

    fireEvent.pointerDown(screen.getByRole("button", { name: "Left page margin" }), {
      clientX: 40,
    });
    fireEvent.pointerCancel(window);
    expect(onPageChange).toHaveBeenCalledTimes(4);

    rerender(
      <WriterRulers
        horizontalVisible={false}
        onPageChange={onPageChange}
        onParagraphIndentChange={onParagraphIndentChange}
        page={page}
        paragraph={paragraph("p1", "Ruler")}
      />,
    );
    expect(screen.queryByLabelText("Writer horizontal ruler")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Writer vertical ruler")).not.toBeInTheDocument();
  });

  it("separates paragraph and first-line indent triangles even at the same horizontal offset", /** Keeps the two drag controls visible and independently reachable. @returns Nothing. */ () => {
    const item = paragraph("same-offset", "Text");
    render(
      <WriterRulers
        horizontalVisible
        onPageChange={vi.fn()}
        onParagraphIndentChange={vi.fn()}
        page={page}
        paragraph={{
          ...item,
          computedStyle: { ...item.computedStyle, firstLineIndentPt: 0 },
          textLeftMargin: 0,
        }}
      />,
    );
    const bodyIndent = screen.getByRole("button", { name: "Paragraph left indent" });
    const firstLineIndent = screen.getByRole("button", { name: "First line indent" });
    const rightIndent = screen.getByRole("button", { name: "Paragraph right indent" });
    expect(bodyIndent.style.left).toBe(firstLineIndent.style.left);
    expect(bodyIndent.style.bottom).toBe("0px");
    expect(bodyIndent.style.top).toBe("");
    expect(firstLineIndent.style.top).toBe("0px");
    expect(firstLineIndent.style.bottom).toBe("");
    expect(rightIndent.style.bottom).toBe("0px");
  });

  it("anchors each vertical ruler to its rendered page and starts tick zero at the text margins", /** Verifies page ownership and origins. @returns Nothing. */ () => {
    const tinyPage = { ...page, bottomMargin: 100, height: 650, topMargin: 100 };
    const { container } = render(
      <WriterPlainTextEditor
        activeParagraphId="p1"
        cursorSelection={{ point: { paragraphId: "p1", offset: 0 } }}
        editWindow={{ FocusNode: vi.fn(), SetSelection: vi.fn() } as unknown as SwEditWin}
        pageDescriptor={tinyPage}
        paragraphs={[paragraph("p1", "first"), paragraph("p2", "second")]}
        verticalRuler={<WriterVerticalRuler onPageChange={vi.fn()} page={tinyPage} />}
      />,
    );
    const pages = container.querySelectorAll("[data-writer-page]");
    expect(pages).toHaveLength(2);
    for (const pageElement of pages) {
      const ruler = pageElement.parentElement?.querySelector(
        '[aria-label="Writer vertical ruler"]',
      );
      expect(ruler).not.toBeNull();
      expect(ruler?.querySelector("span")?.style.top).toBe(`${tinyPage.topMargin / 15}px`);
      expect(ruler?.querySelector("span")?.textContent).toBe("0");
    }
  });

  it("creates page frames from measured text lines", /** Keeps physical page breaks owned by Writer layout. @returns Nothing. */ () => {
    const shortPage = { ...page, bottomMargin: 100, height: 1100, topMargin: 100 };
    const inputs = Array.from(
      { length: 8 },
      /** Creates one measured paragraph. @param _unused - Array slot. @param index - Paragraph index. @returns Measured text input. */ (
        _unused,
        index,
      ) => ({
        id: `p${index}`,
        lines: [{ start: 0, end: 1, height: 300 }],
        lowerSpacing: 0,
        style: "body-text",
        contextualSpacing: false,
        upperSpacing: 0,
      }),
    );
    expect(
      createSwPageFrames(inputs, shortPage).map(
        /** Counts text frames per page. @param frame - Page frame. @returns Count. */ (frame) =>
          frame.textFrames.length,
      ),
    ).toEqual([3, 3, 2]);
  });

  it("renders a measured long paragraph as two fragments with source-node caret offsets", /** Checks browser line measurement and source coordinates. @returns Test result. */ async () => {
    let lineStep = 20;
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      /** Browser resize observer test double. */
      class {
        /** Records the observed browser measurement host. @returns Nothing. */
        public observe = observe;
        /** Records cleanup. @returns Nothing. */
        public disconnect = disconnect;
      },
    );
    Object.defineProperty(Range.prototype, "getClientRects", {
      configurable: true,
      /** Returns deterministic browser line rectangles. @param this - Measured range. @returns Visual line geometry. */
      value: function (this: Range): DOMRectList {
        return [
          { top: Math.floor(this.startOffset / 2) * lineStep, height: 20 },
        ] as unknown as DOMRectList;
      },
    });
    try {
      const shortPage = { ...page, bottomMargin: 100, height: 1100, topMargin: 100 };
      const { container, unmount } = render(
        <WriterPlainTextEditor
          activeParagraphId="split"
          cursorSelection={{ point: { paragraphId: "split", offset: 8 } }}
          editWindow={{ FocusNode: vi.fn(), SetSelection: vi.fn() } as unknown as SwEditWin}
          pageDescriptor={shortPage}
          paragraphs={[paragraph("split", "abcdefghij")]}
        />,
      );
      await waitFor(
        /** Waits for the measured follow frame. @returns Nothing. */ () =>
          expect(container.querySelectorAll("[data-writer-page]")).toHaveLength(2),
      );
      const fragments = container.querySelectorAll<HTMLParagraphElement>(
        "article [data-writer-paragraph-id='split']",
      );
      expect(
        [...fragments].map(
          /** Reads one visible fragment. @param element - Fragment element. @returns Visible text. */ (
            element,
          ) => element.textContent,
        ),
      ).toEqual(["abcdef", "ghij"]);
      expect(
        [...fragments].map(
          /** Reads a source offset. @param element - Fragment element. @returns Starting offset. */ (
            element,
          ) => element.dataset.writerFragmentStart,
        ),
      ).toEqual(["0", "6"]);
      expect(getWriterDomSelection(globalThis.getSelection())?.point).toMatchObject({
        paragraphId: "split",
        offset: 8,
      });
      expect(observe).toHaveBeenCalledOnce();
      lineStep = 30;
      fireEvent(window, new Event("resize"));
      await waitFor(
        /** Waits for the resized line layout. @returns Nothing. */ () =>
          expect(container.querySelectorAll("[data-writer-page]")).toHaveLength(3),
      );
      unmount();
      expect(disconnect).toHaveBeenCalledOnce();
    } finally {
      Reflect.deleteProperty(Range.prototype, "getClientRects");
      vi.unstubAllGlobals();
    }
  });

  it("paginates by physical text area and renders optional workspace regions", /** Exercises page grouping and workspace branches. @returns Nothing. */ () => {
    expect(createSwPageFrames([], page)).toEqual([{ descriptor: page, number: 1, textFrames: [] }]);

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
