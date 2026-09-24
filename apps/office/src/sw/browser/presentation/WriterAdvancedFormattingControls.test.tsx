/** @fileoverview Checks the Writer formatting palettes and paragraph dialog. */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WriterAdvancedFormattingControls } from "./WriterAdvancedFormattingControls";
import type { WriterParagraphComputedStyle } from "./writer-view-projection";

const paragraph: WriterParagraphComputedStyle = {
  firstLineIndentPt: 0,
  fontStyle: "normal",
  fontSizePt: 12,
  fontWeight: 400,
  lineHeight: 1.15,
  lineSpacingMode: "proportional",
  lineSpacingValue: 100,
  lowerSpacingPt: 0,
  rightMarginPt: 0,
  upperSpacingPt: 0,
  tabStopsPt: [36],
  countLineNumbers: true,
  keepWithNext: false,
};

describe("Writer advanced formatting controls", /** Handles Writer formatting state.  @returns Callback result. */ () => {
  it("applies palette colors and paragraph dialog values", /** Handles Writer formatting state.  @returns Callback result. */ () => {
    const onColor = vi.fn();
    const onLineSpacing = vi.fn();
    const onParagraphFormat = vi.fn();
    const onShowLineNumbersChange = vi.fn();
    render(
      <WriterAdvancedFormattingControls
        color="auto"
        highlight="transparent"
        paragraph={paragraph}
        onColor={onColor}
        onLineSpacing={onLineSpacing}
        onParagraphFormat={onParagraphFormat}
        showLineNumbers={false}
        onShowLineNumbersChange={onShowLineNumbersChange}
      />,
    );
    fireEvent.click(screen.getByLabelText("Font Color palette"));
    fireEvent.click(screen.getByLabelText("Font Color #ff0000"));
    expect(onColor).toHaveBeenCalledWith("color", "#ff0000");
    fireEvent.change(screen.getByLabelText("Line Spacing"), { target: { value: "150" } });
    expect(onLineSpacing).toHaveBeenCalledWith(150);
    fireEvent.click(screen.getByText("Paragraph…"));
    fireEvent.mouseDown(screen.getByRole("dialog"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Above paragraph (pt)"), { target: { value: "6" } });
    fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
    fireEvent.change(screen.getByLabelText("Position (pt)"), { target: { value: "72" } });
    fireEvent.click(screen.getByText("New"));
    fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
    fireEvent.click(screen.getByLabelText("Keep with next paragraph"));
    fireEvent.click(screen.getByLabelText("Show line numbers"));
    fireEvent.click(screen.getByText("OK"));
    expect(onParagraphFormat).toHaveBeenCalledWith(
      expect.objectContaining({
        upperPt: 6,
        tabStopsPt: [36, 72],
        keepWithNext: true,
      }),
    );
    expect(onShowLineNumbersChange).toHaveBeenCalledWith(true);
  });
  it("edits non-proportional spacing, resets a cancelled draft, and clears highlighting", /** Verifies additional dialog paths. @returns Nothing. */ () => {
    const onColor = vi.fn();
    const onParagraphFormat = vi.fn();
    const onShowLineNumbersChange = vi.fn();
    render(
      <WriterAdvancedFormattingControls
        color="#112233"
        highlight="#ffff00"
        paragraph={{
          ...paragraph,
          lineSpacingMode: "fixed",
          lineSpacingValue: 240,
          tabStopsPt: undefined,
        }}
        onColor={onColor}
        onLineSpacing={vi.fn()}
        onParagraphFormat={onParagraphFormat}
        showLineNumbers={true}
        onShowLineNumbersChange={onShowLineNumbersChange}
      />,
    );
    fireEvent.click(screen.getByLabelText("Character Highlighting palette"));
    fireEvent.click(screen.getByText("No Highlight"));
    expect(onColor).toHaveBeenCalledWith("highlight", "transparent");
    fireEvent.click(screen.getByRole("button", { name: "Character Highlighting" }));
    fireEvent.change(screen.getByLabelText("Character Highlighting custom color"), {
      target: { value: "#00ff00" },
    });
    expect(onColor).toHaveBeenCalledWith("highlight", "#00ff00");
    fireEvent.change(screen.getByLabelText("Line Spacing"), { target: { value: "custom" } });
    expect(screen.getByLabelText("Value (pt)")).toHaveValue(12);
    fireEvent.change(screen.getByLabelText("Below paragraph (pt)"), { target: { value: "8" } });
    fireEvent.click(screen.getByLabelText("Do not add space between paragraphs of the same style"));
    fireEvent.change(screen.getByLabelText("Line spacing"), { target: { value: "minimum" } });
    fireEvent.change(screen.getByLabelText("Value (pt)"), { target: { value: "16" } });
    fireEvent.click(screen.getByLabelText("Font-independent line spacing"));
    fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
    fireEvent.click(screen.getByLabelText("Include this paragraph in line numbering"));
    fireEvent.click(screen.getByText("Cancel"));
    expect(onParagraphFormat).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Paragraph…"));
    expect(screen.getByLabelText("Below paragraph (pt)")).toHaveValue(0);
    fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
    fireEvent.click(screen.getByText("Delete All"));
    fireEvent.click(screen.getByText("New"));
    fireEvent.change(screen.getByLabelText("Position (pt)"), { target: { value: "2000" } });
    fireEvent.click(screen.getByText("New"));
    expect(screen.queryByRole("option", { name: "2000 pt" })).toBeNull();
    fireEvent.change(screen.getByLabelText("Position (pt)"), { target: { value: "24" } });
    fireEvent.click(screen.getByText("New"));
    expect(screen.getByRole("option", { name: "24 pt" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Tab stops"), { target: { value: "24" } });
    fireEvent.click(screen.getByText("Delete"));
    expect(screen.queryByRole("option", { name: "24 pt" })).toBeNull();
    fireEvent.mouseDown(screen.getByRole("dialog").parentElement as HTMLElement);
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByText("Paragraph…"));
    fireEvent.change(screen.getByLabelText("Line spacing"), { target: { value: "leading" } });
    fireEvent.click(screen.getByText("OK"));
    expect(onParagraphFormat).toHaveBeenCalledWith(
      expect.objectContaining({ lineMode: "leading" }),
    );
    expect(onShowLineNumbersChange).toHaveBeenCalledWith(true);
  });
  it("supports preset spacing, automatic color, and inherited paragraph defaults", /** Checks fallback and preset controls. @returns Nothing. */ () => {
    const onColor = vi.fn();
    const onParagraphFormat = vi.fn();
    const inheritedParagraph: {
      -readonly [Key in keyof WriterParagraphComputedStyle]: WriterParagraphComputedStyle[Key];
    } = {
      ...paragraph,
      tabStopPositionPt: 48,
    };
    delete inheritedParagraph.lineSpacingMode;
    delete inheritedParagraph.lineSpacingValue;
    delete inheritedParagraph.tabStopsPt;
    delete inheritedParagraph.keepWithNext;
    delete inheritedParagraph.countLineNumbers;
    render(
      <WriterAdvancedFormattingControls
        color="auto"
        highlight="transparent"
        paragraph={inheritedParagraph}
        onColor={onColor}
        onLineSpacing={vi.fn()}
        onParagraphFormat={onParagraphFormat}
        showLineNumbers={false}
        onShowLineNumbersChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText("Font Color palette"));
    fireEvent.click(screen.getByText("Automatic"));
    expect(onColor).toHaveBeenCalledWith("color", "auto");
    fireEvent.click(screen.getByText("Paragraph…"));
    fireEvent.change(screen.getByLabelText("Line spacing"), { target: { value: "preset-150" } });
    expect(screen.getByLabelText("Value (%)")).toHaveValue(150);
    fireEvent.change(screen.getByLabelText("Value (%)"), { target: { value: "135" } });
    fireEvent.change(screen.getByLabelText("Line spacing"), { target: { value: "proportional" } });
    fireEvent.click(screen.getByText("OK"));
    expect(onParagraphFormat).toHaveBeenCalledWith(
      expect.objectContaining({
        lineMode: "proportional",
        lineValue: 100,
        tabStopsPt: [48],
        keepWithNext: false,
        countLineNumbers: true,
      }),
    );
  });
  it("shows single spacing when proportional value is inherited", /** Checks toolbar fallback. @returns Nothing. */ () => {
    const inheritedParagraph: {
      -readonly [Key in keyof WriterParagraphComputedStyle]: WriterParagraphComputedStyle[Key];
    } = { ...paragraph };
    delete inheritedParagraph.lineSpacingValue;
    render(
      <WriterAdvancedFormattingControls
        color="auto"
        highlight="transparent"
        paragraph={inheritedParagraph}
        onColor={vi.fn()}
        onLineSpacing={vi.fn()}
        onParagraphFormat={vi.fn()}
        showLineNumbers={false}
        onShowLineNumbersChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Line Spacing")).toHaveValue("100");
  });
});
