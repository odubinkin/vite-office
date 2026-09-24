/**
 * @fileoverview Implements the persistent SwView shell/frame relationship and Writer command
 * coordination without owning browser workflows or presentation projections.
 */

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
import { SwViewOption } from "../../../inc/viewopt";
import { SwDocShell } from "../app/docsh";
import { WriterDialogController } from "../dialog/writer-dialog-controller";
import { SwEditWin } from "../docvw/edtwin";
import { SwViewCommandShell } from "../shells/viewsh";
import { SwWrtShell } from "../wrtsh/wrtsh";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { SwRootFrame } from "../../core/layout/newfrm";

/** Persistent Writer view joining SwDocShell, SwWrtShell, and frame dispatch. */
export class SwView {
  private readonly dialogController = new WriterDialogController();
  private frame: SfxViewFrame<SwView> | undefined;
  private readonly viewCommandShell: SwViewCommandShell;
  private readonly viewOptions: SwViewOption;
  private readonly wrtShell: SwWrtShell;
  private readonly editWindow: SwEditWin;
  private readonly layout = new SwRootFrame();
  private readonly wrtShellSubscription: () => void;

  /** Creates one persistent view over a persistent document shell. @param docShell - Owning Writer document shell. @returns Nothing. */
  public constructor(private readonly docShell: SwDocShell) {
    this.wrtShell = new SwWrtShell(docShell, this.dialogController);
    this.editWindow = new SwEditWin(
      this.wrtShell,
      /** Publishes final operation state after edit-window compound actions close. @returns Nothing. */ () =>
        this.Invalidate("document", "history", "selection"),
    );
    this.viewOptions = new SwViewOption(
      /** Invalidates view-option slot state. @returns Nothing. */ () => this.Invalidate("view"),
    );
    this.viewCommandShell = new SwViewCommandShell(this);
    this.wrtShellSubscription = this.wrtShell.Subscribe(
      /** Converts typed Writer hints into dispatcher dependency invalidation. @param hint - Typed Writer hint. @returns Nothing. */ (
        hint,
      ) => {
        const dependencies = getWriterHintDependencies(hint);
        if (dependencies.includes("document")) this.layout.Invalidate();
        this.Invalidate(...dependencies);
      },
    );
  }

  /** Attaches this view to its active frame once during session construction. @param frame - Persistent active office frame. @returns Nothing. */
  public AttachFrame(frame: SfxViewFrame<SwView>): void {
    if (this.frame !== undefined) throw new Error("SwView is already attached to an SfxViewFrame.");
    this.frame = frame;
  }

  /** Returns the active document shell. @returns Persistent SwDocShell. */
  public GetDocShell(): SwDocShell {
    return this.docShell;
  }

  /** Returns the persistent Writer editing shell. @returns SwWrtShell. */
  public GetWrtShell(): SwWrtShell {
    return this.wrtShell;
  }

  /** Returns the platform-neutral Writer edit-window owner. @returns Persistent edit window. */
  public GetEditWin(): SwEditWin {
    return this.editWindow;
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
  /** Opens the upstream PageDialog boundary and applies an accepted descriptor through SwWrtShell. @returns Whether accepted geometry changed the document. */
  public async OpenPageDialog(): Promise<boolean> {
    const result = await this.dialogController.RequestPageDialog(
      WRITER_COMMAND_IDS.pageDialog,
      this.docShell.GetDoc().GetPageDesc().GetValue(),
    );
    return result === undefined ? false : this.wrtShell.SetPageDescriptor(result.pageDescriptor);
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
    this.wrtShellSubscription();
    this.frame?.CloseView();
    this.frame = undefined;
    this.wrtShell.Close();
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
