/** @fileoverview Verifies the browser page dialog, rulers, pagination, and paged workspace chrome. */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createSwPageFrames } from "../../source/core/layout/newfrm";
import { getSwTextFrameGap, type SwTextFrameSettings } from "../../source/core/text/txtfrm";
import { SwLineNumberInfo } from "../../inc/lineinfo";
import { getWriterDomSelection } from "../editor/writer-selection";
import { WriterPlainTextEditor } from "../editor/WriterPlainTextEditor";
import { createDefaultWriterPageDescriptor } from "../../source/core/layout/pagedesc";
import type { SwEditWin } from "../../source/uibase/docvw/edtwin";
import { WriterPageStyleDialog } from "./WriterPageStyleDialog";
import { WriterRulers, WriterVerticalRuler } from "./WriterRulers";
import { WriterWorkspaceChrome } from "./WriterWorkspaceChrome";
import type { WriterParagraphProjection } from "./writer-view-projection";
import { createWriterDocument } from "../../source/core/doc/doc";
import { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import { RES_LINENUMBER } from "../../inc/hintids";

const page = createDefaultWriterPageDescriptor("en-GB").GetValue();

/** Gives detached browser fixtures canonical text nodes for layout ownership. @param paragraphs - Rendered paragraph fixtures. @returns Edit-window port. */
function layoutEditWindow(paragraphs: readonly WriterParagraphProjection[]): SwEditWin {
  const document = createWriterDocument();
  paragraphs.forEach(
    /** Creates each source node in presentation order. @param paragraph - Browser fixture. @param index - Source index. @returns Nothing. */ (
      paragraph,
      index,
    ) => {
      const node = index === 0 ? document.paragraphs[0] : document.GetNodes().MakeTextNode();
      if (node === undefined) throw new Error("Writer document has no first paragraph");
      node.SetText(paragraph.text);
      if (paragraph.computedStyle.countLineNumbers === false)
        node.SetAttr(new SfxBoolItem(RES_LINENUMBER, false));
    },
  );
  return {
    FocusNode: vi.fn(),
    SetSelection: vi.fn(),
    GetDoc: /** Resolves the detached editor document. @returns Canonical document. */ () =>
      document,
  } as unknown as SwEditWin;
}

/** Adapts test paragraph fixtures to core gap inputs. @param previous - Previous paragraph. @param current - Current paragraph. @param settings - Spacing options. @returns Gap in points. */
function gapPt(
  previous: WriterParagraphProjection | undefined,
  current: WriterParagraphProjection,
  settings?: SwTextFrameSettings,
): number {
  const input =
    /** Projects one test fixture. @param paragraph - Paragraph fixture. @returns Core spacing input. */ (
      paragraph: WriterParagraphProjection,
    ) => ({
      id: paragraph.id,
      lines: [],
      lowerSpacing: paragraph.computedStyle.lowerSpacingPt * 20,
      upperSpacing: paragraph.computedStyle.upperSpacingPt * 20,
      style: paragraph.style,
      contextualSpacing: paragraph.computedStyle.contextualSpacing ?? false,
    });
  return (
    getSwTextFrameGap(
      previous === undefined ? undefined : input(previous),
      input(current),
      settings,
    ) / 20
  );
}

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
    expect(gapPt(undefined, second)).toBe(12);
    expect(gapPt(first, second)).toBe(0);
    expect(
      gapPt(
        { ...first, computedStyle: { ...first.computedStyle, contextualSpacing: false } },
        second,
      ),
    ).toBe(24);
    expect(
      gapPt(first, {
        ...second,
        computedStyle: { ...second.computedStyle, contextualSpacing: false },
      }),
    ).toBe(24);
    expect(
      gapPt(
        {
          ...first,
          computedStyle: { ...first.computedStyle, lowerSpacingPt: 4, contextualSpacing: false },
        },
        second,
      ),
    ).toBe(16);
    expect(
      gapPt(first, {
        ...second,
        computedStyle: { ...second.computedStyle, upperSpacingPt: 4, contextualSpacing: false },
      }),
    ).toBe(16);
    expect(gapPt({ ...first, style: "heading-1" }, second)).toBe(24);
    expect(
      gapPt(
        { ...first, computedStyle: { ...first.computedStyle, contextualSpacing: false } },
        { ...second, computedStyle: { ...second.computedStyle, contextualSpacing: false } },
      ),
    ).toBe(24);
    expect(
      gapPt(
        { ...first, computedStyle: { ...first.computedStyle, contextualSpacing: false } },
        { ...second, computedStyle: { ...second.computedStyle, contextualSpacing: false } },
        { paraSpaceMax: false, paraSpaceMaxAtPages: false },
      ),
    ).toBe(12);
    expect(
      gapPt(undefined, second, {
        paraSpaceMax: true,
        paraSpaceMaxAtPages: false,
      }),
    ).toBe(0);
  });
});

describe("Writer imported formatting controls", /** Covers visual line numbers and ruler tab stops. @returns Nothing. */ () => {
  it("shows only participating paragraphs in continuous line numbering", /** Checks paragraph participation in the editor. @returns Nothing. */ () => {
    const paragraphs = [
      {
        ...paragraph("p1", "first"),
        computedStyle: { ...paragraph("p1", "first").computedStyle, countLineNumbers: true },
      },
      {
        ...paragraph("p2", "second"),
        computedStyle: { ...paragraph("p2", "second").computedStyle, countLineNumbers: false },
      },
    ];
    const { container } = render(
      <WriterPlainTextEditor
        activeParagraphId="p1"
        cursorSelection={{ point: { paragraphId: "p1", offset: 0 } }}
        editWindow={layoutEditWindow(paragraphs)}
        pageDescriptor={page}
        paragraphs={paragraphs}
        showLineNumbers
        lineNumberInfo={{ ...new SwLineNumberInfo().QueryValue(), countBy: 1 }}
      />,
    );
    expect(container.querySelectorAll("article span[aria-hidden='true']")).toHaveLength(1);
    expect(container.querySelector("article span[aria-hidden='true']")?.textContent).toBe("1");
  });

  it("adds and drags tab markers on the horizontal ruler", /** Checks ruler tab-stop callbacks. @returns Nothing. */ () => {
    const onTabStopAdd = vi.fn();
    const onTabStopMove = vi.fn();
    const item = paragraph("tabbed", "Text");
    const { container } = render(
      <WriterRulers
        horizontalVisible
        onPageChange={vi.fn()}
        onParagraphIndentChange={vi.fn()}
        onTabStopAdd={onTabStopAdd}
        onTabStopMove={onTabStopMove}
        page={page}
        paragraph={{ ...item, computedStyle: { ...item.computedStyle, tabStopsPt: [36] } }}
      />,
    );
    const rulerSurface = container.querySelector(
      '[aria-label="Writer horizontal ruler"] > div',
    ) as HTMLElement;
    fireEvent.click(rulerSurface, { clientX: 240 });
    expect(onTabStopAdd).toHaveBeenCalledWith(expect.any(Number));
    fireEvent.click(rulerSurface, { clientX: 0 });
    expect(onTabStopAdd).toHaveBeenCalledTimes(1);
    const handle = screen.getByRole("button", { name: "Tab stop 1" });
    fireEvent.pointerDown(handle, { clientX: 100 });
    fireEvent.pointerUp(window, { clientX: 115 });
    expect(onTabStopMove).toHaveBeenCalledWith(0, 237);
  });

  it("retains other tab stops when dragging a marker", /** Checks multi-stop ruler editing. @returns Nothing. */ () => {
    const onTabStopAdd = vi.fn();
    const onTabStopMove = vi.fn();
    const item = paragraph("tabbed", "Text");
    const { container, rerender } = render(
      <WriterRulers
        horizontalVisible
        onPageChange={vi.fn()}
        onParagraphIndentChange={vi.fn()}
        onTabStopAdd={onTabStopAdd}
        onTabStopMove={onTabStopMove}
        page={page}
        paragraph={{ ...item, computedStyle: { ...item.computedStyle, tabStopsPt: [36, 72] } }}
      />,
    );
    const handle = screen.getByRole("button", { name: "Tab stop 1" });
    fireEvent.pointerDown(handle, { clientX: 100 });
    fireEvent.pointerUp(window, { clientX: 115 });
    expect(onTabStopMove).toHaveBeenCalledWith(0, 237);
    rerender(
      <WriterRulers
        horizontalVisible
        onPageChange={vi.fn()}
        onParagraphIndentChange={vi.fn()}
        onTabStopAdd={onTabStopAdd}
        onTabStopMove={onTabStopMove}
        page={page}
        paragraph={{ ...item, computedStyle: { ...item.computedStyle, tabStopsPt: undefined } }}
      />,
    );
    const rulerSurface = container.querySelector(
      '[aria-label="Writer horizontal ruler"] > div',
    ) as HTMLElement;
    fireEvent.click(rulerSurface, { clientX: 240 });
    expect(onTabStopAdd).toHaveBeenLastCalledWith(expect.any(Number));
    rerender(
      <WriterRulers
        horizontalVisible
        onPageChange={vi.fn()}
        onParagraphIndentChange={vi.fn()}
        page={page}
        paragraph={item}
      />,
    );
    fireEvent.click(rulerSurface, { clientX: 240 });
    expect(onTabStopAdd).toHaveBeenCalledTimes(1);
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
  it("keeps screen measurements while print media is active", /** callback handles this value. @returns The result. */ () => {
    vi.stubGlobal(
      "matchMedia",
      /** stubGlobal handles this value. @returns The result. */ () => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    );
    try {
      const item = paragraph("print", "Printed text");
      const { container, unmount } = render(
        <WriterPlainTextEditor
          activeParagraphId="print"
          cursorSelection={{ point: { paragraphId: "print", offset: 0 } }}
          editWindow={layoutEditWindow([item])}
          pageDescriptor={page}
          paragraphs={[item]}
        />,
      );
      expect(container.querySelectorAll("[data-writer-page]")).toHaveLength(1);
      unmount();
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it("places table row fragments on physical pages without a scroll container", /** callback handles this value. @returns The result. */ async () => {
    const document = createWriterDocument();
    const first = document.paragraphs[0];
    if (first === undefined) throw new Error("Writer has no first paragraph.");
    first.SetText("Before");
    const table = document.nodes.MakeTableNode("Paged", { width: 1500 }, first);
    table.AddColumnWidth(1500);
    document.nodes.AppendTableRow(table, 1, { minHeight: 450 });
    document.nodes.AppendTableRow(table, 1, { minHeight: 450 });
    const after = document.nodes.MakeTextNode("After");
    const paragraphs = [
      { ...paragraph("before", "Before"), nodeIndex: first.GetIndex() },
      { ...paragraph("after", "After"), nodeIndex: after.GetIndex() },
    ];
    const editWindow = {
      FocusNode: vi.fn(),
      SetSelection: vi.fn(),
      GetDoc: /** GetDoc handles this value. @returns The result. */ () => document,
    } as unknown as SwEditWin;
    const shortPage = { ...page, bottomMargin: 100, height: 1100, topMargin: 100 };
    const { container } = render(
      <WriterPlainTextEditor
        activeParagraphId="before"
        cursorSelection={{ point: { paragraphId: "before", offset: 0 } }}
        editWindow={editWindow}
        pageDescriptor={shortPage}
        paragraphs={paragraphs}
      />,
    );
    await waitFor(
      /** callback handles this value. @returns The result. */ () =>
        expect(container.querySelectorAll("[data-writer-page]")).toHaveLength(2),
    );
    const visibleTables = container.querySelectorAll("[data-writer-page] [data-writer-table]");
    expect(visibleTables).toHaveLength(2);
    expect(
      [...visibleTables].map(
        /** map handles this value. @param item - Input 1. @returns The result. */ (item) =>
          item.querySelectorAll("tr").length,
      ),
    ).toEqual([1, 1]);
    expect(
      [...visibleTables].every(
        /** every handles this value. @param item - Input 1. @returns The result. */ (item) =>
          getComputedStyle(item).overflowY !== "auto",
      ),
    ).toBe(true);
    fireEvent(window, new Event("resize"));
    await waitFor(
      /** callback handles this value. @returns The result. */ () =>
        expect(container.querySelectorAll("[data-writer-page]")).toHaveLength(2),
    );
  });
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

  it("shows tenth-centimetre ticks and a snapped drag guide over the page", /** Checks visual and committed ruler positions share one increment. @returns Nothing. */ () => {
    const onPageChange = vi.fn();
    const onParagraphIndentChange = vi.fn();
    render(
      <WriterWorkspaceChrome
        documentTitle="Document"
        formattingToolbar={null}
        isPropertiesSidebarVisible={false}
        isStatusBarVisible={false}
        menuBar={null}
        onDocumentTitleChange={vi.fn()}
        propertiesSidebar={null}
        rulers={
          <WriterRulers
            horizontalVisible
            onPageChange={onPageChange}
            onParagraphIndentChange={onParagraphIndentChange}
            page={page}
            paragraph={paragraph("p1", "Text")}
          />
        }
        status="Ready"
        toolbar={null}
      >
        <section data-writer-page="1" />
      </WriterWorkspaceChrome>,
    );
    const ruler = screen.getByRole("toolbar", { name: "Writer horizontal ruler" });
    const ticks = ruler.querySelectorAll("span");
    const zero = [...ticks].find(
      /** Finds the origin label. @param tick - Ruler tick. @returns Whether it labels zero. */ (
        tick,
      ) => tick.textContent === "0",
    );
    expect(zero).toBeDefined();
    expect(
      [...ticks].some(
        /** Finds a minor division. @param tick - Ruler tick. @returns Whether it is minor. */ (
          tick,
        ) => tick.style.height === "4px",
      ),
    ).toBe(true);
    const handle = screen.getByRole("button", { name: "Left page margin" });
    fireEvent.pointerDown(handle, { clientX: 100 });
    fireEvent.pointerMove(window, { clientX: 107 });
    expect(handle.style.left).toBe(`${page.leftMargin / 15 + 2 * (1440 / 2.54 / 10 / 15)}px`);
    expect(document.querySelector('[data-ruler-guide="x"]')).not.toBeNull();
    fireEvent.pointerUp(window, { clientX: 107 });
    expect(onPageChange).toHaveBeenCalledWith("left", 113);
    expect(document.querySelector('[data-ruler-guide="x"]')).toBeNull();
    fireEvent.pointerDown(screen.getByRole("button", { name: "Paragraph left indent" }), {
      clientX: 100,
    });
    fireEvent.pointerUp(window, { clientX: 107 });
    expect(onParagraphIndentChange).toHaveBeenCalledWith("left", 107);
  });

  it("docks page rulers at the canvas edge and keeps their page-relative origins through scrolling", /** Verifies the fixed lane and page origins. @returns Nothing. */ () => {
    const tinyPage = { ...page, bottomMargin: 100, height: 650, topMargin: 100 };
    const paragraphs = [paragraph("p1", "first"), paragraph("p2", "second")];
    const { container } = render(
      <WriterWorkspaceChrome
        documentTitle="Document"
        formattingToolbar={null}
        isPropertiesSidebarVisible={false}
        isStatusBarVisible={false}
        isVerticalRulerVisible
        menuBar={null}
        onDocumentTitleChange={vi.fn()}
        propertiesSidebar={null}
        rulers={null}
        status="Ready"
        toolbar={null}
      >
        <WriterPlainTextEditor
          activeParagraphId="p1"
          cursorSelection={{ point: { paragraphId: "p1", offset: 0 } }}
          editWindow={layoutEditWindow(paragraphs)}
          pageDescriptor={tinyPage}
          paragraphs={paragraphs}
          verticalRuler={<WriterVerticalRuler onPageChange={vi.fn()} page={tinyPage} />}
        />
      </WriterWorkspaceChrome>,
    );
    const pages = container.querySelectorAll("[data-writer-page]");
    const lane = screen.getByLabelText("Writer vertical ruler lane");
    const canvas = screen.getByRole("region", { name: "Writer document canvas" });
    expect(pages).toHaveLength(2);
    expect(lane.parentElement).toBe(canvas.parentElement);
    expect(canvas.querySelector('[aria-label="Writer vertical ruler"]')).toBeNull();
    const rulers = lane.querySelectorAll('[aria-label="Writer vertical ruler"]');
    expect(rulers).toHaveLength(2);
    for (const ruler of rulers) {
      const zero = [...ruler.querySelectorAll("span")].find(
        /** Finds the page origin. @param tick - Ruler tick. @returns Whether it labels zero. */ (
          tick,
        ) => tick.textContent === "0",
      );
      expect(zero?.style.top).toBe(`${tinyPage.topMargin / 15}px`);
    }
    fireEvent.scroll(canvas, { target: { scrollTop: 25 } });
    expect((lane.firstElementChild as HTMLElement).style.transform).toBe("translateY(-25px)");
    fireEvent.pointerDown(rulers[1]?.querySelector('[aria-label="Top page margin"]') as Element, {
      clientY: 100,
    });
    expect(document.querySelectorAll('[data-ruler-guide="y"]')).toHaveLength(1);
    fireEvent.pointerCancel(window);
    expect(document.querySelector('[data-ruler-guide="y"]')).toBeNull();
    const canvasRect = vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
      top: 0,
      bottom: 100,
      left: 0,
      right: 100,
      width: 100,
      height: 100,
    } as DOMRect);
    const pageRect = vi.spyOn(pages[1] as HTMLElement, "getBoundingClientRect").mockReturnValue({
      top: 200,
      bottom: 300,
      left: 0,
      right: 100,
      width: 100,
      height: 100,
    } as DOMRect);
    fireEvent.pointerDown(rulers[1]?.querySelector('[aria-label="Top page margin"]') as Element, {
      clientY: 100,
    });
    expect(document.querySelector('[data-ruler-guide="y"]')).toBeNull();
    fireEvent.pointerCancel(window);
    pageRect.mockReturnValue({
      top: 50,
      bottom: 150,
      left: 0,
      right: 100,
      width: 100,
      height: 100,
    } as DOMRect);
    fireEvent.pointerDown(rulers[1]?.querySelector('[aria-label="Top page margin"]') as Element, {
      clientY: 100,
    });
    fireEvent.pointerMove(window, { clientY: 200 });
    expect(document.querySelector('[data-ruler-guide="y"]')).toBeNull();
    fireEvent.pointerCancel(window);
    pageRect.mockReturnValue({
      top: -20,
      bottom: 50,
      left: 0,
      right: 100,
      width: 100,
      height: 70,
    } as DOMRect);
    fireEvent.pointerDown(rulers[1]?.querySelector('[aria-label="Top page margin"]') as Element, {
      clientY: 100,
    });
    expect(document.querySelector('[data-ruler-guide="y"]')).toBeNull();
    fireEvent.pointerCancel(window);
    canvasRect.mockRestore();
    pageRect.mockRestore();
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
      const paragraphs = [paragraph("split", "abcdefghij")];
      const { container, unmount } = render(
        <WriterPlainTextEditor
          activeParagraphId="split"
          cursorSelection={{ point: { paragraphId: "split", offset: 8 } }}
          editWindow={layoutEditWindow(paragraphs)}
          pageDescriptor={shortPage}
          paragraphs={paragraphs}
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
    expect(createSwPageFrames([], page)).toEqual([
      { descriptor: page, number: 1, textFrames: [], tableFrames: [] },
    ]);

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
