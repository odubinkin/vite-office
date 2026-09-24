/** @fileoverview Verifies browser projection of Writer character colors and highlights. */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { WriterParagraphProjection } from "../presentation/writer-view-projection";
import { WriterEditableParagraph } from "./WriterEditableParagraph";

/** Creates one minimal immutable paragraph projection. @param color - Paragraph color. @param highlight - Paragraph highlight. @returns Projection. */
function paragraph(color?: string, highlight?: string): WriterParagraphProjection {
  return {
    alignment: "left",
    computedStyle: {
      ...(color === undefined ? {} : { color }),
      firstLineIndentPt: 0,
      fontStyle: "normal",
      fontSizePt: 12,
      fontWeight: 400,
      ...(highlight === undefined ? {} : { highlight }),
      lineHeight: 1,
      lowerSpacingPt: 0,
      rightMarginPt: 0,
      upperSpacingPt: 0,
    },
    id: "color-paragraph",
    list: { kind: "none", level: 0 },
    listId: "",
    numRuleName: "",
    nodeIndex: 0,
    runs: [
      {
        attributes: {
          bold: false,
          color: "#123456",
          highlight: "#abcdef",
          italic: false,
          underline: false,
        },
        startOffset: 0,
        text: "explicit",
      },
      {
        attributes: {
          bold: false,
          color: "auto",
          highlight: "transparent",
          italic: false,
          underline: false,
        },
        startOffset: 8,
        text: "automatic",
      },
    ],
    style: "default",
    styleDisplayName: "Default Paragraph Style",
    text: "explicitautomatic",
    textLeftMargin: 0,
  };
}

describe("Writer editable paragraph colors", /** Groups color rendering tests. @returns Nothing. */ () => {
  it("places enabled line numbers beside the paragraph", /** Verifies line-number presentation. @returns Nothing. */ () => {
    render(
      <WriterEditableParagraph
        index={0}
        isActive
        listMarker={undefined}
        paragraph={paragraph()}
        lineNumbers={[
          { number: 1, topPt: 0 },
          { number: 2, topPt: 14 },
        ]}
        retainElement={/** Ignores the mounted node. @returns Nothing. */ () => undefined}
      />,
    );
    expect(screen.getByText("1")).toHaveStyle({ top: "0pt" });
    expect(screen.getByText("2")).toHaveStyle({ top: "14pt" });
  });
  it("renders a compact list marker and semantic hyperlink separately from body text", /** Checks renders a compact list marker and semantic hyperlink separately from body text. @returns Test callback result. */ () => {
    const source = paragraph();
    const view = render(
      <WriterEditableParagraph
        index={0}
        isActive
        listMarker="•"
        paragraph={{
          ...source,
          list: { kind: "bullet", level: 0 },
          listLayout: {
            firstLineIndentPt: -18,
            indentAtPt: 36,
            labelFollowedBy: "nothing",
            listTabPositionPt: 36,
          },
          runs: [
            {
              attributes: { bold: false, italic: false, underline: false },
              hyperlink: { url: "https://example.com", targetFrame: "_blank" },
              startOffset: 0,
              text: "Example",
            },
          ],
          text: "Example",
        }}
        retainElement={
          /** Runs the test callback. @returns Test callback result. */ () => undefined
        }
      />,
    );
    expect(screen.getByTestId("writer-list-marker-color-paragraph")).not.toHaveStyle({
      width: "18pt",
    });
    expect(screen.getByRole("link", { name: "Example" })).toHaveAttribute("target", "_blank");
    view.rerender(
      <WriterEditableParagraph
        index={0}
        isActive
        listMarker={undefined}
        paragraph={{
          ...source,
          runs: [
            {
              attributes: { bold: false, italic: false, underline: false },
              hyperlink: { url: "https://example.com" },
              startOffset: 0,
              text: "Example",
            },
          ],
          text: "Example",
        }}
        retainElement={
          /** Runs the test callback. @returns Test callback result. */ () => undefined
        }
      />,
    );
    expect(screen.getByRole("link", { name: "Example" })).not.toHaveAttribute("target");
  });
  it("keeps list text beyond its marker slot when the paragraph also has a hanging indent", /** Checks the first-line list text offset and adjacent paragraph spacing. @returns Nothing. */ () => {
    const item: WriterParagraphProjection = {
      ...paragraph(),
      computedStyle: { ...paragraph().computedStyle, firstLineIndentPt: -18, upperSpacingPt: 8 },
      list: { kind: "bullet", level: 0 },
      listLayout: {
        firstLineIndentPt: -18,
        indentAtPt: 36,
        labelFollowedBy: "listtab",
        listTabPositionPt: 36,
      },
    };
    render(
      <WriterEditableParagraph
        index={0}
        isActive
        listMarker="•"
        paragraph={item}
        topSpacingPt={20}
        retainElement={/** Ignores the mounted node. @returns Nothing. */ () => undefined}
      />,
    );
    const marker = screen.getByTestId("writer-list-marker-color-paragraph");
    const editor = screen.getByRole("textbox", { name: "Writer document text" });
    expect(marker).toHaveStyle({ width: "18pt", textAlign: "left" });
    expect(marker.parentElement).toHaveStyle({ marginInlineStart: "18pt" });
    expect(marker.parentElement?.parentElement).toHaveStyle({ marginBlockStart: "20pt" });
    expect(editor).not.toHaveStyle({ textIndent: "-18pt" });
  });

  it("retains list text alignment in a follow frame without repeating its marker", /** Checks the upstream list label only appears on the master frame. @returns Nothing. */ () => {
    const item: WriterParagraphProjection = {
      ...paragraph(),
      list: { kind: "bullet", level: 0 },
      listLayout: {
        firstLineIndentPt: -18,
        indentAtPt: 36,
        labelFollowedBy: "listtab",
        listTabPositionPt: 36,
      },
    };
    const { container } = render(
      <WriterEditableParagraph
        index={0}
        isActive
        isFollow
        listMarker="•"
        paragraph={item}
        retainElement={/** Ignores the mounted node. @returns Nothing. */ () => undefined}
      />,
    );
    expect(screen.queryByTestId("writer-list-marker-color-paragraph")).not.toBeInTheDocument();
    expect(container.querySelector(".shrink-0[aria-hidden='true']")).toHaveStyle({ width: "18pt" });
  });

  it("maps explicit and automatic Writer colors to CSS without changing model text", /** Verifies paragraph and run color branches. @returns Nothing. */ () => {
    const { rerender } = render(
      <WriterEditableParagraph
        index={0}
        isActive
        listMarker={undefined}
        paragraph={paragraph("#112233", "#ddeeff")}
        retainElement={/** Ignores the mounted node. @returns Nothing. */ () => undefined}
      />,
    );
    const editor = screen.getByRole("textbox", { name: "Writer document text" });
    expect(editor).toHaveStyle({ lineHeight: "1", minHeight: "12pt" });
    expect(editor).toHaveStyle({ backgroundColor: "rgb(221, 238, 255)", color: "rgb(17, 34, 51)" });
    expect(editor.querySelector('[style*="color: rgb(18, 52, 86)"]')).toHaveTextContent("explicit");
    expect(
      editor.querySelector('[style*="background-color: rgb(171, 205, 239)"]'),
    ).toHaveTextContent("explicit");
    expect(editor.querySelector('[style*="color: initial"]')).toHaveTextContent("automatic");
    expect(editor.querySelector('[style*="background-color: transparent"]')).toHaveTextContent(
      "automatic",
    );

    rerender(
      <WriterEditableParagraph
        index={0}
        isActive
        listMarker={undefined}
        paragraph={paragraph("auto", "transparent")}
        retainElement={/** Ignores the mounted node. @returns Nothing. */ () => undefined}
      />,
    );
    expect(screen.getByRole("textbox", { name: "Writer document text" })).not.toHaveStyle({
      color: "auto",
    });
  });
});
