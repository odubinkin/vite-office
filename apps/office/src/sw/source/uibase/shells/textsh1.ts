/** @fileoverview Owns the supported SwTextShell execute/state handlers from textsh1.cxx. */
import { SwBaseShell } from "./basesh";
import { canChangeWriterFontSize, changeWriterFontSize } from "./txtattr-fontsize";
import {
  createCharacterFormatItems,
  createFontHeightItems,
  createCharacterColorItems,
} from "../../core/txtnode/ndhints-font";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { MID_FONTHEIGHT } from "../../../../editeng/inc/memberids";
import { CONVERT_TWIPS } from "../../../../svl/inc/poolitem";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT } from "../../../inc/hintids";
import { SID_ATTR_PARA_LINESPACE } from "../../../../editeng/inc/editids";
import { SvxLineSpaceRule } from "../../../../editeng/inc/svxenum";
import { projectWriterLineSpacing } from "../../core/text/itrform2";

import type { SfxShell } from "../../../../sfx2/source/control/shell";
import { createSfxShell } from "../../../../sfx2/source/control/shell";
import { SfxListUndoAction, type SfxUndoAction } from "../../../../svl/source/undo/undo";
import { SfxItemState, type SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { type SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import { SvxTabStopItem, SvxTabStop, SvxTabAdjust } from "../../../../editeng/inc/tstpitem";
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import {
  SvxIndentValue,
  SvxFirstLineIndentItem,
  SvxTextLeftMarginItem,
  SvxRightMarginItem,
  SvxLRSpaceItem,
} from "../../../../editeng/inc/lrspitem";
import { createSwParagraphLRSpaceItem } from "./txtattr-paragraph";
import { SvxULSpaceItem } from "../../../../editeng/source/items/frmitems";
import {
  RES_KEEP,
  RES_TXTATR_INETFMT,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_TEXTLEFT,
  RES_MARGIN_RIGHT,
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
  projectWriterCharacterAttributes,
  type WriterCharacterAttributes,
} from "../../core/txtnode/txatbase";
import { GetTextAttrMode } from "../../../inc/swtypes";
import type { SwFormatINetFormat, WriterHyperlink } from "../../core/txtnode/fmtatr2";
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
import { getWriterINetFormatStateAtCursor } from "../../core/edit/edattr";
import { getParagraphAttributeNodes } from "../../core/edit/edattr-paragraph";
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
  readonly ApplyAction: (
    action: SfxUndoAction<SwUndoRedoContext>,
    tryMerge?: boolean,
    execute?: (context: SwUndoRedoContext) => void,
  ) => boolean;
  readonly CaptureCursorState: () => SwUndoCursorState;
  readonly GetActiveParagraph: () => SwTextNode;
  readonly GetCursor: () => import("../../core/crsr/pam").SwPaM;
  readonly IsTableMode: () => boolean;
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
  readonly GetCurAttr: (state: SfxItemSet) => boolean;
  readonly SetAttrSet: (
    items: SfxItemSet,
    mode?: import("../../../inc/swtypes").SetAttrMode,
    pam?: SwPaM,
  ) => boolean;
  readonly GetPaMAttr: (pam: SwPaM, items: SfxItemSet) => boolean;
  readonly GetScriptType: () => import("../../../../svl/inc/languageoptions").SvtScriptType;
  readonly GetItemWithPaM: (
    which: number,
  ) => import("../../core/edit/edattr-items").SwItemWithPaM[];
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
export class SwTextShell extends SwBaseShell {
  /** Applies only the requested native pending item delta. @param items - Complete changed values. @returns Nothing. */
  private ApplyPendingCharacterItems(items: readonly SfxPoolItem[]): void {
    const pending = this.target.GetPendingCharacterItems().Clone();
    for (const item of items) pending.Put(item);
    this.target.SetPendingCharacterItems(pending);
  }
  private readonly shell: SfxShell;
  /** Creates the text-shell slot owner. @param target - Active Writer editing shell. @param dialogs - Writer dialog controller. @returns Nothing. */
  public constructor(target: SwTextShellTarget, dialogs: WriterDialogController) {
    super(target);
    this.shell = createSfxShell(this, createWriterTextCommandRegistry(this, dialogs));
    this.shell.GetInterface().RegisterPopupMenu("text");
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
    this.ApplyPendingCharacterItems(
      createCharacterFormatItems(format, this.GetCharacterFormatState(format) !== "on"),
    );
    if (selected === undefined || selected.length === 0) {
      this.target.NotifySelectionChanged();
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

  /** Tests represented native HasSelection without treating an equal mark as selected; fly selection remains unrepresented. @returns Whether table mode or actual point/mark selection exists. */
  private HasHyperlinkSelection(): boolean {
    if (this.target.IsTableMode()) return true;
    const cursor = this.target.GetCursor();
    return cursor.HasMark() && cursor.GetPoint().compare(cursor.GetMark()) !== 0;
  }

  /** Implements represented SID_EDIT_HYPERLINK state: current SET or an unselected original nonempty Default-mode hint. @returns Whether edit is enabled. */
  public CanEditHyperlink(): boolean {
    if (
      getWriterINetFormatStateAtCursor(this.target.GetDoc(), this.target.GetCursor()).GetItemState(
        RES_TXTATR_INETFMT,
        false,
      ) >= SfxItemState.SET
    )
      return true;
    if (this.HasHyperlinkSelection()) return false;
    const point = this.target.GetCursor().GetPoint(),
      node = point.GetNode(),
      hint =
        node instanceof SwTextNode
          ? node.GetTextAttrAt(point.GetContentIndex(), RES_TXTATR_INETFMT, GetTextAttrMode.Default)
          : undefined;
    return hint !== undefined && (hint.GetAttr() as SwFormatINetFormat).GetValue().length > 0;
  }

  /** Implements SID_EDIT_HYPERLINK beginning fallback before dialog: select the original native hint with the persistent point at its end and mark at its start. Full core overlap/readonly/fly movement is unrepresented. @returns Whether execution may proceed. */
  public PrepareEditHyperlink(): boolean {
    if (this.HasHyperlinkSelection() || this.GetHyperlinkAtCursor() !== undefined) return true;
    const cursor = this.target.GetCursor(),
      point = cursor.GetPoint(),
      node = point.GetNode(),
      hint =
        node instanceof SwTextNode
          ? node.GetTextAttrAt(point.GetContentIndex(), RES_TXTATR_INETFMT, GetTextAttrMode.Default)
          : undefined;
    if (hint === undefined) return false;
    cursor.DeleteMark();
    point.Assign(node, hint.GetStart());
    cursor.SetMark();
    point.Assign(node, hint.GetEnd());
    this.target.SetPendingCharacterItems((node as SwTextNode).GetCharacterItemsAt(hint.GetEnd()));
    this.target.GetDocShell().GetUndoManager().BreakUndoGrouping();
    this.target.NotifySelectionChanged();
    return true;
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
      return this.target.SetPaM(mark.GetMarkPos().clone());
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

  /** Tests native selected Remove admission including INVALID mixed item state; collapsed Default/word fallback remains pending. @returns Whether the represented command is enabled. */
  public CanRemoveHyperlink(): boolean {
    const state = getWriterINetFormatStateAtCursor(
      this.target.GetDoc(),
      this.target.GetCursor(),
    ).GetItemState(RES_TXTATR_INETFMT, false);
    return state >= SfxItemState.SET || state === SfxItemState.INVALID;
  }

  /** Resets internet attributes in original marked native ranges as one history operation. Full native SwUndoResetAttr/SwHistory and unmarked-ring word selection remain unverified. @returns Whether attributes changed. */
  public RemoveHyperlink(): boolean {
    if (!this.HasHyperlinkSelection()) return this.SetHyperlink(undefined);
    const before = this.target.CaptureCursorState(),
      actions: SwUndoAttr[] = [];
    for (const range of getWriterSelectedTextRanges(this.target.GetCursor()) ?? []) {
      const original = range.node.CaptureTextFragment(range.start, range.end),
        replacement = range.node.CreateHyperlinkTextFragment(range.start, range.end, undefined);
      if (!original.hints.equals(replacement.hints))
        actions.push(
          new SwUndoAttr(range.node, range.start, original, replacement, before, before),
        );
    }
    if (actions.length === 0) return false;
    let action: SfxUndoAction<SwUndoRedoContext> = actions[0] as SwUndoAttr;
    if (actions.length > 1) {
      const group = new SfxListUndoAction<SwUndoRedoContext>("Remove Hyperlink");
      for (const child of actions) group.AddAction(child);
      action = group;
    }
    return this.target.ApplyAction(
      action,
      false,
      /** Runs initial attribute reset without history cursor restoration. @returns Nothing. */
      () => {
        for (const child of actions) child.ApplyExact();
      },
    );
  }

  /** Applies a font family through one text-shell history action. @param fontFamily - Requested family. @returns Whether changed. */
  public SetFontFamily(fontFamily: string | SvxFontItem): boolean {
    const family = typeof fontFamily === "string" ? fontFamily.trim() : fontFamily;
    if (typeof family === "string" && family.length === 0)
      throw new Error("Writer font family must not be blank.");
    const before = this.target.CaptureCursorState();
    const selected = getWriterSelectedTextRanges(this.target.GetCursor());
    const pending = this.target.GetPendingCharacterItems().Clone();
    const font =
      family instanceof SvxFontItem
        ? family
        : new SvxFontItem(pending.Get(RES_CHRATR_FONT) as SvxFontItem);
    if (typeof family === "string") font.SetFamilyName(family);
    for (const which of [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT]) {
      const item = font.Clone();
      item.SetWhich(which);
      pending.Put(item);
    }
    this.target.SetPendingCharacterItems(pending);
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
    const height = SvxFontHeightItem.CreateDefault();
    const requested = new Any([fontSizePt], "double");
    try {
      if (
        !Number.isFinite(fontSizePt) ||
        !height.PutValue(requested, MID_FONTHEIGHT | CONVERT_TWIPS)
      )
        throw new Error("Writer font size is outside the native font-height range.");
    } finally {
      requested.dispose();
    }
    const fontSizeTwips = height.GetHeight();
    const before = this.target.CaptureCursorState();
    const selected = getWriterSelectedTextRanges(this.target.GetCursor());
    this.ApplyPendingCharacterItems(createFontHeightItems(fontSizeTwips));
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

  /** Original font-step enabled state. @param grow - Original grow slot. @returns Enabled. */
  public CanChangeFontSize(grow: boolean): boolean {
    return canChangeWriterFontSize(this.target, grow);
  }
  /** Original font-step execution. @param grow - Original grow slot. @returns Whether selected ranges changed. */
  public ChangeFontSize(grow: boolean): boolean {
    return changeWriterFontSize(this.target, grow);
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
    this.ApplyPendingCharacterItems(createCharacterColorItems(property, value));
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

  /** Applies Execute's native combined indent item as three Writer attributes. @param item - Accepted slot item. @returns Whether changed. */
  public ApplyParagraphLRSpace(item: SvxLRSpaceItem): boolean {
    const first = new SvxFirstLineIndentItem(RES_MARGIN_FIRSTLINE),
      left = new SvxTextLeftMarginItem(RES_MARGIN_TEXTLEFT),
      right = new SvxRightMarginItem(RES_MARGIN_RIGHT);
    first.SetTextFirstLineOffset(item.GetTextFirstLineOffset(), item.GetPropTextFirstLineOffset());
    first.SetAutoFirst(item.IsAutoFirst());
    left.SetTextLeft(item.GetTextLeft(), item.GetPropLeft());
    right.SetRight(item.GetRight(), item.GetPropRight());
    return this.SetParagraphItems([first, left, right]);
  }

  /** Reads GetAttrState's combined native item only for a uniform selection. @returns Independent slot item or invalid mixed state. */
  public GetParagraphLRSpace(): SvxLRSpaceItem | undefined {
    return this.GetUniformParagraphItem(createSwParagraphLRSpaceItem);
  }

  /** Aggregates actual paragraph items using native value equality. @param createItem - Concrete state projection. @returns Uniform item or undefined for mixed state. */
  public GetUniformParagraphItem<Item extends SfxPoolItem>(
    createItem: (paragraph: SwTextNode) => Item,
  ): Item | undefined {
    const items = getParagraphAttributeNodes(this.target.GetDoc(), this.target.GetCursor()).map(
        createItem,
      ),
      first = items[0] as Item;
    return items.every(
      /** Retains only native uniform value state. @param item - Concrete selected value. @returns Whether equal. */
      (item) => first.equals(item),
    )
      ? first
      : undefined;
  }

  /** Applies paragraph-dialog items through one history entry. @param value - Accepted formatting fields. @param tabStopItems - Optional original tab-page output set, empty when unchanged. @returns Whether formatting changed. */
  public ApplyParagraphFormat(
    value: WriterParagraphFormatValue,
    tabStopItems?: SfxItemSet,
  ): boolean {
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
          value.pageNumber < 0 ||
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
      tabStopItems === undefined &&
      positions.some(
        /** Rejects positions outside the supported range. @param position - Twips. @returns Whether invalid. */ (
          position,
        ) => !Number.isInteger(position) || position <= 0 || position > 32767,
      )
    )
      return false;
    const first = new SvxFirstLineIndentItem(
      SvxIndentValue.twips(Math.round((value.firstLineIndentPt ?? 0) * 20)),
      RES_MARGIN_FIRSTLINE,
    );
    first.SetAutoFirst(value.autoTextIndent === true);
    const lineSpacing = new SvxLineSpacingItem(200, RES_PARATR_LINESPACING);
    if (value.lineMode === "proportional") lineSpacing.SetPropLineSpace(value.lineValue);
    else if (value.lineMode === "leading") lineSpacing.SetInterLineSpace(value.lineValue);
    else {
      lineSpacing.SetLineHeight(value.lineValue);
      if (value.lineMode === "fixed") lineSpacing.SetLineSpaceRule(SvxLineSpaceRule.Fix);
    }
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
        lineSpacing,
        ...(tabStopItems?.entries() ?? [this.CreateTabStops(positions, paragraph)]),
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
          : [first]),
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

  /** Original line-spacing item request retains all active and inactive fields while mapping slot to Writer Which. @param item - Actual request item. @returns Whether selected paragraphs changed. */
  public ApplyLineSpacing(item: SvxLineSpacingItem): boolean {
    const copy = item.Clone();
    copy.SetWhich(RES_PARATR_LINESPACING);
    return this.SetParagraphItem(copy);
  }

  /** Reads original uniform line-spacing item state over the selected paragraphs. @returns Slot item or undefined for mixed selection. */
  public GetLineSpacing(): SvxLineSpacingItem | undefined {
    return this.GetUniformParagraphItem(
      /** Copies actual pooled state for frame bindings. @param paragraph - Selected text node. @returns Slot item. */ (
        paragraph,
      ) => {
        const item = (paragraph.GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem).Clone();
        item.SetWhich(SID_ATTR_PARA_LINESPACE);
        return item;
      },
    );
  }

  /** Applies the toolbar's proportional line-spacing value. @param percent - Percent. @returns Whether changed. */
  public SetLineSpacingPercent(percent: number): boolean {
    if (!Number.isInteger(percent) || percent < 0) return false;
    const item = new SvxLineSpacingItem(200, RES_PARATR_LINESPACING);
    item.SetPropLineSpace(percent);
    return this.SetParagraphItem(item);
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
      lineMode: projectWriterLineSpacing(lineSpacing).mode,
      lineValue: projectWriterLineSpacing(lineSpacing).value,
      tabStopsPt: Array.from(
        { length: tabStops.Count() },
        /** Reads one original const tab. @param unused - Empty array slot. @param index - Native index. @returns Borrowed tab. */ (
          unused,
          index,
        ) => {
          void unused;
          return tabStops.At(index);
        },
      )
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
    const item = new SvxTabStopItem(0, 0, SvxTabAdjust.Default, RES_PARATR_TABSTOP);
    item.SetDefaultDistance(current.GetDefaultDistance());
    for (const position of positions)
      item.Insert(
        current.GetPos(position) !== 65535
          ? current.At(current.GetPos(position))
          : new SvxTabStop(position),
      );
    return item;
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
    const paragraphs = getParagraphAttributeNodes(this.target.GetDoc(), this.target.GetCursor());
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
