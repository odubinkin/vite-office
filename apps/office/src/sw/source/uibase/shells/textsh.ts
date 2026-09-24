/** @fileoverview Owns the supported SwTextShell execute/state handlers from textsh1.cxx. */

import type { SfxShell } from "../../../../sfx2/source/control/shell";
import { createSfxShell } from "../../../../sfx2/source/control/shell";
import type { SfxInterface } from "../../../../sfx2/source/control/objface";
import { SfxListUndoAction, type SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { type SfxPoolItem } from "../../../../svl/source/items/poolitem";
import {
  SvxLineSpacingItem,
  SvxTabStop,
  SvxTabStopItem,
  SvxULSpaceItem,
} from "../../../../editeng/source/items/paraitem";
import {
  RES_KEEP,
  RES_LINENUMBER,
  RES_PARATR_LINESPACING,
  RES_PARATR_TABSTOP,
  RES_UL_SPACE,
} from "../../../inc/hintids";
import { SwPosition, getWriterSelectedTextRange, type WriterTextRange } from "../../core/crsr/pam";
import { isWriterParagraphStyle, type WriterParagraphStyle } from "../../core/doc/fmtcol";
import type {
  SwTextNode,
  WriterCharacterFormat,
  WriterParagraphAlignment,
} from "../../core/txtnode/ndtxt";
import {
  createWriterCharacterItemSet,
  projectWriterCharacterAttributes,
  type WriterCharacterAttributes,
} from "../../core/txtnode/txatbase";
import type { WriterHyperlink } from "../../core/txtnode/fmtinfmt";
import {
  CreateWriterFontSizeUndo,
  CreateWriterFontUndo,
  SwUndoAttr,
  SwUndoParagraphFormat,
  SwUndoParagraphItem,
} from "../../core/undo/unattr";
import { SwUndoFormatColl } from "../../core/undo/unfmco";
import type { SwUndoCursorState, SwUndoRedoContext } from "../../core/undo/undobj";
import { WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL } from "../../../inc/poolfmt";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import type { WriterDialogController } from "../dialog/writer-dialog-controller";
import { canChangeWriterParagraphListLevel } from "../../core/edit/ednumber";
import { createWriterHyperlinkAction, getWriterHyperlinkAtCursor } from "../../core/edit/editsh";
import { getWriterSelectedTextRanges } from "../wrtsh/wrtsh-selection";
import {
  createWriterInterface,
  getWriterCommandArguments,
  type WriterCharacterCommandArguments,
  type WriterHyperlinkCommandArguments,
} from "../../../sdi/swriter";

/** Cursor/model primitives consumed by the text shell without importing SwWrtShell. */
export interface SwTextShellTarget {
  readonly ApplyAction: (action: SfxUndoAction<SwUndoRedoContext>) => boolean;
  readonly CaptureCursorState: () => SwUndoCursorState;
  readonly GetActiveParagraph: () => SwTextNode;
  readonly GetCursor: () => import("../../core/crsr/pam").SwPaM;
  readonly GetDefaultFontFamily: () => string;
  readonly GetDefaultFontSizePt: () => number;
  readonly GetDoc: () => import("../../core/doc/doc").SwDoc;
  readonly GetDocShell: () => Readonly<{
    GetUndoManager(): Readonly<{
      BreakUndoGrouping(): void;
      GetRedoActionCount(): number;
      GetUndoActionCount(): number;
    }>;
  }>;
  readonly GetPendingCharacterItems: () => SfxItemSet;
  readonly IsMoveLeftMargin: (right: boolean, modulus?: boolean) => boolean;
  readonly MoveLeftMargin: (right: boolean, modulus?: boolean) => boolean;
  readonly NotifySelectionChanged: () => void;
  readonly NumUpDown: (down: boolean) => boolean;
  readonly Redo: () => boolean;
  readonly SetPaM: (point: SwPosition, mark?: SwPosition) => boolean;
  readonly SetPendingCharacterItems: (items: SfxItemSet) => void;
  readonly Undo: () => boolean;
}

/** Primitive values accepted by the supported Writer paragraph dialog. */
export interface WriterParagraphFormatValue {
  readonly upperPt: number;
  readonly lowerPt: number;
  readonly contextual: boolean;
  readonly lineMode: "proportional" | "fixed" | "minimum" | "leading";
  readonly lineValue: number;
  readonly fontIndependent: boolean;
  readonly tabStopsPt: readonly number[];
  readonly keepWithNext: boolean;
  readonly countLineNumbers: boolean;
}

/** Dedicated text context shell owning its execute/state registration. */
export class SwTextShell {
  private readonly shell: SfxShell;
  /** Creates the text-shell slot owner. @param target - Active Writer editing shell. @param dialogs - Writer dialog controller. @returns Nothing. */
  public constructor(
    private readonly target: SwTextShellTarget,
    dialogs: WriterDialogController,
  ) {
    this.shell = createSfxShell(this, createWriterTextCommandRegistry(this, dialogs));
  }
  /** Returns the dispatcher-facing shell. @returns Registered Sfx shell. */
  public GetShell(): SfxShell {
    return this.shell;
  }

  /** Returns on/off/mixed state for one direct character format. @param format - Writer format. @returns Selection-aware state. */
  public GetCharacterFormatState(format: WriterCharacterFormat): "mixed" | "off" | "on" {
    const ranges = getWriterSelectedTextRanges(this.target.GetCursor());
    if (ranges === undefined) return this.GetPendingCharacterAttributes()[format] ? "on" : "off";
    if (ranges.length === 0) return "mixed";
    const state = ranges[0]?.node.GetTextRangeFormatState(ranges[0].start, ranges[0].end, format);
    return ranges.every(
      /** Preserves the tri-state command state across every selected paragraph. @param range - Selected range. @returns Whether its state matches. */ (
        range,
      ) => range.node.GetTextRangeFormatState(range.start, range.end, format) === state,
    )
      ? (state as "off" | "on")
      : "mixed";
  }

  /** Applies direct character formatting through the text-shell responsibility. @param format - Writer format. @param range - Optional resolved range. @returns Whether content changed. */
  public ToggleCharacterFormat(format: WriterCharacterFormat, range?: WriterTextRange): boolean {
    if (range !== undefined) {
      const paragraph = range.node;
      if (paragraph.GetDoc() !== this.target.GetDoc())
        throw new Error("Writer text range is foreign.");
      if (
        !Number.isInteger(range.start) ||
        !Number.isInteger(range.end) ||
        range.start < 0 ||
        range.end < range.start ||
        range.end > paragraph.Len()
      )
        throw new Error("Writer text range is outside the paragraph.");
      const current = getWriterSelectedTextRange(this.target.GetCursor());
      if (
        current?.node !== range.node ||
        current.start !== range.start ||
        current.end !== range.end
      )
        this.target.SetPaM(
          new SwPosition(range.node, range.end),
          new SwPosition(range.node, range.start),
        );
    }
    const before = this.target.CaptureCursorState();
    const selected = getWriterSelectedTextRanges(this.target.GetCursor());
    this.target.SetPendingCharacterItems(
      createWriterCharacterItemSet(this.target.GetDoc().GetAttrPool(), {
        ...this.GetPendingCharacterAttributes(),
        [format]: this.GetCharacterFormatState(format) !== "on",
      }),
    );
    if (selected === undefined || selected.length === 0) {
      if (this.target.GetCursor().HasMark()) this.target.NotifySelectionChanged();
      this.target.GetDocShell().GetUndoManager().BreakUndoGrouping();
      return false;
    }
    const actions = selected.map(
      /** Creates one reversible fragment replacement per selected paragraph. @param range - Selected range. @returns Undo action. */ (
        range,
      ) =>
        new SwUndoAttr(
          range.node,
          range.start,
          range.node.CaptureTextFragment(range.start, range.end),
          range.node.CreateToggledTextFragment(range.start, range.end, format),
          before,
          before,
        ),
    );
    if (actions.length === 1) return this.target.ApplyAction(actions[0] as SwUndoAttr);
    const action = new SfxListUndoAction<SwUndoRedoContext>("Character Formatting");
    for (const child of actions) action.AddAction(child);
    return this.target.ApplyAction(action);
  }

  /** Returns the uniform hyperlink at the active selection or caret. @returns Hyperlink or undefined. */
  public GetHyperlinkAtCursor(): WriterHyperlink | undefined {
    return getWriterHyperlinkAtCursor(this.target.GetDoc(), this.target.GetCursor());
  }

  /** Applies or removes a hyperlink through the text shell. @param hyperlink - Link metadata. @param text - Optional inserted text. @param range - Optional resolved range. @returns Whether changed. */
  public SetHyperlink(
    hyperlink: WriterHyperlink | undefined,
    text?: string,
    range?: WriterTextRange,
  ): boolean {
    if (range !== undefined)
      this.target.SetPaM(
        new SwPosition(range.node, range.end),
        new SwPosition(range.node, range.start),
      );
    const action = createWriterHyperlinkAction(
      this.target.GetDoc(),
      this.target.GetCursor(),
      this.target.GetPendingCharacterItems(),
      this.target.CaptureCursorState(),
      hyperlink,
      text,
    );
    return action === undefined ? false : this.target.ApplyAction(action);
  }

  /** Applies a font family through one text-shell history action. @param fontFamily - Requested family. @returns Whether changed. */
  public SetFontFamily(fontFamily: string): boolean {
    const family = fontFamily.trim();
    if (family.length === 0) throw new Error("Writer font family must not be blank.");
    const before = this.target.CaptureCursorState();
    const selected = getWriterSelectedTextRanges(this.target.GetCursor());
    this.target.SetPendingCharacterItems(
      createWriterCharacterItemSet(this.target.GetDoc().GetAttrPool(), {
        ...this.GetPendingCharacterAttributes(),
        fontFamily: family,
      }),
    );
    if (selected === undefined || selected.length === 0) {
      this.target.GetDocShell().GetUndoManager().BreakUndoGrouping();
      this.target.NotifySelectionChanged();
      return false;
    }
    return this.ApplySelectedFontChange(
      selected,
      /** Creates one per-paragraph family change. @param range - Selected range. @returns Undo action. */ (
        range,
      ) =>
        CreateWriterFontUndo(
          range.node,
          range.start,
          range.end,
          family,
          before,
          this.target.CaptureCursorState(),
        ),
    );
  }

  /** Applies a font height through one text-shell history action. @param fontSizePt - Requested height in points. @returns Whether changed. */
  public SetFontSize(fontSizePt: number): boolean {
    const fontSizeTwips = fontSizePt * 20;
    if (!Number.isFinite(fontSizePt) || fontSizePt <= 0 || !Number.isInteger(fontSizeTwips))
      throw new Error("Writer font size must be a positive value representable in twips.");
    const before = this.target.CaptureCursorState();
    const selected = getWriterSelectedTextRanges(this.target.GetCursor());
    this.target.SetPendingCharacterItems(
      createWriterCharacterItemSet(this.target.GetDoc().GetAttrPool(), {
        ...this.GetPendingCharacterAttributes(),
        fontSizeTwips,
      }),
    );
    if (selected === undefined || selected.length === 0) {
      this.target.GetDocShell().GetUndoManager().BreakUndoGrouping();
      this.target.NotifySelectionChanged();
      return false;
    }
    return this.ApplySelectedFontChange(
      selected,
      /** Creates one per-paragraph height change. @param range - Selected range. @returns Undo action. */ (
        range,
      ) =>
        CreateWriterFontSizeUndo(
          range.node,
          range.start,
          range.end,
          fontSizeTwips,
          before,
          this.target.CaptureCursorState(),
        ),
    );
  }

  /** Applies foreground or highlight color at the caret or over selected text. @param property - Color attribute. @param value - Hex color or automatic marker. @returns Whether selected text changed. */
  public SetCharacterColor(property: "color" | "highlight", value: string): boolean {
    if (
      value !== (property === "color" ? "auto" : "transparent") &&
      !/^#[0-9a-fA-F]{6}$/.test(value)
    )
      throw new Error("Writer color must be a six-digit hex value or its automatic marker.");
    const before = this.target.CaptureCursorState();
    const selected = getWriterSelectedTextRanges(this.target.GetCursor());
    this.target.SetPendingCharacterItems(
      createWriterCharacterItemSet(this.target.GetDoc().GetAttrPool(), {
        ...this.GetPendingCharacterAttributes(),
        [property]: value,
      }),
    );
    if (selected === undefined || selected.length === 0) {
      this.target.GetDocShell().GetUndoManager().BreakUndoGrouping();
      this.target.NotifySelectionChanged();
      return false;
    }
    return this.ApplySelectedFontChange(
      selected,
      /** Handles Writer formatting state. @param range - Input value. @returns Callback result. */ (
        range,
      ) => {
        const original = range.node.CaptureTextFragment(range.start, range.end);
        const replacement = range.node.CreateColorTextFragment(
          range.start,
          range.end,
          property,
          value,
        );
        return original.hints.equals(replacement.hints)
          ? undefined
          : new SwUndoAttr(
              range.node,
              range.start,
              original,
              replacement,
              before,
              this.target.CaptureCursorState(),
            );
      },
    );
  }

  /** Applies an item to active or selected paragraphs in one history entry. @param item - Paragraph attribute. @returns Whether a paragraph changed. */
  public SetParagraphItem(item: SfxPoolItem): boolean {
    return this.SetParagraphItems([item]);
  }

  /** Applies the supported paragraph dialog through pooled items and one undo entry. @param value - Accepted primitive draft. @returns Whether formatting changed. */
  public ApplyParagraphFormat(value: WriterParagraphFormatValue): boolean {
    if (
      !Number.isFinite(value.upperPt) ||
      value.upperPt < 0 ||
      !Number.isFinite(value.lowerPt) ||
      value.lowerPt < 0 ||
      !Number.isInteger(value.lineValue) ||
      value.lineValue < 0 ||
      !["proportional", "fixed", "minimum", "leading"].includes(value.lineMode)
    )
      return false;
    const positions = value.tabStopsPt.map(
      /** Converts a dialog position to twips. @param position - Position in points. @returns Twips. */ (
        position,
      ) => Math.round(position * 20),
    );
    if (
      positions.some(
        /** Rejects positions outside the supported range. @param position - Twips. @returns Whether invalid. */ (
          position,
        ) => !Number.isInteger(position) || position <= 0 || position > 32767,
      )
    )
      return false;
    return this.ApplyParagraphItems(
      /** Builds each selected paragraph's items. @param paragraph - Selected paragraph. @returns Pooled items. */ (
        paragraph,
      ) => [
        new SvxULSpaceItem(
          Math.round(value.upperPt * 20),
          Math.round(value.lowerPt * 20),
          RES_UL_SPACE,
          value.contextual,
        ),
        new SvxLineSpacingItem(
          value.lineValue,
          RES_PARATR_LINESPACING,
          value.lineMode,
          value.fontIndependent,
        ),
        this.CreateTabStops(positions, paragraph),
        new SfxBoolItem(RES_KEEP, value.keepWithNext),
        new SfxBoolItem(RES_LINENUMBER, value.countLineNumbers),
      ],
    );
  }

  /** Applies the toolbar's proportional line-spacing value. @param percent - Percent. @returns Whether changed. */
  public SetLineSpacingPercent(percent: number): boolean {
    if (!Number.isInteger(percent) || percent < 0) return false;
    return this.SetParagraphItem(new SvxLineSpacingItem(percent, RES_PARATR_LINESPACING));
  }

  /** Replaces tab positions while retaining unchanged stops' alignment and leader. @param positions - Twip positions. @returns Whether changed. */
  public SetTabStopPositions(positions: readonly number[]): boolean {
    if (
      positions.some(
        /** Rejects positions outside the supported range. @param position - Twips. @returns Whether invalid. */ (
          position,
        ) => !Number.isInteger(position) || position <= 0 || position > 32767,
      )
    )
      return false;
    return this.SetParagraphItem(this.CreateTabStops(positions));
  }

  /** Builds the item against a paragraph's tab metadata. @param positions - Valid twip positions. @param paragraph - Source paragraph. @returns Pooled item. */
  private CreateTabStops(
    positions: readonly number[],
    paragraph = this.target.GetActiveParagraph(),
  ): SvxTabStopItem {
    const current = paragraph.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem;
    return SvxTabStopItem.FromStops(
      RES_PARATR_TABSTOP,
      positions.map(
        /** Retains metadata at unchanged positions. @param position - Twips. @returns Tab stop. */ (
          position,
        ) =>
          current.GetPos(position) !== 65535
            ? current.At(current.GetPos(position))
            : new SvxTabStop(position),
      ),
      current.GetDefaultDistance(),
    );
  }

  /** Applies paragraph dialog attributes in one history entry. @param items - Paragraph attributes. @returns Whether a paragraph changed. */
  public SetParagraphItems(items: readonly SfxPoolItem[]): boolean {
    return this.ApplyParagraphItems(
      /** Reuses the direct item set for each paragraph. @returns Items. */ () => items,
    );
  }

  /** Builds selected paragraph actions with each paragraph's own item state. @param createItems - Item factory. @returns Whether changed. */
  private ApplyParagraphItems(
    createItems: (paragraph: SwTextNode) => readonly SfxPoolItem[],
  ): boolean {
    const selected = getWriterSelectedTextRanges(this.target.GetCursor());
    const paragraphs =
      selected === undefined || selected.length === 0
        ? [this.target.GetActiveParagraph()]
        : [
            ...new Set(
              selected.map(
                /** Handles Writer formatting state. @param range - Input value. @returns Callback result. */ (
                  range,
                ) => range.node,
              ),
            ),
          ];
    const cursor = this.target.CaptureCursorState();
    const actions = paragraphs.flatMap(
      /** Handles Writer formatting state. @param paragraph - Input value. @returns Callback result. */ (
        paragraph,
      ) =>
        createItems(paragraph).flatMap(
          /** Handles Writer formatting state. @param item - Input value. @returns Callback result. */ (
            item,
          ) => {
            if (paragraph.GetAttr(item.Which()).equals(item)) return [];
            return [
              new SwUndoParagraphItem(
                paragraph,
                paragraph.GetSwAttrSet().GetItemIfSet(item.Which(), false),
                item,
                cursor,
                cursor,
              ),
            ];
          },
        ),
    );
    if (actions.length === 0) return false;
    if (actions.length === 1) return this.target.ApplyAction(actions[0] as SwUndoParagraphItem);
    const action = new SfxListUndoAction<SwUndoRedoContext>("Paragraph Formatting");
    for (const child of actions) action.AddAction(child);
    return this.target.ApplyAction(action);
  }

  /** Applies all non-no-op per-paragraph font actions as one Writer history entry. @param ranges - Selected ranges. @param createAction - Per-range action factory. @returns Whether content changed. */
  private ApplySelectedFontChange(
    ranges: readonly WriterTextRange[],
    createAction: (range: WriterTextRange) => SwUndoAttr | undefined,
  ): boolean {
    const actions = ranges.flatMap(
      /** Excludes paragraphs whose effective formatting already matches the request. @param range - Selected range. @returns Zero or one action. */ (
        range,
      ) => {
        const action = createAction(range);
        return action === undefined ? [] : [action];
      },
    );
    if (actions.length === 0) return false;
    if (actions.length === 1) return this.target.ApplyAction(actions[0] as SwUndoAttr);
    const action = new SfxListUndoAction<SwUndoRedoContext>("Character Formatting");
    for (const child of actions) action.AddAction(child);
    return this.target.ApplyAction(action);
  }

  /** Applies paragraph alignment through the text shell. @param alignment - Next alignment. @returns Whether changed. */
  public SetParagraphAlignment(alignment: WriterParagraphAlignment): boolean {
    const paragraph = this.target.GetActiveParagraph();
    if (paragraph.GetParagraphAlignment() === alignment) return false;
    const cursor = this.target.CaptureCursorState();
    return this.target.ApplyAction(
      new SwUndoParagraphFormat(
        paragraph,
        paragraph.GetParagraphAlignment(),
        alignment,
        cursor,
        cursor,
      ),
    );
  }

  /** Applies a paragraph style through the text shell. @param style - Style identity. @returns Whether changed. */
  public SetParagraphStyle(style: WriterParagraphStyle): boolean {
    if (!isWriterParagraphStyle(style))
      throw new Error(`Unsupported Writer paragraph style: ${style}`);
    const paragraph = this.target.GetActiveParagraph();
    if (paragraph.GetParagraphStyle() === style) return false;
    const cursor = this.target.CaptureCursorState();
    return this.target.ApplyAction(
      new SwUndoFormatColl(paragraph, paragraph.GetParagraphStyle(), style, cursor, cursor),
    );
  }

  /** Executes Writer's context-sensitive text indent command. @param increase - Direction. @param modulus - Snap to the document tab grid. @returns Whether changed. */
  public ChangeParagraphIndent(increase: boolean, modulus = true): boolean {
    const paragraph = this.target.GetActiveParagraph();
    if (paragraph.GetListKind() !== "none") return this.target.NumUpDown(increase);
    return this.target.MoveLeftMargin(increase, modulus);
  }

  /** Reports whether the text indent command has an available transition. @param increase - Direction. @returns Whether enabled. */
  public CanChangeParagraphIndent(increase: boolean): boolean {
    const paragraph = this.target.GetActiveParagraph();
    if (paragraph.GetListKind() !== "none")
      return canChangeWriterParagraphListLevel(this.target, increase ? "demote" : "promote");
    return this.target.IsMoveLeftMargin(increase);
  }

  /** Returns the active paragraph for command state. @returns Active text node. */
  public GetActiveParagraph(): SwTextNode {
    return this.target.GetActiveParagraph();
  }

  /** Returns pending character attributes for command state. @returns Attribute copy. */
  public GetPendingCharacterAttributes(): WriterCharacterAttributes {
    return projectWriterCharacterAttributes(this.target.GetPendingCharacterItems());
  }

  /** Returns the device-resolved default font. @returns Font family. */
  public GetDefaultFontFamily(): string {
    return this.target.GetDefaultFontFamily();
  }

  /** Returns the effective paragraph font height. @returns Font height in points. */
  public GetDefaultFontSizePt(): number {
    return this.target.GetDefaultFontSizePt();
  }

  /** Returns whether undo is available. @returns Availability. */
  public CanUndo(): boolean {
    return this.target.GetDocShell().GetUndoManager().GetUndoActionCount() > 0;
  }

  /** Returns whether redo is available. @returns Availability. */
  public CanRedo(): boolean {
    return this.target.GetDocShell().GetUndoManager().GetRedoActionCount() > 0;
  }

  /** Restores the previous Writer history state through cursor-owning SwWrtShell. @returns Whether navigation occurred. */
  public Undo(): boolean {
    return this.target.Undo();
  }

  /** Restores the following Writer history state through cursor-owning SwWrtShell. @returns Whether navigation occurred. */
  public Redo(): boolean {
    return this.target.Redo();
  }
}

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
    {
      capabilityId: "CAP-0112",
      /** Applies the Style argument carried by the numeric StyleApply request. @param _context - Bound shell. @param arguments_ - Parsed UNO arguments. @returns Whether content changed. */
      execute: (_context, arguments_: unknown): boolean => {
        const name = getWriterCommandArguments<Readonly<{ Style?: string }>>(arguments_)?.Style;
        const style = WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL.find(
          /** Matches a supported programmatic style name. @param candidate - Available style. @returns Whether matching. */ (
            candidate,
          ) =>
            (candidate.name === "Standard" ? "Default Paragraph Style" : candidate.name) === name,
        );
        if (style === undefined)
          throw new Error(`Unsupported Writer paragraph style: ${name ?? ""}`);
        return target.SetParagraphStyle(style.id);
      },
      /** Reads the active paragraph style value. @returns Stable style ID. */
      getStateValue: (): string => active().GetParagraphStyle(),
      id: WRITER_COMMAND_IDS.styleApply,
    },
  ]);
}
