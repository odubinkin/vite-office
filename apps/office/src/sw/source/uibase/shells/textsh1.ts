/** @fileoverview Owns the supported SwTextShell execute/state handlers from textsh1.cxx. */
import type { SfxShell } from "../../../../sfx2/source/control/shell";
import { createSfxShell } from "../../../../sfx2/source/control/shell";
import { SfxListUndoAction, type SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { type SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import {
  SvxLineSpacingItem,
  SvxTabAdjust,
  SvxTabStop,
  SvxTabStopItem,
} from "../../../../editeng/source/items/paraitem";
import { SvxFirstLineIndentItem, SvxULSpaceItem } from "../../../../editeng/source/items/frmitems";
import {
  RES_KEEP,
  RES_MARGIN_FIRSTLINE,
  RES_BREAK,
  RES_PAGEDESC,
  RES_PARATR_SPLIT,
  RES_PARATR_ORPHANS,
  RES_PARATR_WIDOWS,
  RES_LINENUMBER,
  RES_PARATR_LINESPACING,
  RES_PARATR_TABSTOP,
  RES_UL_SPACE,
} from "../../../inc/hintids";
import { SwPosition, getWriterSelectedTextRange, type WriterTextRange } from "../../core/crsr/pam";
import type { WriterCharacterFormat, WriterParagraphAlignment } from "../../core/txtnode/ndtxt";
import {
  createWriterCharacterItemSet,
  projectWriterCharacterAttributes,
  type WriterCharacterAttributes,
} from "../../core/txtnode/txatbase";
import type { WriterHyperlink } from "../../core/txtnode/fmtatr2";
import type { SwLineNumberInfo } from "../../../inc/lineinfo";
import {
  CreateWriterFontSizeUndo,
  CreateWriterFontUndo,
  SwUndoAttr,
  SwUndoParagraphFormat,
  SwUndoParagraphItem,
} from "../../core/undo/unattr";
import type { SwUndoCursorState, SwUndoRedoContext } from "../../core/undo/undobj";
import type { WriterDialogController } from "../dialog/writer-dialog-controller";
import type { WriterBookmarkDialogResult } from "../dialog/writer-dialog-controller";
import { createWriterHyperlinkAction, getWriterHyperlinkAtCursor } from "../../core/edit/editsh";
import { getWriterSelectedTextRanges } from "../../core/crsr/pam";
import { createWriterTextCommandRegistry } from "./textsh1-commands";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwPaM } from "../../core/crsr/pam";
import { isWriterParagraphListKind, type WriterParagraphListKind } from "../../core/doc/list";
import type { SwEditShell } from "../../core/edit/ednumber";
/** Cursor/model primitives consumed by the text shell without importing SwWrtShell. */
export interface SwTextShellTarget extends Pick<
  SwEditShell,
  | "SetCurNumRule"
  | "DelNumRules"
  | "SelectionHasNumber"
  | "SelectionHasBullet"
  | "SearchNumRule"
  | "IsNumRuleStart"
  | "SetNumRuleStart"
> {
  readonly ApplyAction: (action: SfxUndoAction<SwUndoRedoContext>) => boolean;
  readonly CaptureCursorState: () => SwUndoCursorState;
  readonly GetActiveParagraph: () => SwTextNode;
  readonly GetCursor: () => import("../../core/crsr/pam").SwPaM;
  readonly GetDefaultFontFamily: () => string;
  readonly GetDefaultFontSizePt: () => number;
  readonly GetDoc: () => import("../../core/doc/doc").SwDoc;
  readonly GetLineNumberInfo: () => SwLineNumberInfo;
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
  readonly CanNumUpDown: (down: boolean) => boolean;
  readonly Redo: () => boolean;
  readonly SetPaM: (point: SwPosition, mark?: SwPosition) => boolean;
  readonly SplitNode: () => boolean;
  readonly SetPaintLineNumbers: (paint: boolean) => boolean;
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
  readonly keepTogether?: boolean;
  readonly orphans?: number;
  readonly widows?: number;
  readonly breakBefore?: "auto" | "page";
  readonly breakAfter?: "auto" | "page";
  readonly firstLineIndentPt?: number;
  readonly autoTextIndent?: boolean;
  readonly pageStyleName?: string;
  readonly pageNumber?: number | "auto";
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

  /** Returns document bookmarks in position order. @returns Names. */
  public GetBookmarkNames(): readonly string[] {
    return this.target.GetDoc().GetIDocumentMarkAccess().GetBookmarkNames();
  }

  /** Returns the collapsed mark exactly at the caret. @returns Name, when present. */
  public GetBookmarkAtCursor(): string | undefined {
    return this.target
      .GetDoc()
      .GetIDocumentMarkAccess()
      .FindMarkAtPosition(this.target.GetCursor().GetPoint())
      ?.GetName();
  }

  /** Applies one bookmark dialog choice to canonical marks and cursor. @param result - Accepted operation. @returns Whether model or cursor changed. */
  public ApplyBookmarkOperation(result: WriterBookmarkDialogResult): boolean {
    const marks = this.target.GetDoc().GetIDocumentMarkAccess();
    if (result.action === "navigate") {
      const mark = marks.FindMark(result.name);
      if (mark === undefined) return false;
      return this.target.SetPaM(mark.GetPosition().clone());
    }
    if (result.action === "remove") return marks.DeleteMark(result.name);
    if (result.action === "rename") return marks.RenameMark(result.name, result.newName);
    const point = this.target.GetCursor().GetPoint();
    marks.MakeMark(point.GetNode() as SwTextNode, point.GetContentIndex(), result.name);
    return true;
  }

  /** Inserts a hard page boundary through Writer paragraph structure. @returns Whether inserted. */
  public InsertHardPageBreak(): boolean {
    const point = this.target.GetCursor().GetPoint();
    if (point.GetContentIndex() > 0 && !this.target.SplitNode()) return false;
    return this.SetParagraphItem(new SfxInt16Item(RES_BREAK, 4));
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
      (value.firstLineIndentPt !== undefined &&
        (!Number.isFinite(value.firstLineIndentPt) ||
          Math.abs(value.firstLineIndentPt * 20) > 32767)) ||
      (value.pageNumber !== undefined &&
        value.pageNumber !== "auto" &&
        (!Number.isInteger(value.pageNumber) ||
          value.pageNumber < 1 ||
          value.pageNumber > 65535)) ||
      (value.pageStyleName !== undefined &&
        value.pageStyleName !== "" &&
        this.target.GetDoc().FindPageDesc(value.pageStyleName) === undefined) ||
      ![value.orphans ?? 2, value.widows ?? 2].every(
        /** Checks ODF line-count bounds. @param count - Minimum lines. @returns Whether valid. */
        (count) => Number.isInteger(count) && count >= 0 && count <= 255,
      ) ||
      ![value.breakBefore ?? "auto", value.breakAfter ?? "auto"].every(
        /** Checks supported page break modes. @param mode - Break mode. @returns Whether valid. */
        (mode) => mode === "auto" || mode === "page",
      ) ||
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
        new SfxBoolItem(RES_PARATR_SPLIT, !(value.keepTogether ?? false)),
        new SfxInt16Item(RES_PARATR_ORPHANS, value.orphans ?? 2),
        new SfxInt16Item(RES_PARATR_WIDOWS, value.widows ?? 2),
        new SfxInt16Item(
          RES_BREAK,
          value.breakBefore === "page" && value.breakAfter === "page"
            ? 6
            : value.breakBefore === "page"
              ? 4
              : value.breakAfter === "page"
                ? 5
                : 0,
        ),
        ...(value.firstLineIndentPt === undefined && value.autoTextIndent === undefined
          ? []
          : [
              new SvxFirstLineIndentItem(
                Math.round((value.firstLineIndentPt ?? 0) * 20),
                RES_MARGIN_FIRSTLINE,
                value.autoTextIndent === true,
              ),
            ]),
        ...(value.pageStyleName === undefined && value.pageNumber === undefined
          ? []
          : [
              new SwFormatPageDesc(
                value.pageStyleName ?? "",
                value.pageNumber === undefined || value.pageNumber === "auto"
                  ? undefined
                  : value.pageNumber,
              ),
            ]),
        new SfxBoolItem(RES_LINENUMBER, value.countLineNumbers),
      ],
    );
  }

  /** Applies the toolbar's proportional line-spacing value. @param percent - Percent. @returns Whether changed. */
  public SetLineSpacingPercent(percent: number): boolean {
    if (!Number.isInteger(percent) || percent < 0) return false;
    return this.SetParagraphItem(new SvxLineSpacingItem(percent, RES_PARATR_LINESPACING));
  }

  /** Reads paragraph-dialog values from the active pooled items. @returns Primitive current paragraph format. */
  public GetParagraphFormat(): WriterParagraphFormatValue {
    const paragraph = this.target.GetActiveParagraph();
    const spacing = paragraph.GetAttr(RES_UL_SPACE) as SvxULSpaceItem;
    const lineSpacing = paragraph.GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem;
    const tabStops = paragraph.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem;
    const paragraphBreak = (paragraph.GetAttr(RES_BREAK) as SfxInt16Item).GetValue();
    const firstLine = paragraph.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem;
    const pageDesc = paragraph.GetAttr(RES_PAGEDESC) as SwFormatPageDesc;
    return {
      upperPt: spacing.GetUpper() / 20,
      lowerPt: spacing.GetLower() / 20,
      contextual: spacing.GetContext(),
      lineMode: lineSpacing.GetMode(),
      lineValue: lineSpacing.GetValue(),
      fontIndependent: lineSpacing.IsFontIndependent(),
      tabStopsPt: tabStops
        .GetStops()
        .filter(
          /** Keeps authored stops. @param stop - Candidate tab. @returns Whether explicit. */ (
            stop,
          ) => stop.GetAdjustment() !== SvxTabAdjust.Default,
        )
        .map(
          /** Converts to points. @param stop - Explicit tab. @returns Point position. */ (stop) =>
            stop.GetTabPos() / 20,
        ),
      keepWithNext: (paragraph.GetAttr(RES_KEEP) as SfxBoolItem).GetValue(),
      keepTogether: !(paragraph.GetAttr(RES_PARATR_SPLIT) as SfxBoolItem).GetValue(),
      orphans: (paragraph.GetAttr(RES_PARATR_ORPHANS) as SfxInt16Item).GetValue(),
      widows: (paragraph.GetAttr(RES_PARATR_WIDOWS) as SfxInt16Item).GetValue(),
      breakBefore: paragraphBreak === 4 || paragraphBreak === 6 ? "page" : "auto",
      breakAfter: paragraphBreak === 5 || paragraphBreak === 6 ? "page" : "auto",
      firstLineIndentPt: firstLine.ResolveTextFirstLineOffset() / 20,
      autoTextIndent: firstLine.IsAutoFirst(),
      pageStyleName: pageDesc.GetPageDescName(),
      pageNumber: pageDesc.GetNumOffset() ?? "auto",
      countLineNumbers: (paragraph.GetAttr(RES_LINENUMBER) as SfxBoolItem).GetValue(),
    };
  }

  /** Lists page descriptors for the paragraph Text Flow control. @returns Existing document page-style names. */
  public GetPageStyleNames(): readonly string[] {
    const document = this.target.GetDoc();
    return Array.from(
      { length: document.GetPageDescCnt() },
      /** Reads one canonical descriptor name. @param _unused - Array slot. @param index - Descriptor position. @returns Name. */
      (_unused, index) => document.GetPageDesc(index).GetValue().name,
    );
  }

  /** Reads document line-number visibility for the paragraph presenter. @returns Whether line numbers are painted. */
  public IsPaintLineNumbers(): boolean {
    return this.target.GetLineNumberInfo().IsPaintLineNumbers();
  }

  /** Applies line-number visibility through the Writer document owner. @param paint - Visible state. @returns Whether changed. */
  public SetPaintLineNumbers(paint: boolean): boolean {
    return this.target.SetPaintLineNumbers(paint);
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
                paragraph.GetpSwAttrSet()?.GetItemIfSet(item.Which(), false),
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

  /** Executes Writer's context-sensitive text indent command. @param increase - Direction. @param modulus - Snap to the document tab grid. @returns Whether changed. */
  public ChangeParagraphIndent(increase: boolean, modulus = true): boolean {
    const paragraph = this.target.GetActiveParagraph();
    if (paragraph.GetListKind() !== "none") return this.target.NumUpDown(increase);
    return this.target.MoveLeftMargin(increase, modulus);
  }

  /** Reports whether the text indent command has an available transition. @param increase - Direction. @returns Whether enabled. */
  public CanChangeParagraphIndent(increase: boolean): boolean {
    const paragraph = this.target.GetActiveParagraph();
    if (paragraph.GetListKind() !== "none") return this.target.CanNumUpDown(increase);
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
  /** Applies or removes numbering over every selected native paragraph. @param kind - Requested list kind. @returns Whether a command changed list state. */
  public SetParagraphListKind(kind: WriterParagraphListKind): boolean {
    if (!isWriterParagraphListKind(kind))
      throw new Error("Unsupported Writer paragraph list kind: " + kind);
    const doc = this.target.GetDoc(),
      range = this.target.GetCursor();
    if (kind === "none") return this.target.DelNumRules();
    if (this.GetListKind() === kind) return false;
    const listId = { value: "" },
      rule =
        doc.SearchNumRule(range.GetPoint(), false, kind === "numbered", false, 0, listId) ??
        doc.GetDocumentListsManager().CreateAutomaticNumRule(kind);
    return this.target.SetCurNumRule(rule, false, listId.value, true);
  }

  /** Continues the nearest native list through the inherited core rule command and rule-sensitive restart actions. @returns Whether selected list state changed. */
  public ContinueNumbering(): boolean {
    const doc = this.target.GetDoc(),
      range = this.target.GetCursor(),
      listId = { value: "" },
      rule = this.target.SearchNumRule(true, listId) ?? this.target.SearchNumRule(false, listId);
    if (rule === undefined) return false;
    let changed = false;
    for (const selected of range.GetRingContainer())
      for (
        let index = selected.Start().GetNodeIndex();
        index <= selected.End().GetNodeIndex();
        index++
      ) {
        const node = doc.GetNodes().at(index);
        if (node instanceof SwTextNode)
          changed ||=
            node.GetNumRule() !== rule ||
            node.GetListId() !== listId.value ||
            !node.IsCountedInList();
      }
    if (!changed) return false;
    const undo = doc.GetUndoManager();
    undo.EnterListAction("Continue Numbering");
    try {
      for (const selected of range.GetRingContainer())
        for (
          let index = selected.Start().GetNodeIndex();
          index <= selected.End().GetNodeIndex();
          index++
        ) {
          const node = doc.GetNodes().at(index);
          if (!(node instanceof SwTextNode)) continue;
          const position = new SwPosition(node),
            paragraph = new SwPaM(position);
          try {
            if (this.target.IsNumRuleStart(paragraph) && node.GetNumRule() !== rule)
              this.target.SetNumRuleStart(false, paragraph);
          } finally {
            paragraph.Dispose();
            position.Dispose();
          }
        }
      return this.target.SetCurNumRule(rule, false, listId.value);
    } finally {
      undo.LeaveListAction();
    }
  }

  /** Returns the native selection list family. @returns Current list kind. */
  public GetListKind(): WriterParagraphListKind {
    if (this.target.SelectionHasNumber()) return "numbered";
    if (this.target.SelectionHasBullet()) return "bullet";
    return "none";
  }

  /** Reports native continuation availability independently of the active paragraph's list kind. @returns Whether an earlier list was found. */
  public CanContinueNumbering(): boolean {
    const listId = { value: "" };
    return (
      (this.target.SearchNumRule(true, listId) ?? this.target.SearchNumRule(false, listId)) !==
      undefined
    );
  }
}
