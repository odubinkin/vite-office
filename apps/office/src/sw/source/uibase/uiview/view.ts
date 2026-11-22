/**
 * @fileoverview Implements the persistent SwView shell/frame relationship and Writer command
 * coordination without owning browser workflows or presentation projections.
 */

import { FieldUnit } from "../../../../tools/inc/fldunit";
import { SwModule } from "../app/swmodule";
import {
  type CommandDefinition,
  type CommandDispatchResult,
  type CommandState,
  type SfxDispatcher,
  type SfxShell,
} from "../../../../sfx2/source/control/dispatch";
import type { SfxViewFrame } from "../../../../sfx2/source/view/viewfrm";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import type { SwModelHint } from "../../../inc/hints";
import type { SearchOptionsConfiguration } from "../../../../unotools/source/config/searchopt";
import type { RegexMatcherFactory } from "../../../../unotools/inc/textsearch";
import { SwViewSearch } from "./viewsrch";
import { SwViewOption } from "../../../inc/viewopt";
import { SwDocShell } from "../app/docsh";
import {
  WriterDialogController,
  type WriterCommentDeleteConfiguration,
} from "../dialog/writer-dialog-controller";
import { SwPostItMgr } from "../docvw/PostItMgr";
import { SwEditWin } from "../docvw/edtwin";
import { SwAnnotationShell } from "../shells/annotsh";
import { SwTableShell } from "../shells/tabsh";
import { SwViewCommandShell } from "../shells/view";
import { SwWrtShell } from "../wrtsh/wrtsh1";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { SwRootFrame } from "../../core/layout/newfrm";
import { SwPostItFieldType } from "../../core/fields/docufld";
import { SelectionType } from "../inc/wrtsh";
import type { SwTabCols } from "../../core/bastyp/tabcol";
import type { SvxColumnItem } from "../../../../svx/source/dialog/rulritem";
import { SID_RULER_BORDERS, SID_RULER_ROWS_VERTICAL } from "../../../../svx/inc/svxids";
import {
  createSwTableColumnItem,
  createSwTableRowItem,
  createSwParagraphULSpaceItem,
  applySwParagraphULSpaceItem,
} from "./viewtab";
import type { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { RES_PAGEDESC } from "../../../inc/hintids";
import type { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import { PageDescToItemSet } from "../utlui/uitool";
import { SvxRuler } from "../../../../svx/source/dialog/svxruler";

/** Persistent Writer view joining SwDocShell, SwWrtShell, and frame dispatch. */
export class SwView {
  private readonly releaseMetricView: () => void;
  private readonly dialogController = new WriterDialogController();
  private frame: SfxViewFrame<SwView> | undefined;
  private selectionType: SelectionType | undefined;
  private readonly viewCommandShell: SwViewCommandShell;
  private readonly annotationShell: SwAnnotationShell;
  private readonly tableShell: SwTableShell;
  private readonly viewOptions: SwViewOption;
  private readonly wrtShell: SwWrtShell;
  private readonly search: SwViewSearch;
  private readonly postItMgr: SwPostItMgr;
  private readonly editWindow: SwEditWin;
  private readonly horizontalRuler = new SvxRuler(true);
  private readonly verticalRuler = new SvxRuler(false);
  private readonly layout: SwRootFrame;
  private readonly wrtShellSubscription: () => void;

  /** Creates one persistent view over a persistent document shell. @param docShell - Owning Writer document shell. @param module - Actual module metric preferences and open-view enumeration. @param searchOptions - User search configuration. @param createRegex - Browser regular-expression compiler. @param commentDeleteConfiguration - Shared comment deletion query preference. @returns Nothing. */
  public constructor(
    private readonly docShell: SwDocShell,
    private readonly module: SwModule = SwModule.get(),
    searchOptions?: SearchOptionsConfiguration,
    createRegex?: RegexMatcherFactory,
    commentDeleteConfiguration?: WriterCommentDeleteConfiguration,
  ) {
    const pref = module.GetUsrPref(false);
    this.horizontalRuler.SetUnit(pref.GetHScrollMetric());
    this.verticalRuler.SetUnit(pref.GetVScrollMetric());
    this.releaseMetricView = module.RegisterMetricView(this);
    this.layout = new SwRootFrame(
      /** Resolves the current document after New/Open replaces the shell graph. @returns Active Writer document. */ () =>
        this.docShell.GetDoc(),
    );
    this.viewOptions = new SwViewOption(
      /** Invalidates view-option slot state. @returns Nothing. */ () => this.Invalidate("view"),
    );
    this.wrtShell = new SwWrtShell(
      docShell,
      this.dialogController,
      this.layout,
      this.viewOptions,
      this,
    );
    this.postItMgr = new SwPostItMgr(
      this.viewOptions,
      this.wrtShell,
      createRegex,
      /** Recomputes the native shell and annotation formatting states. @returns Nothing. */ () =>
        this.Invalidate("selection"),
      this.dialogController,
      commentDeleteConfiguration,
    );
    this.annotationShell = new SwAnnotationShell(this.postItMgr, this.wrtShell);
    this.search = new SwViewSearch(this.wrtShell, searchOptions, createRegex, this.postItMgr);
    this.docShell.SetView(this);
    this.editWindow = new SwEditWin(
      this,
      /** Publishes final operation state after edit-window compound actions close. @returns Nothing. */ () =>
        this.Invalidate("document", "history", "selection"),
    );
    this.viewCommandShell = new SwViewCommandShell(this);
    this.tableShell = new SwTableShell(this.wrtShell);
    this.wrtShellSubscription = this.wrtShell.Subscribe(
      /** Converts typed Writer hints into dispatcher dependency invalidation. @param hint - Typed Writer hint. @returns Nothing. */ (
        hint,
      ) => {
        const dependencies = getWriterHintDependencies(hint);
        if (dependencies.includes("document"))
          for (const nested of hint.kind === "model-transaction" ? hint.hints : [hint])
            this.layout.Invalidate(
              "nodeIndex" in nested
                ? nested.nodeIndex
                : "index" in nested
                  ? nested.index
                  : undefined,
            );
        this.Invalidate(...dependencies);
      },
    );
  }

  /** Attaches this view to its active frame once during session construction. @param frame - Persistent active office frame. @returns Nothing. */
  public AttachFrame(frame: SfxViewFrame<SwView>): void {
    if (this.frame !== undefined) throw new Error("SwView is already attached to an SfxViewFrame.");
    this.frame = frame;
  }
  /** Selects the annotation shell or the represented native text/list/table stack. @returns Nothing. */
  public SelectShell(): void {
    if (this.frame === undefined || this.frame.GetActiveView() !== this) return;
    const selectionType = this.postItMgr.GetActiveField()
      ? SelectionType.PostIt
      : this.wrtShell.GetSelectionType() & ~SelectionType.TableCell;
    if (selectionType === this.selectionType) return;
    this.selectionType = selectionType;
    const dispatcher = this.frame.GetDispatcher(),
      annotation = this.annotationShell.GetShell(),
      table = this.tableShell.GetCommandShell(),
      list = this.wrtShell.GetListShell().GetCommandShell(),
      text = this.wrtShell.GetCommandShell();
    dispatcher.Pop(annotation);
    dispatcher.Pop(table);
    dispatcher.Pop(text);
    dispatcher.Pop(list);
    if (selectionType === SelectionType.PostIt) {
      dispatcher.Push(annotation);
      return;
    }
    if ((selectionType & SelectionType.NumberList) !== 0) dispatcher.Push(list);
    dispatcher.Push(text);
    if ((selectionType & SelectionType.Table) !== 0) dispatcher.Push(table);
  }

  /** Borrows the real module preference owner. @returns Writer module. */
  public GetModule(): SwModule {
    return this.module;
  }
  /** Source dialog field unit from the actual module. @returns User metric. */
  public GetMetric(): FieldUnit {
    return this.module.GetMetric(false);
  }
  /** Original ruler metric query. @returns Horizontal ruler unit. */
  public GetHRulerMetric(): FieldUnit {
    return this.horizontalRuler.GetUnit();
  }
  /** Original ruler metric query. @returns Vertical ruler unit. */
  public GetVRulerMetric(): FieldUnit {
    return this.verticalRuler.GetUnit();
  }
  /** Original view ruler update with browser binding invalidation. @param unit - New ruler unit. @returns Nothing. */
  public ChangeTabMetric(unit: FieldUnit): void {
    this.horizontalRuler.SetUnit(unit);
    this.Invalidate("view");
  }
  /** Original view ruler update with browser binding invalidation. @param unit - New ruler unit. @returns Nothing. */
  public ChangeVRulerMetric(unit: FieldUnit): void {
    this.verticalRuler.SetUnit(unit);
    this.Invalidate("view");
  }
  /** Returns the active document shell. @returns Persistent SwDocShell. */
  public GetDocShell(): SwDocShell {
    return this.docShell;
  }

  /** Returns the persistent Writer editing shell. @returns SwWrtShell. */
  public GetWrtShell(): SwWrtShell {
    return this.wrtShell;
  }

  /** Executes the represented native repeat-search command. @returns Whether a match was found. */
  public RepeatSearch(): boolean {
    return this.search.RepeatSearch();
  }

  /** Returns the view's persistent search dispatcher. @returns Search owner. */
  public GetSearch(): SwViewSearch {
    return this.search;
  }

  /** Returns the view-owned annotation manager. @returns Active view comment manager. */
  public GetPostItMgr(): SwPostItMgr {
    return this.postItMgr;
  }

  /** Reads the consumed paragraph-spacing StateTabWin branch. @returns Uniform slot item or mixed state. */
  public GetParagraphULSpace(): SvxULSpaceItem | undefined {
    return this.wrtShell.GetTextShell().GetUniformParagraphItem(createSwParagraphULSpaceItem);
  }

  /** Executes the consumed paragraph-spacing ExecTabWin branch through actual paragraph history. @param item - Accepted slot value. @returns Whether changed. */
  public ApplyParagraphULSpace(item: SvxULSpaceItem): boolean {
    return this.wrtShell.GetTextShell().SetParagraphItem(applySwParagraphULSpaceItem(item));
  }

  /** Returns the platform-neutral Writer edit-window owner. @returns Persistent edit window. */
  public GetEditWin(): SwEditWin {
    return this.editWindow;
  }

  /** Returns this view's persistent native horizontal ruler. @returns Horizontal ruler owner. */
  public GetHRuler(): SvxRuler {
    return this.horizontalRuler;
  }

  /** Returns this view's persistent native vertical ruler. @returns Vertical ruler owner. */
  public GetVRuler(): SvxRuler {
    return this.verticalRuler;
  }

  /** Converts document-mouse column state at the source view boundary. @param columns - Borrowed native separators. @param active - Active native column. @returns Owned ruler value. */
  public GetTableRulerColumnItem(columns: SwTabCols, active = 0): SvxColumnItem {
    return createSwTableColumnItem(
      columns,
      active,
      this.GetDocShell().GetDoc().GetPageDesc().GetValue().width,
      SID_RULER_BORDERS,
    );
  }

  /** Converts horizontal-writing table rows for the native vertical ruler. @param rows - Borrowed Writer row separators. @returns Owned ruler value. */
  public GetTableRulerRowItem(rows: SwTabCols): SvxColumnItem {
    return createSwTableRowItem(
      rows,
      this.GetDocShell().GetDoc().GetPageDesc().GetValue().height,
      SID_RULER_ROWS_VERTICAL,
    );
  }

  /** Returns the persistent core layout root for browser device measurements. @returns Layout root. */
  public GetLayout(): SwRootFrame {
    return this.layout;
  }

  /** Returns the view-owned typed child-window request controller. @returns Writer dialog controller. */
  public GetDialogController(): WriterDialogController {
    return this.dialogController;
  }

  /** Returns the SwView command shell for bottom-to-top frame registration. @returns View command shell. */
  public GetCommandShell(): SfxShell {
    return this.viewCommandShell.GetShell();
  }

  /** Returns the active office frame for browser shortcut adaptation. @returns Attached frame. */
  public GetViewFrame(): SfxViewFrame<SwView> {
    if (this.frame === undefined) throw new Error("SwView is not attached to an SfxViewFrame.");
    return this.frame;
  }

  /** Dispatches a stable Writer command through the active frame shell stack. @param commandId - Stable command identity. @param arguments_ - Typed UI-adapter arguments. @returns Explicit dispatch result. */
  public Execute(commandId: string, arguments_?: unknown): CommandDispatchResult<unknown> {
    return this.GetDispatcher().Execute(commandId, arguments_);
  }

  /** Queries enabled/checked/value state from the same resolving shell used for execution. @param commandId - Stable command identity. @returns Current command state. */
  public QueryState(commandId: string): CommandState {
    return this.GetViewFrame().GetBindings().QueryState(commandId);
  }

  /** Returns the same resolved descriptor used by every presentation surface. @param commandId - Stable command identity. @returns Resolved descriptor or undefined. */
  public QueryCommand(commandId: string): CommandDefinition<unknown, unknown, unknown> | undefined {
    return this.GetDispatcher().QueryDispatch(commandId)?.command;
  }

  /** Creates a new document through the existing document shell. @returns Nothing. */
  public NewDocument(): void {
    this.docShell.InitNew(
      createDocument({
        id: "writer-workbench",
        suiteId: "writer",
        title: "Untitled Writer Document",
      }),
    );
  }

  /** Selects the complete Writer body through the persistent SwPaM. @returns Nothing. */
  public RequestSelectAll(): void {
    this.wrtShell.SelectAll();
  }

  /** Returns horizontal-ruler command state. @returns Visibility. */
  public IsHorizontalRulerVisible(): boolean {
    return this.viewOptions.IsHorizontalRulerVisible();
  }
  /** Returns vertical-ruler command state. @returns Visibility. */
  public IsVerticalRulerVisible(): boolean {
    return this.viewOptions.IsVerticalRulerVisible();
  }

  /** Returns sidebar command state. @returns Visibility. */
  public IsSidebarVisible(): boolean {
    return this.viewOptions.IsSidebarVisible();
  }

  /** Returns status-bar command state. @returns Visibility. */
  public IsStatusBarVisible(): boolean {
    return this.viewOptions.IsStatusBarVisible();
  }

  /** Checks for native comment fields in the current document. @returns Whether there are comments. */
  public HasNotes(): boolean {
    return SwPostItFieldType.Get(this.docShell.GetDoc()).GatherFields().next().done === false;
  }

  /** Reads the current Comments view option. @returns Whether comments are shown. */
  public IsPostIts(): boolean {
    return this.viewOptions.IsPostIts();
  }

  /** Reads the current Resolved Comments view option. @returns Whether resolved comments are shown. */
  public IsResolvedPostIts(): boolean {
    return this.viewOptions.IsResolvedPostIts();
  }

  /** Applies the Comments view option through the annotation manager. @param value - Whether to show comments. @returns Nothing. */
  public SetPostIts(value: boolean): void {
    this.postItMgr.ShowNotes(value);
  }

  /** Applies the Resolved Comments view option through the annotation manager. @param value - Whether to show resolved comments. @returns Nothing. */
  public SetResolvedPostIts(value: boolean): void {
    this.postItMgr.ShowHideResolvedNotes(value);
  }

  /** Returns whether a medium operation gates lifecycle commands. @returns Pending state. */
  public IsStoragePending(): boolean {
    return this.docShell.GetMedium().lastOperation.state === "pending";
  }

  /** Toggles horizontal-ruler visibility. @returns Nothing. */
  public ToggleHorizontalRuler(): void {
    this.viewOptions.ToggleHorizontalRuler();
  }
  /** Toggles vertical-ruler visibility. @returns Nothing. */
  public ToggleVerticalRuler(): void {
    this.viewOptions.ToggleVerticalRuler();
  }
  /** Opens the active Page Style and applies the accepted tab output in one action. @returns Whether the document changed. */
  public async OpenPageDialog(): Promise<boolean> {
    const document = this.docShell.GetDoc();
    const node = this.wrtShell.GetActiveParagraph();
    const point = this.wrtShell.GetCursor().GetPoint();
    const assigned = node.GetAttr(RES_PAGEDESC) as SwFormatPageDesc;
    const name =
      this.layout.FindPageDescriptorAt(node, point.GetContentIndex()) ?? assigned.GetPageDescName();
    const descriptor = document.FindPageDesc(name) ?? document.GetPageDesc();
    const pageInput = PageDescToItemSet(descriptor);
    const result = await this.dialogController
      .RequestPageDialog(
        WRITER_COMMAND_IDS.pageDialog,
        descriptor.GetValue(),
        pageInput,
        document.GetDocumentSettingManager().get("HTML_MODE"),
      )
      .finally(
        /** Releases the dialog's native input snapshot on acceptance or cancellation. @returns Nothing. */
        () => pageInput.Dispose(),
      );
    try {
      return (
        result !== undefined &&
        this.docShell.GetDoc() === document &&
        this.wrtShell.SetPageDescriptor(
          result.pageDescriptor,
          descriptor.GetName(),
          result.pageItems,
        )
      );
    } finally {
      result?.pageItems?.Dispose();
    }
  }

  /** Toggles sidebar visibility. @returns Nothing. */
  public ToggleSidebar(): void {
    this.viewOptions.ToggleSidebar();
  }

  /** Toggles status-bar visibility. @returns Nothing. */
  public ToggleStatusBar(): void {
    this.viewOptions.ToggleStatusBar();
  }

  /** Releases view, dispatcher, and document-shell subscriptions at explicit session close. @returns Nothing. */
  public Close(): void {
    const dialog = this.dialogController.GetSnapshot();
    if (
      dialog?.request.kind === "delete-comments" ||
      dialog?.request.kind === "character" ||
      dialog?.request.kind === "page-style"
    )
      this.dialogController.Cancel(dialog.id);
    this.releaseMetricView();
    this.editWindow.MouseButtonUp(true);
    this.horizontalRuler.CancelDrag();
    this.verticalRuler.CancelDrag();
    this.wrtShellSubscription();
    this.frame?.CloseView();
    this.frame = undefined;
    this.postItMgr.Dispose();
    this.wrtShell.Close();
    this.layout.DestroyImpl();
    this.docShell.SetView(undefined);
    this.docShell.Close();
  }

  /** Returns the attached active frame dispatcher or throws for invalid construction order. @returns SfxDispatcher. */
  private GetDispatcher(): SfxDispatcher {
    if (this.frame === undefined) throw new Error("SwView is not attached to an SfxViewFrame.");
    return this.frame.GetDispatcher();
  }

  /** Invalidates command state through the frame dispatcher. @param dependencies - Changed state labels. @returns Nothing. */
  private Invalidate(...dependencies: readonly string[]): void {
    if (this.frame === undefined) return;
    this.SelectShell();
    this.GetDispatcher().Invalidate(...dependencies);
  }
}

/** Maps typed Writer notifications to the command-state dependency vocabulary. @param hint - Typed Writer hint. @returns Changed dependency labels. */
function getWriterHintDependencies(hint: SwModelHint): readonly string[] {
  const hints = hint.kind === "model-transaction" ? hint.hints : [hint];
  const dependencies = new Set<string>();
  for (const nested of hints) {
    if (nested.kind === "cursor-selection-changed") dependencies.add("selection");
    else if (
      nested.kind === "document-modified" ||
      nested.kind === "document-state-changed" ||
      nested.kind === "medium-operation-changed" ||
      nested.kind === "document-disposed"
    )
      dependencies.add("lifecycle");
    else if (nested.kind === "document-replaced") {
      dependencies.add("document");
      dependencies.add("history");
      dependencies.add("selection");
    } else {
      dependencies.add("document");
      dependencies.add("history");
    }
  }
  return [...dependencies];
}
