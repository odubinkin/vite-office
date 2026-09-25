/** @fileoverview Checks the Writer formatting palettes and paragraph dialog. */
import { fireEvent, render, screen } from "@testing-library/react";
import { useMemo, useRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { WriterAdvancedFormattingControls as CommandAdvancedFormattingControls } from "./WriterAdvancedFormattingControls";
import type { BrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { getWriterCommandResource } from "../../uiconfig/swriter/writer-command-resources";
import type { WriterParagraphFormatValue } from "../../source/uibase/shells/textsh1";
import type { WriterParagraphDialogRequest } from "../../source/uibase/dialog/writer-dialog-controller";
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

/** Adapts the existing presentation scenarios to one controlled dialog request and slot source. @param props - Presentation callbacks and state. @returns Controlled formatting surface. */
function WriterAdvancedFormattingControls({
  color,
  highlight,
  paragraph,
  onColor,
  onLineSpacing,
  onParagraphFormat,
  showLineNumbers,
  onShowLineNumbersChange,
}: Readonly<{
  color: string;
  highlight: string;
  paragraph: WriterParagraphComputedStyle;
  onColor: (property: "color" | "highlight", value: string) => void;
  onLineSpacing: (percent: number) => void;
  onParagraphFormat: (value: WriterParagraphFormatValue) => void;
  showLineNumbers: boolean;
  onShowLineNumbersChange: (value: boolean) => void;
}>): React.JSX.Element {
  const [request, setRequest] = useState<
    Readonly<{ id: number; request: WriterParagraphDialogRequest }> | undefined
  >();
  const nextId = useRef(0);
  const source = useMemo<BrowserCommandSource>(
    /** Builds a stable command source for the current test inputs. @returns Slot source. */ () => ({
      /** Supplies a stable bindings snapshot for one command. @param commandUrl - Slot identity. @returns Controller item. */
      CreateControllerItem(commandUrl) {
        const value =
          commandUrl === WRITER_COMMAND_IDS.color
            ? color
            : commandUrl === WRITER_COMMAND_IDS.charBackColor
              ? highlight
              : commandUrl === WRITER_COMMAND_IDS.lineSpacing
                ? paragraph.lineSpacingMode === "proportional"
                  ? (paragraph.lineSpacingValue ?? 100)
                  : "custom"
                : undefined;
        const state = { enabled: true, value };
        return {
          /** Releases the test controller. @returns Nothing. */ Dispose() {},
          /** Reads the current slot value. @returns Command state. */ GetState() {
            return state;
          },
          /** Subscribes to an immutable test snapshot. @returns Unsubscribe. */ Subscribe() {
            return /** Releases the test subscription. @returns Nothing. */ () => undefined;
          },
        };
      },
      /** Emulates the active slot source. @param commandUrl - Slot identity. @param arguments_ - Command arguments. @returns Dispatch result. */
      Execute(commandUrl, arguments_) {
        if (
          commandUrl === WRITER_COMMAND_IDS.color ||
          commandUrl === WRITER_COMMAND_IDS.charBackColor
        )
          onColor(
            commandUrl === WRITER_COMMAND_IDS.color ? "color" : "highlight",
            (arguments_ as { color: string }).color,
          );
        else if (commandUrl === WRITER_COMMAND_IDS.lineSpacing)
          onLineSpacing((arguments_ as { percent: number }).percent);
        else if (commandUrl === WRITER_COMMAND_IDS.paragraphDialog) {
          const style = paragraph;
          setRequest({
            id: ++nextId.current,
            request: {
              commandUrl,
              kind: "paragraph",
              paintLineNumbers: showLineNumbers,
              initialValue: {
                upperPt: style.upperSpacingPt,
                lowerPt: style.lowerSpacingPt,
                contextual: style.contextualSpacing ?? false,
                lineMode: style.lineSpacingMode ?? "proportional",
                lineValue: style.lineSpacingValue ?? 100,
                fontIndependent: style.fontIndependentLineSpacing ?? false,
                tabStopsPt:
                  style.tabStopsPt ??
                  (style.tabStopPositionPt === undefined ? [] : [style.tabStopPositionPt]),
                keepWithNext: style.keepWithNext ?? false,
                countLineNumbers: style.countLineNumbers ?? true,
              },
            },
          });
        }
        return { commandId: commandUrl, status: "executed", value: true };
      },
      /** Resolves a test command. @returns No descriptor. */ QueryCommand() {
        return undefined;
      },
    }),
    [color, highlight, paragraph, onColor, onLineSpacing, showLineNumbers],
  );
  return (
    <>
      <button
        onClick={
          /** Opens the dialog from the test's Format menu stand-in. @returns Command result. */
          () => source.Execute(WRITER_COMMAND_IDS.paragraphDialog, undefined)
        }
        type="button"
      >
        Open Paragraph from Format menu
      </button>
      <CommandAdvancedFormattingControls
        key={request?.id ?? "closed"}
        commandSource={source}
        getCommandResource={getWriterCommandResource}
        paragraph={paragraph}
        {...(request === undefined ? {} : { dialogRequest: request })}
        onDialogCancel={
          /** Cancels the active test request. @param id - Request identity. @returns Nothing. */ (
            id,
          ) => {
            expect(id).toBe(request?.id);
            setRequest(undefined);
          }
        }
        onDialogSubmit={
          /** Commits the accepted draft. @param id - Request identity. @param value - Submitted settings. @returns Nothing. */ (
            id,
            value,
          ) => {
            expect(id).toBe(request?.id);
            onParagraphFormat(value.paragraphFormat);
            onShowLineNumbersChange(value.paintLineNumbers);
            setRequest(undefined);
          }
        }
      />
    </>
  );
}

describe("Writer advanced formatting controls", /** Handles Writer formatting state.  @returns Callback result. */ () => {
  it("dismisses the upstream color palette on outside press and Escape and reuses recent colors", /** Checks palette dismissal and recent colors. @returns Nothing. */ () => {
    const onColor = vi.fn();
    render(
      <WriterAdvancedFormattingControls
        color="auto"
        highlight="transparent"
        paragraph={paragraph}
        onColor={onColor}
        onLineSpacing={vi.fn()}
        onParagraphFormat={vi.fn()}
        showLineNumbers={false}
        onShowLineNumbersChange={vi.fn()}
      />,
    );
    const trigger = screen.getByLabelText("Font Color palette");
    const palette = trigger.closest("details") as HTMLDetailsElement;
    fireEvent.click(trigger);
    expect(palette.open).toBe(true);
    fireEvent.pointerDown(screen.getByRole("combobox", { name: "Font Color palette collection" }));
    expect(palette.open).toBe(true);
    fireEvent.pointerDown(document.body);
    expect(palette.open).toBe(false);
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Enter" });
    expect(palette.open).toBe(true);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(palette.open).toBe(false);
    fireEvent.click(trigger);
    fireEvent.change(screen.getByRole("combobox", { name: "Font Color palette collection" }), {
      target: { value: "LibreOffice" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Font Color #18a303" }));
    expect(onColor).toHaveBeenCalledWith("color", "#18a303");
    expect(palette.open).toBe(false);
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "Font Color recent #18a303" }));
    expect(onColor).toHaveBeenCalledTimes(2);
  });
  it("uses palette defaults when bindings have no selected color", /** Checks empty slot state. @returns Nothing. */ () => {
    const onColor = vi.fn();
    render(
      <WriterAdvancedFormattingControls
        color={undefined as unknown as string}
        highlight={undefined as unknown as string}
        paragraph={paragraph}
        onColor={onColor}
        onLineSpacing={vi.fn()}
        onParagraphFormat={vi.fn()}
        showLineNumbers={false}
        onShowLineNumbersChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Font Color" }));
    fireEvent.click(screen.getByRole("button", { name: "Character Highlighting Color" }));
    expect(onColor).toHaveBeenCalledWith("color", "#000000");
    expect(onColor).toHaveBeenCalledWith("highlight", "#ffff00");
  });
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
    expect(onColor).toHaveBeenCalledTimes(1);
    expect(screen.queryByLabelText("Line Spacing")).not.toBeInTheDocument();
    expect(onLineSpacing).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Open Paragraph from Format menu" }));
    fireEvent.mouseDown(screen.getByRole("dialog"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Above paragraph (pt)"), { target: { value: "6" } });
    fireEvent.change(screen.getByLabelText("First line indent (pt)"), { target: { value: "12" } });
    fireEvent.click(screen.getByLabelText("Automatic first-line indent"));
    fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
    fireEvent.change(screen.getByLabelText("Position (pt)"), { target: { value: "72" } });
    fireEvent.click(screen.getByText("New"));
    fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
    fireEvent.change(screen.getByLabelText("Page style"), { target: { value: "Standard" } });
    fireEvent.change(screen.getByLabelText("Page numbering"), { target: { value: "restart" } });
    fireEvent.change(screen.getByLabelText("Start page number"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("Page numbering"), { target: { value: "auto" } });
    expect(screen.queryByLabelText("Start page number")).toBeNull();
    fireEvent.change(screen.getByLabelText("Page numbering"), { target: { value: "restart" } });
    fireEvent.change(screen.getByLabelText("Start page number"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("Break before"), { target: { value: "page" } });
    fireEvent.change(screen.getByLabelText("Break after"), { target: { value: "page" } });
    fireEvent.click(screen.getByLabelText("Do not split paragraph"));
    fireEvent.change(screen.getByLabelText("Orphan control (lines)"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("Widow control (lines)"), {
      target: { value: "4" },
    });
    fireEvent.click(screen.getByLabelText("Keep with next paragraph"));
    fireEvent.click(screen.getByLabelText("Show line numbers"));
    fireEvent.click(screen.getByText("OK"));
    expect(onParagraphFormat).toHaveBeenCalledWith(
      expect.objectContaining({
        upperPt: 6,
        firstLineIndentPt: 12,
        autoTextIndent: true,
        tabStopsPt: [36, 72],
        keepWithNext: true,
        keepTogether: true,
        orphans: 3,
        widows: 4,
        breakBefore: "page",
        breakAfter: "page",
        pageStyleName: "Standard",
        pageNumber: 2,
      }),
    );
    expect(onShowLineNumbersChange).toHaveBeenCalledWith(true);
    expect(onParagraphFormat).toHaveBeenCalledTimes(1);
    expect(onShowLineNumbersChange).toHaveBeenCalledTimes(1);
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
    fireEvent.click(screen.getByLabelText("Character Highlighting Color palette"));
    fireEvent.click(screen.getByText("None"));
    expect(onColor).toHaveBeenCalledWith("highlight", "transparent");
    fireEvent.click(screen.getByRole("button", { name: "Character Highlighting Color" }));
    fireEvent.change(screen.getByLabelText("Character Highlighting Color custom color"), {
      target: { value: "#00ff00" },
    });
    expect(onColor).toHaveBeenCalledWith("highlight", "#00ff00");
    fireEvent.click(screen.getByRole("button", { name: "Open Paragraph from Format menu" }));
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
    fireEvent.click(screen.getByRole("button", { name: "Open Paragraph from Format menu" }));
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
    fireEvent.click(screen.getByRole("button", { name: "Open Paragraph from Format menu" }));
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
    fireEvent.click(screen.getByRole("button", { name: "Open Paragraph from Format menu" }));
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
  it("does not render a toolbar spacing selector when spacing is inherited", /** Checks the unsupported quick selector stays absent. @returns Nothing. */ () => {
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
    expect(screen.queryByLabelText("Line Spacing")).not.toBeInTheDocument();
  });
});
