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
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import type { SwWrtShell } from "../wrtsh/wrtsh1";
import { InsertPostIt } from "../wrtsh/wrtsh-editing";
import type {
  WriterCommentDeleteConfiguration,
  WriterDialogController,
} from "../dialog/writer-dialog-controller";
import { SwPostItField, SwPostItFieldType } from "../../core/fields/docufld";
import type { EditTextObject } from "../../../../editeng/source/editeng/editobj";
import { DateTime } from "../../../../tools/source/datetime/datetime";

/** Editor and viewport bound to one native comment field. */
export interface SwAnnotationWindow {
  readonly editor: ImpEditEngine;
  readonly view: SearchEditView;
  MakeVisible(): void;
  ApplyAttributes?(items: SfxItemSet, wholeNote?: boolean): boolean;
  SelectAll?(): void;
  SearchHighlight?(): void;
  HasFocus?(): boolean;
  GrabFocusToDocument?(): void;
  SetResolved?(value: boolean): void;
  CreateReplyText?(): Readonly<{ text: string; object: EditTextObject }> | undefined;
  PlaceCursorAtEnd?(): void;
}

/** Owns active comment search state and resolves sidebar windows by actual field identity. */
export class SwPostItMgr {
  private readonly windows = new Map<SwFormatField, SwAnnotationWindow>();
  private readonly followWindows = new WeakSet<SwAnnotationWindow>();
  private active: SwFormatField | undefined;
  private pendingFocus: Readonly<{ field: SwFormatField; atEnd: boolean }> | undefined;

  /** Binds the current Writer view options and search engine. @param options - View-local options. @param writer - Model editing shell. @param createRegex - Platform compiler. @param activeChanged - Dispatch context notification. @param dialogs - View-owned dialog controller. @param deleteConfiguration - Shared deletion query preference. @returns Manager. */
  constructor(
    private readonly options: SwViewOption,
    private readonly writer: SwWrtShell,
    private readonly createRegex?: RegexMatcherFactory,
    private readonly activeChanged?: () => void,
    private readonly dialogs?: WriterDialogController,
    private readonly deleteConfiguration?: WriterCommentDeleteConfiguration,
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

  /** Inserts a native reply immediately after the parent field. @param id - Optional annotation ID supplied by the body command. @returns Whether inserted. */
  Reply(id?: number): boolean {
    const format = this.GetFieldForCommand(id);
    const hint = format?.GetTextField();
    const node = hint?.GetTextNode();
    if (!format || !hint || !node || this.options.IsReadonly()) return false;
    const parent = format.GetField();
    const parentPostItId = parent.GetPostItId();
    const parentId =
      parent.GetData().paraId || (crypto.getRandomValues(new Uint32Array(1))[0] ?? 0);
    parent.SetParaId(parentId);
    if (!parent.GetName()) parent.SetName(`__Annotation__${parentPostItId}`);
    const quote = this.windows.get(format)?.CreateReplyText?.();
    const reply = new SwPostItField(parent.GetTyp(), {
      author: "Unknown Author",
      initials: "",
      name: "",
      text: quote?.text ?? "",
      parentId,
      parentPostItId,
      parentName: parent.GetName(),
      dateTime: new DateTime(DateTime.SYSTEM),
      ...(quote && { textObject: quote.object }),
    });
    quote?.object.dispose();
    this.ClearActiveField();
    const point = new SwPosition(node, hint.GetStart() + 1);
    const range = new SwPaM(point);
    try {
      const result = InsertPostIt(this.writer, range, reply);
      if (result) this.Focus(result, true);
      return result !== undefined;
    } finally {
      range.Dispose();
      point.Dispose();
    }
  }

  /** Deletes an annotation or its consecutive thread through the Writer cursor. @param id - Optional document annotation ID. @param thread - Whether to delete the thread. @returns Whether anything was deleted. */
  Delete(id?: number, thread = false): boolean {
    const field = this.GetFieldForCommand(id);
    if (!field || this.options.IsReadonly()) return false;
    const notes = thread ? this.GetThread(field) : [field];
    return this.writer.GetDoc().RunModelTransaction(
      /** Deletes each anchored dummy with its own native delete history. @returns Whether changed. */ () => {
        let deleted = false;
        for (const note of notes) deleted = this.DeleteField(note) || deleted;
        return deleted;
      },
    );
  }

  /** Reports whether there is an annotation window to provide dialog data. @returns Whether comment formatting is available. */
  CanFormatAllNotes(): boolean {
    return !this.options.IsReadonly() && this.windows.size > 0;
  }

  /** Formats all mounted notes using the active note or the first anchored note as dialog input. @returns Whether formatting was applied. */
  async ExecuteFormatAllDialog(): Promise<boolean> {
    if (!this.CanFormatAllNotes() || !this.dialogs) return false;
    const document = this.writer.GetDoc();
    const original = this.GetActiveField();
    const fields = SwPostItFieldType.Get(document);
    let source = original;
    if (!source) {
      for (const field of fields.GatherFields()) {
        if (!this.windows.has(field)) continue;
        source = field;
        break;
      }
    }
    const window = source && this.windows.get(source);
    if (!source || !window) return false;
    this.SetActiveSidebarWin(source);
    const input = window.editor.GetAttribs(window.view.getImpl().GetEditSelection());
    try {
      const output = await this.dialogs.RequestFormatAllNotes(input);
      if (!output) return false;
      try {
        if (document !== this.writer.GetDoc() || !this.CanFormatAllNotes()) return false;
        input.PutSet(output);
        return document.RunModelTransaction(
          /** Applies original input plus dialog output as one Writer undo action. @returns Whether applied. */ () => {
            const undo = document.GetUndoManager();
            undo.StartUndo("Format All Comments");
            try {
              let changed = false;
              for (const field of fields.GatherFields())
                changed =
                  this.windows.get(field)?.ApplyAttributes?.(input, true) === true || changed;
              return changed;
            } finally {
              undo.EndUndo();
            }
          },
        );
      } finally {
        output.Dispose();
      }
    } finally {
      input.Dispose();
      if (this.GetActiveField() === source && source !== original) this.ClearActiveField();
    }
  }

  /** Confirms when configured and removes the matching fields in one Writer undo group. @param author - Exact author filter, if supplied. @returns Whether any note was deleted. */
  async DeleteNotes(author?: string): Promise<boolean> {
    if (this.options.IsReadonly()) return false;
    const document = this.writer.GetDoc();
    if (this.deleteConfiguration?.GetQueryDeleteAllComments()) {
      const answer = await this.dialogs?.RequestDeleteComments(author);
      if (answer?.dontShowAgain) this.deleteConfiguration.SetQueryDeleteAllComments(false);
      if (!answer?.confirmed || document !== this.writer.GetDoc() || this.options.IsReadonly())
        return false;
    }
    const fields = [...SwPostItFieldType.Get(document).GatherFields()].filter(
      /** Matches the original author exactly. @param field - Anchored comment. @returns Whether to delete it. */
      (field) => author === undefined || field.GetField().GetData().author === author,
    );
    if (fields.length === 0) return false;
    const undo = document.GetUndoManager();
    return document.RunModelTransaction(
      /** Removes anchored notes from the end of the original field stack. @returns Whether changed. */ () => {
        undo.StartUndo(author === undefined ? "All Comments" : "Comments by " + author);
        try {
          let deleted = false;
          for (const field of fields.reverse()) deleted = this.DeleteField(field) || deleted;
          return deleted;
        } finally {
          undo.EndUndo();
        }
      },
    );
  }

  /** Deletes one native field at its current anchor. @param field - Target annotation field. @returns Whether changed. */
  private DeleteField(field: SwFormatField): boolean {
    const hint = field.GetTextField();
    const node = hint?.GetTextNode();
    if (!hint || !node) return false;
    if (this.GetActiveField() === field) this.ClearActiveField();
    const anchor = new SwPosition(node, hint.GetStart());
    try {
      this.writer.SetCursor(anchor);
      return this.writer.DelRight();
    } finally {
      anchor.Dispose();
    }
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
    const field = this.GetFieldForCommand(id);
    if (!field || this.options.IsReadonly()) return false;
    return this.SetResolved(field, !field.GetField().IsResolved());
  }

  /** Checks the field's parent metadata, including imported links that have no runtime ID. @param field - Anchored comment. @returns Whether the field is a root. */
  IsRootNote(field: SwFormatField): boolean {
    const note = field.GetField();
    const { parentId, parentName, parentPostItId } = note.GetData();
    if (parentPostItId) return false;
    if (!parentId && !parentName) return true;
    for (const candidate of note.GetTyp().GatherFields()) {
      const data = candidate.GetField().GetData();
      if ((parentId && data.paraId === parentId) || (parentName && data.name === parentName))
        return false;
    }
    return true;
  }

  /** Promotes a reply field to a root, retaining the live window's original follow flag. @param id - Optional annotation ID from the body request. @returns Whether promoted. */
  PromoteToRoot(id?: number): boolean {
    const field = this.GetFieldForCommand(id);
    if (!field || this.options.IsReadonly() || this.IsRootNote(field)) return false;
    const window = this.windows.get(field);
    if (window) this.followWindows.add(window);
    field.GetField().ClearParent();
    this.activeChanged?.();
    return true;
  }

  /** Groups consecutive follow windows after resolving the native parent metadata. @param fields - Layout fields in anchor order. @returns Sidebar threads in order. */
  GetThreads(fields: readonly SwFormatField[]): readonly (readonly SwFormatField[])[] {
    const names = new Set<string>();
    const paraIds = new Set<number>();
    for (const format of fields) {
      const data = format.GetField().GetData();
      if (data.name) names.add(data.name);
      if (data.paraId) paraIds.add(data.paraId);
    }
    const threads: SwFormatField[][] = [];
    for (const format of fields) {
      const { parentId, parentName, parentPostItId } = format.GetField().GetData();
      const window = this.windows.get(format);
      const follows =
        (window !== undefined && this.followWindows.has(window)) ||
        !!parentPostItId ||
        (parentId !== undefined && paraIds.has(parentId)) ||
        (parentName !== undefined && names.has(parentName));
      const previous = threads.at(-1);
      if (follows && previous) previous.push(format);
      else threads.push([format]);
    }
    return threads;
  }

  /** Checks the thread containing the active note. @returns Whether each note in the thread is resolved. */
  IsThreadResolved(): boolean {
    const field = this.GetActiveField();
    return (
      field !== undefined &&
      this.GetThread(field).every(
        /** Queries the native field value. @param note - Thread member. @returns Whether resolved. */
        (note) => note.GetField().IsResolved(),
      )
    );
  }

  /** Resolves or reopens a thread through the active note or the ID-based body command. @param id - Optional document annotation ID. @returns Whether the thread changed. */
  ToggleResolvedForThread(id?: number): boolean {
    const field = this.GetFieldForCommand(id);
    if (!field || this.options.IsReadonly()) return false;
    const thread = this.GetThread(field);
    const root = thread[0];
    if (!root) return false;
    const resolved =
      id === undefined
        ? !thread.every(
            /** Checks the whole thread in the annotation shell. @param note - Thread member. @returns Whether resolved. */
            (note) => note.GetField().IsResolved(),
          )
        : !root.GetField().IsResolved();
    return field
      .GetField()
      .GetTyp()
      .GetDoc()
      .RunModelTransaction(
        /** Updates the root and propagates its state to the rest of the thread. @returns Whether any field changed. */ () => {
          let changed = false;
          for (const note of thread) changed = this.SetResolved(note, resolved) || changed;
          return changed;
        },
      );
  }

  /** Finds the layout thread containing the supplied annotation. @param field - Anchored comment. @returns Comments in sidebar order. */
  private GetThread(field: SwFormatField): readonly SwFormatField[] {
    const fields = [...field.GetField().GetTyp().GatherFields()];
    return (
      this.GetThreads(fields).find(
        /** Finds the thread owning the requested field. @param thread - Sidebar thread. @returns Whether it contains the field. */
        (thread) => thread.includes(field),
      ) ?? []
    );
  }

  /** Finds the active window's field or a registered annotation by model ID. @param id - Optional document annotation ID. @returns Anchored field. */
  private GetFieldForCommand(id?: number): SwFormatField | undefined {
    if (id === undefined) return this.GetActiveField();
    for (const field of this.windows.keys())
      if (field.GetTextField()?.GetTextNode() && field.GetField().GetPostItId() === id)
        return field;
    return undefined;
  }

  /** Applies the resolution change through the annotation window. @param field - Target comment. @param resolved - New resolution state. @returns Whether changed. */
  private SetResolved(field: SwFormatField, resolved: boolean): boolean {
    const window = this.windows.get(field);
    if (!window?.SetResolved || resolved === field.GetField().IsResolved()) return false;
    if (resolved && !this.options.IsResolvedPostIts() && this.GetActiveField() === field)
      this.ReturnFocusToDocument();
    window.SetResolved(resolved);
    return true;
  }

  /** Completes a native focus request once the editor is mounted and visible. @param field - Projected annotation. @returns Nothing. */
  SidebarWinShown(field: SwFormatField): void {
    const pending = this.pendingFocus;
    if (pending?.field !== field) return;
    const window = this.windows.get(field);
    if (window === undefined) return;
    this.pendingFocus = undefined;
    this.SetActiveSidebarWin(field);
    if (pending.atEnd) window.PlaceCursorAtEnd?.();
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

  /** Routes the original field focus request after its browser window is mounted. @param field - Newly inserted annotation. @param atEnd - Positions a reply after its quotation. @returns Nothing. */
  Focus(field: SwFormatField, atEnd = false): void {
    if (!field.GetTextField()?.GetTextNode()) return;
    const visible = this.IsVisible(field);
    this.pendingFocus = { field, atEnd };
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
