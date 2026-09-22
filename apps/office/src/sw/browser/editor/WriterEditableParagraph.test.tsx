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
  it("maps explicit and automatic Writer colors to CSS without changing model text", /** Verifies paragraph and run color branches. @returns Nothing. */ () => {
    const { rerender } = render(
      <WriterEditableParagraph
        index={0}
        isActive
        isLast
        listMarker={undefined}
        paragraph={paragraph("#112233", "#ddeeff")}
        retainElement={/** Ignores the mounted node. @returns Nothing. */ () => undefined}
      />,
    );
    const editor = screen.getByRole("textbox", { name: "Writer document text" });
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
        isLast
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
