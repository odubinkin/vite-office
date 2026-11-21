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
import type { SwViewOption } from "../../../inc/viewopt";

/** Editor and viewport bound to one native comment field. */
export interface SwAnnotationWindow {
  readonly editor: ImpEditEngine;
  readonly view: SearchEditView;
  MakeVisible(): void;
  ApplyAttributes?(items: SfxItemSet): boolean;
  SelectAll?(): void;
  SearchHighlight?(): void;
  HasFocus?(): boolean;
  GrabFocusToDocument?(): void;
  SetResolved?(value: boolean): void;
}

/** Owns active comment search state and resolves sidebar windows by actual field identity. */
export class SwPostItMgr {
  private readonly windows = new Map<SwFormatField, SwAnnotationWindow>();
  private active: SwFormatField | undefined;
  private pendingFocus: SwFormatField | undefined;

  /** Binds the current Writer view options and search engine. @param options - View-local options. @param createRegex - Platform compiler. @param activeChanged - Dispatch context notification. @returns Manager. */
  constructor(
    private readonly options: SwViewOption,
    private readonly createRegex?: RegexMatcherFactory,
    private readonly activeChanged?: () => void,
  ) {}

  /** Registers the sidebar window for a model field. @param field - Actual model comment. @param window - Mounted editor. @returns Release callback. */
  RegisterSidebarWin(field: SwFormatField, window: SwAnnotationWindow): () => void {
    this.windows.set(field, window);
    if (this.IsVisible(field)) this.SidebarWinShown(field);
    return /** Releases exactly this mounted view. @returns Nothing. */ () => {
      if (this.windows.get(field) !== window) return;
      this.windows.delete(field);
      if (this.active === field) this.ClearActiveField();
    };
  }

  /** Reads the visibility of a field's annotation window. @param field - Actual comment field. @returns Whether shown. */
  IsVisible(field: SwFormatField): boolean {
    return (
      this.options.IsPostIts() &&
      (this.options.IsResolvedPostIts() || !field.GetField().IsResolved())
    );
  }

  /** Shows or hides comment windows as a view option. @param value - Whether to show comments. @returns Nothing. */
  ShowNotes(value: boolean): void {
    if (!value) this.ReturnFocusToDocument();
    this.options.SetPostIts(value);
  }

  /** Shows or hides resolved annotation windows. @param value - Whether to show resolved comments. @returns Nothing. */
  ShowHideResolvedNotes(value: boolean): void {
    if (!value && this.GetActiveField()?.GetField().IsResolved()) this.ReturnFocusToDocument();
    this.options.SetResolvedPostIts(value);
  }

  /** Toggles the active annotation or the original field ID supplied by the caller. @param id - Optional document annotation ID. @returns Whether the comment changed. */
  ToggleResolved(id?: number): boolean {
    const field =
      id === undefined
        ? this.GetActiveField()
        : [...this.windows.keys()].find(
            /** Finds the original annotation ID. @param candidate - Registered field. @returns Whether it matches. */
            (candidate) => candidate.GetField().GetPostItId() === id,
          );
    if (!field?.GetTextField()?.GetTextNode() || this.options.IsReadonly()) return false;
    const window = this.windows.get(field);
    if (!window?.SetResolved) return false;
    const resolved = !field.GetField().IsResolved();
    if (resolved && !this.options.IsResolvedPostIts() && this.GetActiveField() === field)
      this.ReturnFocusToDocument();
    window.SetResolved(resolved);
    return true;
  }

  /** Completes a native focus request once the editor is mounted and visible. @param field - Projected annotation. @returns Nothing. */
  SidebarWinShown(field: SwFormatField): void {
    if (this.pendingFocus !== field) return;
    const window = this.windows.get(field);
    if (window === undefined) return;
    this.pendingFocus = undefined;
    this.SetActiveSidebarWin(field);
    window.MakeVisible();
  }

  /** Returns focused annotation input to the document when its window is hidden. @returns Nothing. */
  private ReturnFocusToDocument(): void {
    const window = this.GetActiveSidebarWin();
    if (!window?.HasFocus?.()) return;
    this.ClearActiveField();
    window.GrabFocusToDocument?.();
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
    const visible = this.IsVisible(field);
    this.pendingFocus = field;
    this.options.SetPostIts(true);
    if (field.GetField().IsResolved()) this.options.SetResolvedPostIts(true);
    if (visible) this.SidebarWinShown(field);
  }

  /** Returns focus to the original active annotation. @returns Whether a sidebar window took focus. */
  GrabFocusOnActiveSidebarWin(): boolean {
    const field = this.GetActiveField();
    if (field === undefined || !this.IsVisible(field)) return false;
    const window = this.windows.get(field);
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
