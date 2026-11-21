/** @fileoverview Native Writer annotation search through the active comment's edit view. */
import { EditSelection } from "../../../../editeng/inc/EditSelection";
import type { SearchEditView } from "../../../../editeng/source/editeng/impedit4.search";
import type { ImpEditEngine } from "../../../../editeng/source/editeng/impedit.lifecycle";
import type { SearchOptions2 } from "../../../../i18nutil/inc/searchopt";
import { MID_SEARCH_BACKWARD, MID_SEARCH_COMMAND } from "../../../../svl/inc/memberid";
import { SvxSearchCmd } from "../../../../svl/inc/srchitem";
import { SvxSearchItem } from "../../../../svl/source/items/srchitem";
import type { RegexMatcherFactory } from "../../../../unotools/inc/textsearch";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SwFormatField } from "../../../inc/fmtfld";

/** Editor and viewport bound to one native comment field. */
export interface SwAnnotationWindow {
  readonly editor: ImpEditEngine;
  readonly view: SearchEditView;
  MakeVisible(): void;
  ApplyAttributes?(items: SfxItemSet): boolean;
  SelectAll?(): void;
  SearchHighlight?(): void;
}

/** Owns active comment search state and resolves sidebar windows by actual field identity. */
export class SwPostItMgr {
  private readonly windows = new Map<SwFormatField, SwAnnotationWindow>();
  private active: SwFormatField | undefined;
  private pendingFocus: SwFormatField | undefined;

  /** Binds the regex factory supplied by the current Writer view. @param createRegex - Platform compiler. @param activeChanged - Dispatch context notification. @returns Manager. */
  constructor(
    private readonly createRegex?: RegexMatcherFactory,
    private readonly activeChanged?: () => void,
  ) {}

  /** Registers the sidebar window for a model field. @param field - Actual model comment. @param window - Mounted editor. @returns Release callback. */
  RegisterSidebarWin(field: SwFormatField, window: SwAnnotationWindow): () => void {
    this.windows.set(field, window);
    if (this.pendingFocus === field) {
      this.pendingFocus = undefined;
      this.Focus(field);
    }
    return /** Releases exactly this mounted view. @returns Nothing. */ () => {
      if (this.windows.get(field) !== window) return;
      this.windows.delete(field);
      if (this.active === field) this.ClearActiveField();
    };
  }

  /** Reads the active, anchored comment. @returns Active comment or undefined. */
  GetActiveField(): SwFormatField | undefined {
    return this.active?.GetTextField()?.GetTextNode() ? this.active : undefined;
  }

  /** Returns the active window for annotation shell command execution. @returns Mounted annotation window. */
  GetActiveSidebarWin(): SwAnnotationWindow | undefined {
    const active = this.GetActiveField();
    return active && this.windows.get(active);
  }

  /** Invalidates command state when the active edit view changes its selection. @param field - Editor field. @returns Nothing. */
  SelectionChanged(field: SwFormatField): void {
    if (this.GetActiveField() === field) this.activeChanged?.();
  }

  /** Activates a registered, anchored comment. @param field - Focused annotation field. @returns Whether the active window changed. */
  SetActiveSidebarWin(field: SwFormatField): boolean {
    if (this.active === field || !this.windows.has(field) || !field.GetTextField()?.GetTextNode())
      return false;
    this.active = field;
    this.activeChanged?.();
    return true;
  }

  /** Routes the original field focus request after its browser window is mounted. @param field - Newly inserted annotation. @returns Nothing. */
  Focus(field: SwFormatField): void {
    if (!field.GetTextField()?.GetTextNode()) return;
    const window = this.windows.get(field);
    if (!window) {
      this.pendingFocus = field;
      return;
    }
    this.SetActiveSidebarWin(field);
    window.MakeVisible();
  }

  /** Returns focus to the original active annotation. @returns Whether a sidebar window took focus. */
  GrabFocusOnActiveSidebarWin(): boolean {
    const field = this.GetActiveField();
    const window = field && this.windows.get(field);
    window?.MakeVisible();
    return window !== undefined;
  }

  /** Releases an active comment editor when document search resumes. @returns Nothing. */
  ClearActiveField(): void {
    const hadActive = this.active !== undefined;
    this.active = undefined;
    this.pendingFocus = undefined;
    if (hadActive) this.activeChanged?.();
  }

  /** Releases the view's document and sidebar references. @returns Nothing. */
  Dispose(): void {
    this.ClearActiveField();
    this.windows.clear();
  }

  /** Searches from the directional boundary of an anchored comment. @param field - Model field. @param options - Current search options. @param backward - Search direction. @returns Whether the comment matched. */
  SearchReplace(field: SwFormatField, options: SearchOptions2, backward: boolean): boolean {
    const window = this.windows.get(field);
    if (!window) return false;
    const view = window.view.getImpl();
    const previous = new EditSelection(view.GetEditSelection());
    const doc = window.editor.GetEditDoc();
    view.SetEditSelection(new EditSelection(backward ? doc.GetEndPaM() : doc.GetStartPaM()));
    if (!this.Run(window, options, backward, SvxSearchCmd.FIND)) {
      view.SetEditSelection(previous);
      window.view.ShowCursor(false, false);
      return false;
    }
    this.SetActiveSidebarWin(field);
    window.MakeVisible();
    return true;
  }

  /** Continues searching from the active editor selection. @param options - Current search options. @param backward - Search direction. @returns Whether the same comment matched again. */
  FinishSearchReplace(options: SearchOptions2, backward: boolean): boolean {
    return this.RunActive(options, backward, SvxSearchCmd.FIND);
  }

  /** Replaces the active editor selection with the supplied template. @param options - Current options with replacement text. @param backward - Search direction. @returns Whether the editor handled replacement. */
  Replace(options: SearchOptions2, backward: boolean): boolean {
    return this.RunActive(options, backward, SvxSearchCmd.REPLACE);
  }

  /** Executes an active editor command and releases the editor on failure. @param options - Current options. @param backward - Search direction. @param command - Editor command. @returns Whether handled. */
  private RunActive(options: SearchOptions2, backward: boolean, command: SvxSearchCmd): boolean {
    const field = this.GetActiveField();
    const window = field === undefined ? undefined : this.windows.get(field);
    if (window && this.Run(window, options, backward, command)) {
      if (command === SvxSearchCmd.FIND) window.SearchHighlight?.();
      return true;
    }
    this.ClearActiveField();
    return false;
  }

  /** Passes the native search item to the comment's edit view. @param window - Target comment window. @param options - Current search options. @param backward - Direction. @param command - Editor command. @returns Whether the command found or replaced a match. */
  private Run(
    window: SwAnnotationWindow,
    options: SearchOptions2,
    backward: boolean,
    command: SvxSearchCmd,
  ): boolean {
    const item = new SvxSearchItem(0);
    item.SetSearchOptions(options);
    item.PutValue(backward, MID_SEARCH_BACKWARD);
    item.PutValue(command, MID_SEARCH_COMMAND);
    return window.editor.StartSearchAndReplace(window.view, item, this.createRegex) > 0;
  }
}
