/** @fileoverview Writer command shell for the active annotation edit view. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SvxEscapementItem } from "../../../../editeng/inc/escapementitem";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import { MID_FONTHEIGHT } from "../../../../editeng/inc/memberids";
import { SvxEscapement } from "../../../../editeng/inc/svxenum";
import { CONVERT_TWIPS } from "../../../../svl/inc/poolitem";
import * as EE from "../../../../editeng/inc/eeitem";
import {
  SID_ATTR_CHAR_FONT,
  SID_ATTR_CHAR_FONTHEIGHT,
  SID_ATTR_CHAR_POSTURE,
  SID_ATTR_CHAR_WEIGHT,
} from "../../../../editeng/inc/editids";
import { SvxAdjust, SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import { SvxScriptSetItem } from "../../../../editeng/source/items/textitem.scriptset";
import type { ContentNode } from "../../../../editeng/source/editeng/ContentNode";
import type { EditSelection } from "../../../../editeng/inc/EditSelection";
import { createSfxShell, type SfxShell } from "../../../../sfx2/source/control/shell";
import { SfxBoolItem, SfxEnumItemInterface } from "../../../../svl/source/items/cenumitm";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import {
  createWriterInterface,
  getWriterCommandArguments,
  type WriterCharacterCommandArguments,
  type WriterSlotHandler,
} from "../../../sdi/swriter";
import { WRITER_COMMAND_IDS as CMD } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { writerColorFromPrimitive, writerColorValue } from "../../core/attr/swatrset";
import type { SwAnnotationWindow, SwPostItMgr } from "../docvw/PostItMgr";
import type { SwWrtShell } from "../wrtsh/wrtsh1";
import { GetDeleteAuthor } from "./textfld";

/** Represented annotation alignment slot values. */
const alignments = [
  [CMD.alignLeft, SvxAdjust.Left],
  [CMD.alignCenter, SvxAdjust.Center],
  [CMD.alignRight, SvxAdjust.Right],
  [CMD.alignJustify, SvxAdjust.Block],
] as const;

/** Annotation formatting, selection and history slots over the active EditEngine selection. */
export class SwAnnotationShell {
  private readonly shell: SfxShell;

  /** Binds the view-owned annotation manager and Writer history. @param manager - Annotation window owner. @param writer - Writer editing shell. @returns Annotation shell. */
  constructor(
    private readonly manager: SwPostItMgr,
    private readonly writer: SwWrtShell,
  ) {
    const handlers: WriterSlotHandler<SwAnnotationShell>[] = [
      this.CharacterCommand(CMD.bold, EE.EE_CHAR_WEIGHT, SID_ATTR_CHAR_WEIGHT),
      this.CharacterCommand(CMD.italic, EE.EE_CHAR_ITALIC, SID_ATTR_CHAR_POSTURE),
      this.CharacterCommand(CMD.underline, EE.EE_CHAR_UNDERLINE),
      this.CharacterCommand(CMD.underlineSingle, EE.EE_CHAR_UNDERLINE),
      this.CharacterCommand(CMD.strikeout, EE.EE_CHAR_STRIKEOUT),
      this.EscapementCommand(CMD.superscript, SvxEscapement.Superscript),
      this.EscapementCommand(CMD.subscript, SvxEscapement.Subscript),
      this.ColorCommand(CMD.color, EE.EE_CHAR_COLOR, "auto"),
      this.ColorCommand(CMD.charBackColor, EE.EE_CHAR_BKGCOLOR, "transparent"),
      {
        id: CMD.lineSpacing,
        /** Copies the complete native spacing request into the selected paragraphs. @param _context - Bound annotation shell. @param args - Request items. @returns Whether changed. */
        execute: (_context, args) => {
          const item = args.find(
            /** Finds the line-spacing item supplied by the shared popup. @param candidate - Request item. @returns Whether it contains spacing. */
            (candidate) => candidate instanceof SvxLineSpacingItem,
          );
          return item !== undefined && this.ApplyItem(EE.EE_PARA_SBL, item);
        },
        /** Enables paragraph spacing in an editable note. @returns Whether enabled. */
        isEnabled: () => this.CanEdit(),
        /** Reports different spacing values across the selected paragraphs. @returns Whether mixed. */
        isMixed: () => {
          const active = this.manager.GetActiveSidebarWin();
          return active !== undefined && getSelectionItem(active, EE.EE_PARA_SBL) === undefined;
        },
        /** Returns the native spacing item for the popup's rule and value controls. @returns Owned item or mixed state. */
        getStateValue: () => this.GetCharacter(EE.EE_PARA_SBL),
      },
      {
        id: CMD.fontName,
        /** Applies a font to the selected scripts in the annotation. @param _context - Bound annotation shell. @param args - Font request items. @returns Whether changed. */
        execute: (_context, args) => {
          const requested =
            getWriterCommandArguments<WriterCharacterCommandArguments>(args)?.fontFamily;
          if (requested instanceof SvxFontItem)
            return this.ApplyScriptItem(SID_ATTR_CHAR_FONT, requested);
          if (typeof requested !== "string" || !requested.trim()) return false;
          const font =
            this.GetCharacter(EE.EE_CHAR_FONTINFO, SID_ATTR_CHAR_FONT) ??
            this.manager
              .GetActiveSidebarWin()
              ?.editor.GetEditDoc()
              .GetItemPool()
              .GetUserOrPoolDefaultItem(EE.EE_CHAR_FONTINFO)
              .Clone();
          if (!(font instanceof SvxFontItem)) return false;
          try {
            font.SetFamilyName(requested);
            return this.ApplyScriptItem(SID_ATTR_CHAR_FONT, font);
          } finally {
            font.Dispose();
          }
        },
        /** Enables the font control in an editable note. @returns Whether enabled. */
        isEnabled: () => this.CanEdit(),
        /** Reads the selected annotation font name. @returns Uniform family name. */
        getStateValue: () => {
          const font = this.GetCharacter(EE.EE_CHAR_FONTINFO, SID_ATTR_CHAR_FONT);
          try {
            return font instanceof SvxFontItem ? font.GetFamilyName() : undefined;
          } finally {
            font?.Dispose();
          }
        },
      },
      {
        id: CMD.fontHeight,
        /** Applies a point height using the native font-height item. @param _context - Bound annotation shell. @param args - Font height request items. @returns Whether changed. */
        execute: (_context, args) => {
          const size = getWriterCommandArguments<WriterCharacterCommandArguments>(args)?.fontSizePt;
          if (size === undefined || !Number.isFinite(size)) return false;
          const height = SvxFontHeightItem.CreateDefault();
          const requested = new Any([size], "double");
          try {
            return (
              height.PutValue(requested, MID_FONTHEIGHT | CONVERT_TWIPS) &&
              this.ApplyScriptItem(SID_ATTR_CHAR_FONTHEIGHT, height)
            );
          } finally {
            requested.dispose();
            height.Dispose();
          }
        },
        /** Enables the height control in an editable note. @returns Whether enabled. */
        isEnabled: () => this.CanEdit(),
        /** Returns the selected annotation height in points. @returns Uniform height. */
        getStateValue: () => {
          const height = this.GetCharacter(EE.EE_CHAR_FONTHEIGHT, SID_ATTR_CHAR_FONTHEIGHT);
          try {
            return height instanceof SvxFontHeightItem ? height.GetHeight() / 20 : undefined;
          } finally {
            height?.Dispose();
          }
        },
      },
      {
        id: CMD.insertAnnotation,
        /** Focuses the existing annotation as in NoteExec. @returns Whether handled. */
        execute: () => this.manager.GrabFocusOnActiveSidebarWin(),
        /** Uses Writer editability. @returns Enabled. */
        isEnabled: () => this.CanEdit(),
      },
      {
        id: CMD.replyComment,
        /** Inserts a reply at the active comment. @returns Whether inserted. */
        execute: () => this.manager.Reply(),
        /** Enables reply in an editable annotation. @returns Whether enabled. */
        isEnabled: () => this.CanEdit(),
      },
      {
        id: CMD.promoteComment,
        /** Promotes the active reply to a top-level comment. @returns Whether promoted. */
        execute: () => this.manager.PromoteToRoot(),
        /** Enables promotion in an editable reply. @returns Whether enabled. */
        isEnabled: () => {
          const field = this.manager.GetActiveField();
          return field !== undefined && this.CanEdit() && !this.manager.IsRootNote(field);
        },
      },
      {
        id: CMD.resolveComment,
        /** Toggles resolution in the original active annotation window. @returns Whether changed. */
        execute: () => this.manager.ToggleResolved(),
        /** Enables the command in an editable annotation. @returns Whether enabled. */
        isEnabled: () => this.CanEdit(),
        /** Checks the model field's resolution. @returns Whether resolved. */
        isChecked: () => this.manager.GetActiveField()?.GetField().IsResolved() === true,
      },
      {
        id: CMD.resolveCommentThread,
        /** Toggles resolution through the active comment's complete sidebar thread. @returns Whether changed. */
        execute: () => this.manager.ToggleResolvedForThread(),
        /** Enables the command in an editable annotation. @returns Whether enabled. */
        isEnabled: () => this.CanEdit(),
        /** Checks the resolution state of the whole thread. @returns Whether the thread is resolved. */
        isChecked: () => this.manager.IsThreadResolved(),
      },
      {
        id: CMD.deleteComment,
        /** Deletes the active annotation at its model anchor. @returns Whether deleted. */
        execute: () => this.manager.Delete(),
        /** Enables deletion in the editable annotation. @returns Whether enabled. */
        isEnabled: () => this.CanEdit(),
      },
      {
        id: CMD.deleteCommentThread,
        /** Deletes the active annotation thread in sidebar order. @returns Whether deleted. */
        execute: () => this.manager.Delete(undefined, true),
        /** Enables deletion in the editable annotation. @returns Whether enabled. */
        isEnabled: () => this.CanEdit(),
      },
      {
        id: CMD.deleteAllNotes,
        /** Removes all comments through the shared query and history. @returns Whether changed. */
        execute: () => this.manager.DeleteNotes(),
        /** Enables deletion from an editable comment. @returns Whether enabled. */
        isEnabled: () => this.CanEdit(),
      },
      {
        id: CMD.deleteAuthor,
        /** Routes the original Author item, defaulting to the active note's author. @param _context - Bound annotation shell. @param args - Original request items. @returns Whether changed. */
        execute: (_context, args) => {
          const author =
            GetDeleteAuthor(args) ?? this.manager.GetActiveField()?.GetField().GetData().author;
          return author === undefined ? false : this.manager.DeleteNotes(author);
        },
        /** Enables deletion from an editable comment. @returns Whether enabled. */
        isEnabled: () => this.CanEdit(),
        /** Returns the original active-author menu state. @returns The native menu label, if active. */
        getStateValue: () => {
          const author = this.manager.GetActiveField()?.GetField().GetData().author;
          return author === undefined ? undefined : "Delete All Comments by " + author;
        },
      },
      {
        id: CMD.selectAll,
        /** Selects the annotation text in its own edit view. @returns Nothing. */
        execute: () => this.manager.GetActiveSidebarWin()?.SelectAll?.(),
      },
      {
        id: CMD.undo,
        /** Executes Writer history. @returns Whether handled. */
        execute: () => this.writer.Undo(),
        /** Queries Writer history in an editable note. @returns Enabled. */
        isEnabled: () => this.CanEdit() && this.writer.GetTextShell().CanUndo(),
      },
      {
        id: CMD.redo,
        /** Executes Writer history. @returns Whether handled. */
        execute: () => this.writer.Redo(),
        /** Queries Writer history in an editable note. @returns Enabled. */
        isEnabled: () => this.CanEdit() && this.writer.GetTextShell().CanRedo(),
      },
    ];
    for (const [id, adjust] of alignments) {
      handlers.push({
        id,
        /** Applies the requested annotation paragraph alignment. @returns Whether changed. */
        execute: () => this.ApplyAlignment(adjust),
        /** Uses Writer editability. @returns Enabled. */
        isEnabled: () => this.CanEdit(),
        /** Reads the uniform alignment across the selected paragraphs. @returns Checked state. */
        isChecked: () => {
          const active = this.manager.GetActiveSidebarWin();
          const item = active && getSelectionItem(active, EE.EE_PARA_JUST);
          return item instanceof SvxAdjustItem && item.GetAdjust() === adjust;
        },
      });
    }
    this.shell = createSfxShell(this, createWriterInterface(handlers));
  }

  /** Returns the shell registered while editing annotation text. @returns Dispatcher shell. */
  GetShell(): SfxShell {
    return this.shell;
  }

  /** Checks for a writable annotation editor. @returns Whether note edit commands are available. */
  private CanEdit(): boolean {
    return (
      !this.writer.GetViewOptions().IsReadonly() &&
      this.manager.GetActiveSidebarWin()?.ApplyAttributes !== undefined
    );
  }

  /** Connects the annotation's original position toggle to EditEngine. @param id - Generated Writer command URL. @param mode - Requested superscript or subscript. @returns Slot handler. */
  private EscapementCommand(id: string, mode: SvxEscapement): WriterSlotHandler<SwAnnotationShell> {
    const current =
      /** Reads the uniform current escapement while the note owns dispatch. @returns Current escapement item or mixed state. */ () => {
        const active = this.manager.GetActiveSidebarWin();
        const item = active && getSelectionItem(active, EE.EE_CHAR_ESCAPEMENT);
        return item instanceof SvxEscapementItem ? item : undefined;
      };
    return {
      id,
      /** Toggles this mode, using the native automatic offset and proportional height. @returns Whether changed. */
      execute: () => {
        const next = current()?.GetEscapement() === mode ? SvxEscapement.Off : mode;
        const item = new SvxEscapementItem(next, EE.EE_CHAR_ESCAPEMENT);
        try {
          return this.ApplyItem(EE.EE_CHAR_ESCAPEMENT, item);
        } finally {
          item.Dispose();
        }
      },
      /** Enables the position command in an editable note. @returns Whether enabled. */
      isEnabled: () => this.CanEdit(),
      /** Checks the native sign-based mode as in the annotation shell. @returns Whether selected. */
      isChecked: () => current()?.GetEscapement() === mode,
      /** Reports an invalid aggregate item over unlike runs. @returns Whether mixed. */
      isMixed: () => this.manager.GetActiveSidebarWin() !== undefined && current() === undefined,
    };
  }

  /** Binds an annotation color slot to the foreground or background item. @param id - Writer command URL. @param which - EditEngine item identity. @param automatic - Palette reset value. @returns Slot handler. */
  private ColorCommand(
    id: string,
    which: number,
    automatic: "auto" | "transparent",
  ): WriterSlotHandler<SwAnnotationShell> {
    return {
      id,
      /** Applies a native color item or the value chosen in the browser palette. @param _context - Bound annotation shell. @param args - Request items. @returns Whether changed. */
      execute: (_context, args) => {
        const native = args.find(
          /** Finds the requested color item. @param item - Request item. @returns Whether it is a color. */
          (item) => item instanceof SvxColorItem,
        );
        if (native) return this.ApplyItem(which, native);
        const color = getWriterCommandArguments<Readonly<{ color?: string }>>(args)?.color;
        if (color === undefined) return false;
        const item = new SvxColorItem(writerColorFromPrimitive(color, automatic), which);
        try {
          return this.ApplyItem(which, item);
        } finally {
          item.Dispose();
        }
      },
      /** Enables the palette for an editable note. @returns Whether enabled. */
      isEnabled: () => this.CanEdit(),
      /** Reports different colors across the selection. @returns Whether mixed. */
      isMixed: () => {
        const active = this.manager.GetActiveSidebarWin();
        return active !== undefined && getSelectionItem(active, which) === undefined;
      },
      /** Projects the uniform annotation color for the palette. @returns Palette color or mixed. */
      getStateValue: () => {
        const active = this.manager.GetActiveSidebarWin();
        const item = active && getSelectionItem(active, which);
        return item instanceof SvxColorItem
          ? writerColorValue(item.GetValue(), automatic)
          : undefined;
      },
    };
  }

  /** Creates the toggle and state bindings for one original character slot. @param id - Generated Writer command URL. @param which - EditEngine item identity. @param scriptSlot - Optional Latin script slot. @returns Slot handler. */
  private CharacterCommand(
    id: string,
    which: number,
    scriptSlot?: number,
  ): WriterSlotHandler<SwAnnotationShell> {
    return {
      id,
      /** Applies the annotation's direct character formatting. @param _context - Bound annotation shell. @param args - Native request items. @returns Whether changed. */
      execute: (_context, args) => this.ApplyCharacter(which, scriptSlot, args),
      /** Uses Writer editability. @returns Enabled. */
      isEnabled: () => this.CanEdit(),
      /** Checks the uniform native enum value. @returns Checked state. */
      isChecked: () => {
        const item = this.GetCharacter(which, scriptSlot);
        try {
          return item instanceof SfxEnumItemInterface && item.GetBoolValue();
        } finally {
          item?.Dispose();
        }
      },
      /** Reports a mixed selection when the requested native values differ. @returns Mixed state. */
      isMixed: () => {
        if (this.manager.GetActiveSidebarWin() === undefined) return false;
        const item = this.GetCharacter(which, scriptSlot);
        item?.Dispose();
        return item === undefined;
      },
    };
  }

  /** Reads the current note formatting, including the scripts selected by EditEngine. @param which - Native EditEngine identity. @param scriptSlot - Optional Latin script slot. @returns Owned uniform item. */
  private GetCharacter(which: number, scriptSlot?: number): SfxPoolItem | undefined {
    const active = this.manager.GetActiveSidebarWin();
    if (!active) return undefined;
    if (scriptSlot === undefined) return getSelectionItem(active, which)?.Clone() ?? undefined;
    const state = new SvxScriptSetItem(scriptSlot, active.editor.GetEditDoc().GetItemPool());
    try {
      const items = state.GetItemSet();
      for (const id of state.GetWhichIds()) {
        const item = getSelectionItem(active, id);
        if (item) items.Put(item);
        else items.InvalidateItem(id);
      }
      return state.GetItemOfScript(getScript(active))?.Clone() ?? undefined;
    } finally {
      state.Dispose();
    }
  }

  /** Applies a request item or derives a toggle from the current annotation selection. @param which - Native EditEngine identity. @param scriptSlot - Optional Latin script slot. @param args - Native request items. @returns Whether changed. */
  private ApplyCharacter(
    which: number,
    scriptSlot: number | undefined,
    args: readonly SfxPoolItem[],
  ): boolean {
    const active = this.manager.GetActiveSidebarWin();
    if (!active?.ApplyAttributes) return false;
    const pool = active.editor.GetEditDoc().GetItemPool();
    const existing = this.GetCharacter(which, scriptSlot);
    const requested = args.find(
      /** Finds an original bool or enum argument. @param item - Request item. @returns Whether usable. */
      (item) => item instanceof SfxBoolItem || item instanceof SfxEnumItemInterface,
    );
    const item = (
      requested instanceof SfxEnumItemInterface
        ? requested
        : (existing ?? pool.GetUserOrPoolDefaultItem(which))
    ).Clone();
    try {
      if (!(item instanceof SfxEnumItemInterface) || !item.HasBoolValue()) return false;
      item.SetWhich(which);
      if (!(requested instanceof SfxEnumItemInterface)) {
        item.SetBoolValue(
          requested instanceof SfxBoolItem
            ? requested.GetValue()
            : existing === undefined || !item.GetBoolValue(),
        );
      }
      if (scriptSlot !== undefined) return this.ApplyScriptItem(scriptSlot, item);
      return this.ApplyItem(which, item);
    } finally {
      existing?.Dispose();
      item?.Dispose();
    }
  }

  /** Applies an item under the annotation's EditEngine identity. @param which - Target native identity. @param item - Borrowed item. @returns Whether changed. */
  private ApplyItem(which: number, item: SfxPoolItem): boolean {
    const active = this.manager.GetActiveSidebarWin();
    if (!active?.ApplyAttributes) return false;
    const set = new SfxItemSet(active.editor.GetEmptyItemSet());
    try {
      set.PutAsTargetWhich(item, which);
      return active.ApplyAttributes(set);
    } finally {
      set.Dispose();
    }
  }

  /** Applies the prepared item to the annotation's selected scripts. @param slot - Original script slot. @param item - Borrowed native attribute. @returns Whether changed. */
  private ApplyScriptItem(slot: number, item: SfxPoolItem): boolean {
    const active = this.manager.GetActiveSidebarWin();
    if (!active?.ApplyAttributes) return false;
    const scripts = new SvxScriptSetItem(slot, active.editor.GetEditDoc().GetItemPool());
    try {
      scripts.PutItemForScriptType(getScript(active), item);
      return active.ApplyAttributes(scripts.GetItemSet());
    } finally {
      scripts.Dispose();
    }
  }

  /** Applies a paragraph item through the active note edit view. @param adjust - Requested native alignment. @returns Whether changed. */
  private ApplyAlignment(adjust: SvxAdjust): boolean {
    const active = this.manager.GetActiveSidebarWin();
    if (!active?.ApplyAttributes) return false;
    const set = new SfxItemSet(active.editor.GetEmptyItemSet());
    try {
      set.Put(new SvxAdjustItem(adjust, EE.EE_PARA_JUST), true);
      return active.ApplyAttributes(set);
    } finally {
      set.Dispose();
    }
  }
}

/** Gets the selection from the bound native edit view. @param window - Active annotation window. @returns Selection. */
function getSelection(window: SwAnnotationWindow): EditSelection {
  return window.view.getImpl().GetEditSelection();
}

/** Resolves the native script mask with Latin fallback for neutral text. @param window - Annotation window. @returns Script mask. */
function getScript(window: SwAnnotationWindow): SvtScriptType {
  const mask =
    window.editor.GetItemScriptType(getSelection(window)) &
    (SvtScriptType.LATIN | SvtScriptType.ASIAN | SvtScriptType.COMPLEX);
  return mask || SvtScriptType.LATIN;
}

/** Reads the uniform attribute across the selected EditEngine text or paragraphs. @param window - Annotation editor window. @param which - Native attribute identity. @returns Borrowed effective item when consistent. */
function getSelectionItem(window: SwAnnotationWindow, which: number): SfxPoolItem | undefined {
  const selection = getSelection(window);
  const doc = window.editor.GetEditDoc();
  const first = doc.GetPos(selection.Min().GetNode());
  const last = doc.GetPos(selection.Max().GetNode());
  let result: SfxPoolItem | undefined;
  for (let index = first; index <= last; index++) {
    const node = doc.GetObject(index);
    if (!node) continue;
    const start = index === first ? selection.Min().GetIndex() : 0;
    const end = index === last ? selection.Max().GetIndex() : node.Len();
    for (const item of rangeItems(node, which, start, end)) {
      if (result && !SfxPoolItem.areSame(result, item)) return undefined;
      result = item;
    }
  }
  return result;
}

/** Visits effective item values at each represented attribute boundary. @param node - EditEngine paragraph. @param which - Native item identity. @param start - Start offset. @param end - Exclusive end offset. @returns Effective items in the range. */
function* rangeItems(
  node: ContentNode,
  which: number,
  start: number,
  end: number,
): Iterable<SfxPoolItem> {
  const fallback = node.GetContentAttribs().GetItems().Get(which);
  const attributes = node.GetCharAttribs();
  if (which <= EE.EE_PARA_END || start === end) {
    yield attributes.FindAttrib(which, start)?.GetItem() ?? fallback;
    return;
  }
  const boundaries = new Set([start]);
  for (const attribute of attributes.GetAttribs()) {
    if (attribute.Which() !== which) continue;
    for (const offset of [attribute.GetStart(), attribute.GetEnd()])
      if (offset > start && offset < end) boundaries.add(offset);
  }
  for (const offset of boundaries)
    yield attributes.FindAttribRightOpen(which, offset)?.GetItem() ?? fallback;
}
