/** @fileoverview Keeps native textsh1 command registration under the mandatory source-size limit. */
import { SfxBoolItem } from "../../../../svl/inc/eitem";
import { SwNumRuleItem } from "../../core/para/paratr";
import { GetNumRuleFromPool, GetParagraphListStyleNames } from "../../core/doc/poolfmt-num";
import { editListStyle } from "../app/docst";
import { createWriterParagraphDialogInput } from "./textsh1-tabs";
import { createWriterEscapementCommands } from "./txtattr";

import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { FN_NUMBER_NEWSTART, FN_NUMBER_NEWSTART_AT, FN_PARAM_1 } from "../../../inc/cmdid";
import { SwPaM } from "../../core/crsr/pam";
import { ConvertAttrCharToGen, ConvertAttrGenToChar } from "../utlui/uitool";
import {
  SvxBoxInfoItem,
  SvxBoxInfoItemValidFlags,
} from "../../../../editeng/source/items/frmitems";
import { SID_ATTR_BORDER_INNER } from "../../../../svx/inc/svxids";
import { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import {
  RES_CHRATR_CROSSEDOUT,
  RES_PARATR_NUMRULE,
  WRITER_CHARACTER_WHICH_RANGES,
} from "../../../inc/hintids";
import { SfxItemSet, SfxItemState } from "../../../../svl/inc/itemset";
import { createAttributeToggleItem } from "../../../../sfx2/source/control/bindings";

import type { SfxInterface } from "../../../../sfx2/source/control/objface";
import {
  createWriterInterface,
  getWriterCommandArguments,
  type WriterCharacterCommandArguments,
  type WriterHyperlinkCommandArguments,
  type WriterSlotHandler,
} from "../../../sdi/swriter";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import type { SwTextShell, SwTextShellTarget, WriterParagraphFormatValue } from "./textsh1";
import type {
  WriterDialogController,
  WriterBookmarkDialogResult,
} from "../dialog/writer-dialog-controller";
import type { WriterCharacterFormat } from "../../core/txtnode/ndtxt";
import type { WriterHyperlink } from "../../core/txtnode/fmtatr2";
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";

import { SvxLRSpaceItem } from "../../../../editeng/inc/lrspitem";
import {
  SID_ATTR_CHAR_WIDTH_FIT_TO_LINE,
  SID_ATTR_PARA_LINESPACE,
  SID_ATTR_PARA_LRSPACE,
} from "../../../../editeng/inc/editids";

/** Creates the active SwWrtShell command registry. @param target - Persistent Writer editing shell. @param dialogController - Writer-owned dialog lifecycle. @param annotation - Original annotation slots. @param editShell - Native selection measurement. @returns Validated immutable descriptors. */
export function createWriterTextCommandRegistry(
  target: SwTextShell,
  dialogController: WriterDialogController,
  annotation: readonly WriterSlotHandler<SwTextShell>[],
  editShell: Pick<
    SwTextShellTarget,
    "GetScalingOfSelectedText" | "SetNumRuleStart" | "SetNodeNumStart" | "DelNumRules"
  >,
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
  /** Opens Execute's paragraph dialog branch for the original requesting slot. @param commandId - Native originating slot. @returns Whether accepted formatting changed. */
  function openParagraphDialog(commandId: string): Promise<boolean> {
    const active = target.GetActiveParagraph();
    const doc = active.GetDoc();
    return dialogController
      .RequestParagraphDialog(
        commandId,
        target.GetParagraphFormat(),
        target.IsPaintLineNumbers(),
        target.GetPageStyleNames(),
        createWriterParagraphDialogInput(target),
        GetParagraphListStyleNames(doc),
        active.GetTextFormatColl().IsAssignedToListLevelOfOutlineStyle(),
        /** Opens the selected named style through the document style command owner. @param name - Style UI name. @returns Nested template request. */
        (name) => editListStyle(doc, name),
      )
      .then(
        /** Applies accepted dialog data through Writer owners. @param result - Accepted value or cancellation. @returns Whether changed. */
        (result) => {
          if (result === undefined) return false;
          const output = result.pageItems?.Clone();
          const restartItem = output?.GetItemIfSet(FN_NUMBER_NEWSTART, false);
          const startItem = output?.GetItemIfSet(FN_NUMBER_NEWSTART_AT, false);
          const restart = restartItem instanceof SfxBoolItem ? restartItem.GetValue() : undefined;
          const start = startItem instanceof SfxUInt16Item ? startItem.GetValue() : undefined;
          output?.ClearItem(FN_NUMBER_NEWSTART);
          output?.ClearItem(FN_NUMBER_NEWSTART_AT);
          const rule = output?.GetItemIfSet(RES_PARATR_NUMRULE, false);
          const undo = doc.GetUndoManager();
          undo.StartUndo("Paragraph Formatting");
          try {
            let changed = false;
            if (rule instanceof SwNumRuleItem) {
              const name = rule.GetValue();
              if (name === "") changed = editShell.DelNumRules();
              else if (!GetNumRuleFromPool(doc, name)) output?.ClearItem(RES_PARATR_NUMRULE);
            }
            const formatted =
              result.paragraphFormatChanged === false
                ? target.SetParagraphItems(output?.entries() ?? [])
                : target.ApplyParagraphFormat(result.paragraphFormat, output);
            changed = formatted || changed;
            if (!(rule instanceof SwNumRuleItem && rule.GetValue() === "")) {
              if (restart !== undefined) {
                changed = editShell.SetNumRuleStart(restart) || changed;
                changed = editShell.SetNodeNumStart(start ?? 0xffff) || changed;
              } else if (start !== undefined) {
                changed = editShell.SetNodeNumStart(start) || changed;
                changed = editShell.SetNumRuleStart(false) || changed;
              }
            }
            return target.SetPaintLineNumbers(result.paintLineNumbers) || changed;
          } finally {
            undo.EndUndo();
            output?.Dispose();
          }
        },
      );
  }
  /** Opens the original standard Character dialog over Writer's current selection. @param command - Original slot. @param initialPage - Original notebook page. @returns Whether selected text changed. */
  async function openCharacterDialog(command: string, initialPage?: string): Promise<boolean> {
    const document = target.GetActiveParagraph().GetDoc();
    const input = new SfxItemSet(document.GetAttrPool(), [
      ...WRITER_CHARACTER_WHICH_RANGES,
      [SID_ATTR_BORDER_INNER, SID_ATTR_BORDER_INNER],
      [SID_ATTR_CHAR_WIDTH_FIT_TO_LINE, SID_ATTR_CHAR_WIDTH_FIT_TO_LINE],
    ]);
    target.GetTextCtrlState(input);
    const fit = editShell.GetScalingOfSelectedText();
    if (fit !== undefined) input.Put(new SfxUInt16Item(SID_ATTR_CHAR_WIDTH_FIT_TO_LINE, fit), true);
    ConvertAttrCharToGen(input);
    const border = new SvxBoxInfoItem(SID_ATTR_BORDER_INNER);
    border.SetDist(true);
    border.SetMinDist(true);
    border.SetDefDist(28);
    border.SetValid(SvxBoxInfoItemValidFlags.DISABLE);
    input.Put(border, true);
    const selection: SwPaM[] = [];
    for (const range of target.GetCharacterDialogSelection().GetRingContainer()) {
      const copy = new SwPaM(
        range.GetPoint(),
        range.HasMark() ? range.GetMark() : undefined,
        selection[0],
      );
      selection.push(copy);
    }
    try {
      const output = await dialogController.RequestCharacterDialog(
        command,
        input,
        "standard",
        initialPage,
      );
      if (!output) return false;
      try {
        if (
          !output.Count() ||
          target.GetActiveParagraph().GetDoc() !== document ||
          !target.CanFormatCharacters()
        )
          return false;
        output.ClearItem(SID_ATTR_BORDER_INNER);
        if (!output.Count()) return false;
        ConvertAttrGenToChar(output, input);
        return target.ExecTextCtrl(output, selection[0]);
      } finally {
        output.Dispose();
      }
    } finally {
      input.Dispose();
      for (const range of selection) range.Dispose();
    }
  }

  /** Reads original complete strikeout item state through the native UI/core boundary. @returns Independent item set. */
  function strikeoutState(): SfxItemSet {
    const state = new SfxItemSet(target.GetActiveParagraph().GetDoc().GetAttrPool(), [
      [RES_CHRATR_CROSSEDOUT, RES_CHRATR_CROSSEDOUT],
    ]);
    target.GetTextCtrlState(state);
    return state;
  }
  return createWriterInterface([
    ...annotation,
    ...createWriterEscapementCommands(target),
    ...(
      [
        [WRITER_COMMAND_IDS.fontDialog, undefined],
        [WRITER_COMMAND_IDS.fontEffectsDialog, "fonteffects"],
        [WRITER_COMMAND_IDS.fontPositionDialog, "position"],
      ] as const
    ).map<WriterSlotHandler<SwTextShell>>(
      /** Routes the three body Character slots through the native text shell. @param entry - Original slot and page override. @returns Slot handler. */
      ([id, fixedPage]) => ({
        id,
        /** Opens the requested standard Character page. @param _context - Bound text shell. @param args - Optional Page item. @returns Whether changed. */
        execute: (_context, args) => {
          const page = args.find(
            /** Finds the original Page parameter. @param item - Request item. @returns Whether it selects a page. */
            (item): item is SfxStringItem =>
              item instanceof SfxStringItem && item.Which() === FN_PARAM_1,
          );
          return openCharacterDialog(id, fixedPage ?? page?.GetValue());
        },
        /** Observes native text editability. @returns Whether enabled. */
        isEnabled: () => target.CanFormatCharacters(),
      }),
    ),
    ...([true, false] as const).map(
      /** Original distinct Grow/Shrink slots share native execute/state logic. @param grow - Native grow direction. @returns Original handler. */ (
        grow,
      ) => ({
        capabilityId: "CAP-0109" as const,
        id: grow ? ".uno:Grow" : ".uno:Shrink",
        /** Executes actual shell range processing. @returns Whether changed. */ execute: () =>
          target.ChangeFontSize(grow),
        /** Retains native exact-bound disabling. @returns Enabled. */ isEnabled: () =>
          target.CanChangeFontSize(grow),
      }),
    ),
    {
      capabilityId: "CAP-0125",
      id: WRITER_COMMAND_IDS.paragraphMargins,
      /** Executes the native typed item path without opening a dialog. @param context - Bound text shell. @param args - Actual request items. @returns Whether changed. */
      execute: (context, args): boolean | Promise<boolean> => {
        const item = args.find(
          /** Resolves the native indent argument. @param item - Actual request item. @returns Whether this slot. */
          (item) => item.Which() === SID_ATTR_PARA_LRSPACE,
        );
        return item instanceof SvxLRSpaceItem
          ? context.ApplyParagraphLRSpace(item)
          : openParagraphDialog(WRITER_COMMAND_IDS.paragraphMargins);
      },
      /** Reads uniform native indent state. @returns Independent slot item or mixed state. */
      getStateValue: () => target.GetParagraphLRSpace(),
      /** Reports invalid aggregate state. @returns Whether the selection differs. */
      isMixed: () => target.GetParagraphLRSpace() === undefined,
    },
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
    {
      id: WRITER_COMMAND_IDS.strikeout,
      capabilityId: "CAP-0109",
      /** Uses the original enum-bool toggle preparation and complete typed request. @param context - Native shell. @param args - Request items. @returns Whether selected text changed. */
      execute: (context, args) => {
        const supplied = args.find(
          /** Resolves the original character item. @param item - Request item. @returns Match. */
          (item) => item.Which() === RES_CHRATR_CROSSEDOUT,
        );
        const item =
          supplied ??
          createAttributeToggleItem(
            strikeoutState(),
            RES_CHRATR_CROSSEDOUT,
            SvxCrossedOutItem.CreateDefault,
          );
        if (!(item instanceof SvxCrossedOutItem)) return false;
        const items = new SfxItemSet(strikeoutState().GetPool(), [
          [RES_CHRATR_CROSSEDOUT, RES_CHRATR_CROSSEDOUT],
        ]);
        items.Put(item);
        return context.ExecTextCtrl(items);
      },
      /** Publishes the original complete enum item. @returns Independent item or mixed state. */
      getStateValue: () => strikeoutState().GetItemIfSet(RES_CHRATR_CROSSEDOUT, false),
      /** Reads the native bool interface without collapsing mixed enums. @returns Checked state. */
      isChecked: () =>
        (
          strikeoutState().GetItemIfSet(RES_CHRATR_CROSSEDOUT, false) as
            SvxCrossedOutItem | undefined
        )?.GetBoolValue() ?? false,
      /** Reports exact enum disagreement. @returns Whether mixed. */
      isMixed: () =>
        strikeoutState().GetItemState(RES_CHRATR_CROSSEDOUT, false) === SfxItemState.INVALID,
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
        const initialHyperlink = target.GetHyperlinkAtCursor();
        return dialogController
          .RequestHyperlinkDialog(WRITER_COMMAND_IDS.hyperlinkDialog, initialHyperlink)
          .then(
            /** Applies only an accepted controller result. @param result - Typed dialog fields or cancellation. @returns Whether Writer changed. */ (
              result,
            ) =>
              result === undefined
                ? false
                : target.SetHyperlink(
                    result.hyperlink,
                    initialHyperlink === undefined ? result.text : undefined,
                  ),
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
        if (!target.PrepareEditHyperlink()) return false;
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
      /** Uses native current SET or beginning-of-link Default lookup. @returns Whether enabled. */
      isEnabled: (): boolean => target.CanEditHyperlink(),
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
      execute: (): boolean => target.RemoveHyperlink(),
      id: WRITER_COMMAND_IDS.removeHyperlink,
      /** Enables removal only for a uniform selected or caret link. @returns Whether enabled. */
      isEnabled: (): boolean => target.CanRemoveHyperlink(),
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
      /** Original typed line-spacing request copies the complete native item. Legacy percent requests retain their existing adapter. @param _context - Bound shell. @param arguments_ - Actual request items. @returns Whether changed. */
      execute: (_context, arguments_): boolean => {
        const item = arguments_.find(
          /** Finds the native line-spacing slot. @param candidate - Request item. @returns Whether mapped. */
          (candidate) =>
            active().GetDoc().GetAttrPool().GetWhichIDFromSlotID(candidate.Which()) ===
            active().GetDoc().GetAttrPool().GetWhichIDFromSlotID(SID_ATTR_PARA_LINESPACE),
        );
        if (item instanceof SvxLineSpacingItem) return target.ApplyLineSpacing(item);
        const percent =
          getWriterCommandArguments<Readonly<{ percent?: number }>>(arguments_)?.percent;
        return percent === undefined ? false : target.SetLineSpacingPercent(percent);
      },
      /** Reads native item state without discarding nonproportional modes. @returns Complete item or mixed. */
      getStateValue: () => target.GetLineSpacing(),
      /** Original invalid aggregate has no uniform item. @returns Whether mixed. */
      isMixed: () => target.GetLineSpacing() === undefined,
      id: WRITER_COMMAND_IDS.lineSpacing,
    },
    {
      capabilityId: "CAP-0125",
      /** Opens the native paragraph dialog. @returns Whether accepted formatting changed. */
      execute: () => openParagraphDialog(WRITER_COMMAND_IDS.paragraphDialog),
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
