/** @fileoverview Keeps native textsh1 command registration under the mandatory source-size limit. */
import type { SfxInterface } from "../../../../sfx2/source/control/objface";
import {
  createWriterInterface,
  getWriterCommandArguments,
  type WriterCharacterCommandArguments,
  type WriterHyperlinkCommandArguments,
} from "../../../sdi/swriter";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import type { SwTextShell, WriterParagraphFormatValue } from "./textsh1";
import type {
  WriterDialogController,
  WriterBookmarkDialogResult,
} from "../dialog/writer-dialog-controller";
import type { WriterCharacterFormat } from "../../core/txtnode/ndtxt";
import type { WriterHyperlink } from "../../core/txtnode/fmtatr2";
import { SvxLineSpacingItem } from "../../../../editeng/source/items/paraitem";
import { RES_PARATR_LINESPACING } from "../../../inc/hintids";

/** Creates the active SwWrtShell command registry. @param target - Persistent Writer editing shell. @param dialogController - Writer-owned dialog lifecycle. @returns Validated immutable descriptors. */
export function createWriterTextCommandRegistry(
  target: SwTextShell,
  dialogController: WriterDialogController,
): SfxInterface<SwTextShell> {
  const active =
    /** Reads the currently targeted paragraph. @returns Active paragraph projection. */ (): ReturnType<
      SwTextShell["GetActiveParagraph"]
    > => target.GetActiveParagraph();
  const characterCommand =
    /** Creates one direct-character command descriptor. @param id - Stable ID. @param format - Character attribute. @returns Command descriptor. */
    (id: string, format: WriterCharacterFormat) => ({
      capabilityId: "CAP-0109" as const,
      /** Toggles direct formatting through the editing shell. @returns Whether content changed. */
      execute: (): boolean => target.ToggleCharacterFormat(format),
      id,
      /** Reads the selection-aware toggle value. @returns Current checked state. */
      isChecked: (): boolean => target.GetCharacterFormatState(format) === "on",
      /** Reports a mixed direct-format selection. @returns True when selected text has both values. */
      isMixed: (): boolean => target.GetCharacterFormatState(format) === "mixed",
    });
  return createWriterInterface([
    ...(["bullet", "numbered", "none"] as const).map(
      /** Creates one list-kind command owned by listsh. @param kind - Requested list kind. @returns Descriptor. */ (
        kind,
      ) => {
        const id = {
          bullet: WRITER_COMMAND_IDS.unorderedList,
          none: WRITER_COMMAND_IDS.removeBullets,
          numbered: WRITER_COMMAND_IDS.orderedList,
        }[kind];
        return {
          capabilityId: "CAP-0105" as const,
          execute:
            /** Applies or toggles the captured list kind. @returns Whether changed. */ (): boolean =>
              target.SetParagraphListKind(
                kind !== "none" && target.GetListKind() === kind ? "none" : kind,
              ),
          id,
          isChecked: /** Reads active list kind. @returns Checked state. */ (): boolean =>
            target.GetListKind() === kind,
        };
      },
    ),
    {
      capabilityId: "CAP-0105" as const,
      execute:
        /** Joins the selected list to the nearest earlier one. @returns Whether changed. */ () =>
          target.ContinueNumbering(),
      id: WRITER_COMMAND_IDS.continueNumbering,
      isEnabled:
        /** Reads native preceding-list search availability. @returns Whether eligible. */ () =>
          target.CanContinueNumbering(),
    },
    {
      capabilityId: "CAP-0102",
      /** Restores the previous history state. @returns Whether navigation occurred. */
      execute: (): boolean => target.Undo(),
      id: WRITER_COMMAND_IDS.undo,
      /** Reads Undo availability. @returns Whether Undo is enabled. */
      isEnabled: (): boolean => target.CanUndo(),
    },
    {
      capabilityId: "CAP-0102",
      /** Restores the following history state. @returns Whether navigation occurred. */
      execute: (): boolean => target.Redo(),
      id: WRITER_COMMAND_IDS.redo,
      /** Reads Redo availability. @returns Whether Redo is enabled. */
      isEnabled: (): boolean => target.CanRedo(),
    },
    characterCommand(WRITER_COMMAND_IDS.bold, "bold"),
    characterCommand(WRITER_COMMAND_IDS.italic, "italic"),
    characterCommand(WRITER_COMMAND_IDS.underline, "underline"),
    characterCommand(WRITER_COMMAND_IDS.underlineSingle, "underline"),
    {
      capabilityId: "CAP-0135",
      /** Applies dialog hyperlink data to the current selection or caret. @param _context - Bound shell. @param arguments_ - Dialog payload. @returns Whether content changed. */
      execute: (_context, arguments_: unknown): boolean | Promise<boolean> => {
        const args = getWriterCommandArguments<WriterHyperlinkCommandArguments>(arguments_);
        if (args?.hyperlink !== undefined) return target.SetHyperlink(args.hyperlink, args.text);
        return dialogController
          .RequestHyperlinkDialog(WRITER_COMMAND_IDS.hyperlinkDialog, target.GetHyperlinkAtCursor())
          .then(
            /** Applies only an accepted controller result. @param result - Typed dialog fields or cancellation. @returns Whether Writer changed. */ (
              result,
            ) =>
              result === undefined ? false : target.SetHyperlink(result.hyperlink, result.text),
          );
      },
      /** Exposes current hyperlink metadata to the dialog presenter. @returns Hyperlink or undefined. */
      getStateValue: (): WriterHyperlink | undefined => target.GetHyperlinkAtCursor(),
      id: WRITER_COMMAND_IDS.hyperlinkDialog,
    },
    {
      capabilityId: "CAP-0135",
      /** Replaces the current hyperlink using dialog data. @param _context - Bound shell. @param arguments_ - Dialog payload. @returns Whether changed. */
      execute: (_context, arguments_: unknown): boolean | Promise<boolean> => {
        const args = getWriterCommandArguments<WriterHyperlinkCommandArguments>(arguments_);
        if (args?.hyperlink !== undefined) return target.SetHyperlink(args.hyperlink);
        return dialogController
          .RequestHyperlinkDialog(WRITER_COMMAND_IDS.editHyperlink, target.GetHyperlinkAtCursor())
          .then(
            /** Applies only an accepted controller result. @param result - Typed dialog fields or cancellation. @returns Whether Writer changed. */ (
              result,
            ) => (result === undefined ? false : target.SetHyperlink(result.hyperlink)),
          );
      },
      /** Reads current hyperlink metadata for dialog initialization. @returns Hyperlink or undefined. */
      getStateValue: (): WriterHyperlink | undefined => target.GetHyperlinkAtCursor(),
      id: WRITER_COMMAND_IDS.editHyperlink,
      /** Enables editing only for a uniform selected or caret link. @returns Whether enabled. */
      isEnabled: (): boolean => target.GetHyperlinkAtCursor() !== undefined,
    },
    {
      capabilityId: "CAP-0113",
      /** Opens the upstream-shaped bookmark dialog or applies a typed operation. @param _context - Bound shell. @param arguments_ - Optional test/dispatch fields. @returns Operation result. */
      execute: (_context, arguments_: unknown): boolean | Promise<boolean> => {
        const args = getWriterCommandArguments<{ bookmark?: WriterBookmarkDialogResult }>(
          arguments_,
        );
        if (args?.bookmark !== undefined) return target.ApplyBookmarkOperation(args.bookmark);
        return dialogController
          .RequestBookmarkDialog(
            WRITER_COMMAND_IDS.insertBookmark,
            target.GetBookmarkNames(),
            target.GetBookmarkAtCursor(),
          )
          .then(
            /** Applies an accepted bookmark action. @param result - Dialog result. @returns Whether changed. */
            (result) => (result === undefined ? false : target.ApplyBookmarkOperation(result)),
          );
      },
      id: WRITER_COMMAND_IDS.insertBookmark,
    },
    {
      capabilityId: "CAP-0112",
      /** Opens Insert Break and inserts a hard page break after acceptance. @param _context - Bound shell. @param arguments_ - Optional direct break kind. @returns Operation result. */
      execute: (_context, arguments_: unknown): boolean | Promise<boolean> => {
        const args = getWriterCommandArguments<{ breakKind?: "page" }>(arguments_);
        if (args?.breakKind === "page") return target.InsertHardPageBreak();
        return dialogController.RequestBreakDialog(WRITER_COMMAND_IDS.insertBreak).then(
          /** Applies the supported break kind. @param result - Dialog result. @returns Whether changed. */
          (result) => result?.breakKind === "page" && target.InsertHardPageBreak(),
        );
      },
      id: WRITER_COMMAND_IDS.insertBreak,
    },
    {
      capabilityId: "CAP-0112",
      /** Inserts the upstream direct page break without opening the break dialog. @returns Whether inserted. */
      execute: (): boolean => target.InsertHardPageBreak(),
      id: WRITER_COMMAND_IDS.insertPageBreak,
    },
    {
      capabilityId: "CAP-0135",
      /** Removes hyperlink metadata from the current selected link. @returns Whether changed. */
      execute: (): boolean => target.SetHyperlink(undefined),
      id: WRITER_COMMAND_IDS.removeHyperlink,
      /** Enables removal only for a uniform selected or caret link. @returns Whether enabled. */
      isEnabled: (): boolean => target.GetHyperlinkAtCursor() !== undefined,
    },
    {
      capabilityId: "CAP-0109",
      /** Applies a selected font. @param _context - Bound shell. @param arguments_ - Font arguments. @returns Whether changed. */
      execute: (_context, arguments_: unknown): boolean => {
        const args = getWriterCommandArguments<WriterCharacterCommandArguments>(arguments_);
        return args?.fontFamily === undefined ? false : target.SetFontFamily(args.fontFamily);
      },
      /** Reads the caret font. @returns Current family. */
      getStateValue: (): string =>
        target.GetPendingCharacterAttributes().fontFamily ?? target.GetDefaultFontFamily(),
      id: WRITER_COMMAND_IDS.fontName,
    },
    {
      capabilityId: "CAP-0109",
      /** Applies a selected font height. @param _context - Bound shell. @param arguments_ - Font arguments. @returns Whether changed. */
      execute: (_context, arguments_: unknown): boolean => {
        const args = getWriterCommandArguments<WriterCharacterCommandArguments>(arguments_);
        return args?.fontSizePt === undefined ? false : target.SetFontSize(args.fontSizePt);
      },
      /** Reads the caret font height. @returns Current height in points. */
      getStateValue: (): number =>
        (target.GetPendingCharacterAttributes().fontSizeTwips ??
          target.GetDefaultFontSizePt() * 20) / 20,
      id: WRITER_COMMAND_IDS.fontHeight,
    },
    ...(["color", "highlight"] as const).map(
      /** Creates one character color slot. @param property - Foreground or highlight. @returns Slot descriptor. */
      (property) => ({
        capabilityId: "CAP-0109" as const,
        /** Applies the requested color through SwTextShell. @param _context - Bound shell. @param arguments_ - Color argument. @returns Whether changed. */
        execute: (_context: SwTextShell, arguments_: unknown): boolean => {
          const color = getWriterCommandArguments<Readonly<{ color?: string }>>(arguments_)?.color;
          return color === undefined ? false : target.SetCharacterColor(property, color);
        },
        /** Reads the current color slot value. @returns Color or automatic marker. */
        getStateValue: (): string =>
          target.GetPendingCharacterAttributes()[property] ??
          (property === "color" ? "auto" : "transparent"),
        id: property === "color" ? WRITER_COMMAND_IDS.color : WRITER_COMMAND_IDS.charBackColor,
      }),
    ),
    {
      capabilityId: "CAP-0125",
      /** Applies a proportional line-spacing choice. @param _context - Bound shell. @param arguments_ - Percent argument. @returns Whether changed. */
      execute: (_context, arguments_: unknown): boolean => {
        const percent =
          getWriterCommandArguments<Readonly<{ percent?: number }>>(arguments_)?.percent;
        return percent === undefined ? false : target.SetLineSpacingPercent(percent);
      },
      /** Reads the active proportional spacing, or the custom sentinel. @returns Slot value. */
      getStateValue: (): number | "custom" => {
        const spacing = active().GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem;
        return spacing.GetMode() === "proportional" ? spacing.GetValue() : "custom";
      },
      id: WRITER_COMMAND_IDS.lineSpacing,
    },
    {
      capabilityId: "CAP-0125",
      /** Opens one shell-owned paragraph dialog and applies only accepted values. @returns Whether formatting changed. */
      execute: (): Promise<boolean> =>
        dialogController
          .RequestParagraphDialog(
            WRITER_COMMAND_IDS.paragraphDialog,
            target.GetParagraphFormat(),
            target.IsPaintLineNumbers(),
            target.GetPageStyleNames(),
          )
          .then(
            /** Applies accepted dialog data through Writer owners. @param result - Accepted value or cancellation. @returns Whether changed. */
            (result) => {
              if (result === undefined) return false;
              const paragraphChanged = target.ApplyParagraphFormat(result.paragraphFormat);
              const lineNumbersChanged = target.SetPaintLineNumbers(result.paintLineNumbers);
              return paragraphChanged || lineNumbersChanged;
            },
          ),
      /** Exposes current paragraph values to bindings. @returns Current format. */
      getStateValue: (): WriterParagraphFormatValue => target.GetParagraphFormat(),
      id: WRITER_COMMAND_IDS.paragraphDialog,
    },
    ...(["left", "center", "right", "justify"] as const).map(
      /** Creates one paragraph-alignment descriptor. @param alignment - Supported alignment. @returns Command descriptor. */
      (alignment) => ({
        capabilityId: "CAP-0112" as const,
        /** Applies the captured alignment. @returns Whether content changed. */
        execute: (): boolean => target.SetParagraphAlignment(alignment),
        id: {
          center: WRITER_COMMAND_IDS.alignCenter,
          justify: WRITER_COMMAND_IDS.alignJustify,
          left: WRITER_COMMAND_IDS.alignLeft,
          right: WRITER_COMMAND_IDS.alignRight,
        }[alignment],
        /** Compares the active alignment with this command. @returns Checked state. */
        isChecked: (): boolean => active().GetParagraphAlignment() === alignment,
      }),
    ),
    ...([true, false] as const).map(
      /** Creates one context-sensitive text-shell indent descriptor. @param increase - Whether indentation increases. @returns Command descriptor. */ (
        increase,
      ) => ({
        capabilityId: "CAP-0107" as const,
        /** Routes list paragraphs to NumUpDown and ordinary paragraphs to MoveLeftMargin semantics. @returns Whether content changed. */
        execute: (): boolean => target.ChangeParagraphIndent(increase),
        id: increase ? WRITER_COMMAND_IDS.increaseIndent : WRITER_COMMAND_IDS.decreaseIndent,
        /** Mirrors the upstream text-shell availability query for the active paragraph context. @returns Whether enabled. */
        isEnabled: (): boolean => target.CanChangeParagraphIndent(increase),
      }),
    ),
  ]);
}
