/**
 * @fileoverview Implements the persistent SwView shell/frame relationship, command routing,
 * and external-store snapshot while receiving browser workflows through an injected factory.
 */

import {
  createCommandShell,
  type CommandDefinition,
  type CommandDispatchResult,
  type CommandState,
  type OfficeFrame,
  type SfxDispatcher,
  type SfxShell,
} from "../../../../framework/source/dispatch/dispatchprovider";
import { createDocument, type OfficeDocument } from "../../../../sfx2/source/doc/objsh";
import type { SfxMediumOperationStatus } from "../../../../sfx2/source/doc/docfile";
import type { SwModelHint } from "../../../inc/hints";
import type { WriterClipboardPaste } from "../../filter/html/html-filter-types";
import type { SwDoc } from "../../core/doc/doc";
import type { WriterParagraphList } from "../../core/doc/list";
import type { WriterParagraphStyle } from "../../core/doc/fmtcol";
import type { WriterParagraphAlignment, WriterTextRun, SwTextNode } from "../../core/txtnode/ndtxt";
import type { SwPaM } from "../../core/crsr/pam";
import { SwPosition } from "../../core/crsr/pam";
import { SwDocShell } from "../app/docsh";
import { WriterDialogController } from "../dialog/writer-dialog-controller";
import { createWriterViewCommandRegistry } from "../shells/writercommands";
import { SwWrtShell } from "../wrtsh/wrtsh";
import type { WriterCursorSelection } from "../wrtsh/wrtsh-selection";

/** Primitive/resource-ID projection of one text node. */
export interface WriterParagraphProjection {
  readonly alignment: WriterParagraphAlignment;
  readonly bulletChar?: string;
  readonly id: string;
  readonly list: WriterParagraphList;
  readonly listId: string;
  readonly listMarker?: string;
  /** Direct text-left margin in twips. */
  readonly textLeftMargin: number;
  readonly numRuleName: string;
  readonly runs: readonly WriterTextRun[];
  readonly style: WriterParagraphStyle;
  readonly styleDisplayName: string;
  readonly text: string;
}

/** Immutable presentation value with no mutable model references. */
export interface WriterPresentationProjection {
  readonly activeParagraph: WriterParagraphProjection;
  readonly activeParagraphIndex: number;
  readonly cursorSelection: WriterCursorSelection;
  readonly documentState: OfficeDocument;
  readonly modelRevision: number;
  readonly paragraphs: readonly WriterParagraphProjection[];
}

/** Browser-owned projector injected into the upstream-shaped view shell. */
export interface WriterPresentationProjector {
  readonly Project: (
    document: SwDoc,
    activeParagraph: SwTextNode,
    cursor: SwPaM,
    documentState: OfficeDocument,
  ) => WriterPresentationProjection;
  readonly ResolveNode: (document: SwDoc, projectionId: string) => SwTextNode | undefined;
}

/** DOM-adapted Cut arguments accepted by the unified command. */
export interface WriterCutCommandArguments {
  /** True when a native Cut event already populated event.clipboardData. */
  readonly clipboardHandled?: boolean;
}

/** DOM-adapted Paste arguments accepted by native and explicit Paste surfaces. */
export interface WriterPasteCommandArguments {
  /** True when a native Paste event supplied the complete clipboard payload, including empty. */
  readonly clipboardHandled?: boolean;
  /** Already parsed native clipboard document, omitted for asynchronous toolbar Paste. */
  readonly paste?: WriterClipboardPaste;
}

/** Browser workflow controllers injected into SwView as neutral command/state surfaces. */
export interface WriterViewControllers {
  readonly chromePreferences: {
    readonly IsHorizontalRulerVisible: () => boolean;
    readonly IsSidebarVisible: () => boolean;
    readonly IsStatusBarVisible: () => boolean;
    readonly ToggleHorizontalRuler: () => void;
    readonly ToggleSidebar: () => void;
    readonly ToggleStatusBar: () => void;
  };
  readonly clipboardWorkflow: {
    readonly Copy: (arguments_?: unknown) => Promise<void>;
    readonly Cut: (arguments_?: unknown) => Promise<void>;
    readonly Paste: (arguments_?: unknown) => Promise<void>;
  };
  readonly fileWorkflow: {
    readonly ExportText: () => Promise<void>;
    readonly OpenOdt: () => Promise<void>;
    readonly SaveOdt: () => Promise<void>;
  };
  readonly localStorageWorkflow: {
    readonly Load: () => Promise<void>;
    readonly Save: () => Promise<void>;
  };
  readonly presentationProjector: WriterPresentationProjector;
}

/** Composition-root factory that binds browser ports after SwView creates its editing shell. */
export interface WriterViewControllerFactory {
  readonly Create: (
    docShell: SwDocShell,
    wrtShell: SwWrtShell,
    invalidateView: () => void,
  ) => WriterViewControllers;
}

/** Immutable React read model projected without cloning the canonical SwDoc. */
export interface WriterViewSnapshot extends WriterPresentationProjection {
  /** Horizontal-ruler visibility in this view. */
  readonly isHorizontalRulerVisible: boolean;
  /** Properties-sidebar visibility in this view. */
  readonly isPropertiesSidebarVisible: boolean;
  /** Whether one browser medium operation is pending. */
  readonly isStoragePending: boolean;
  /** Status-bar visibility in this view. */
  readonly isStatusBarVisible: boolean;
  /** Current operation state owned by the retained SfxMedium. */
  readonly mediumOperation: Readonly<SfxMediumOperationStatus>;
  /** Monotonic dispatcher invalidation version. */
  readonly viewVersion: number;
}

/** Persistent Writer view joining SwDocShell, SwWrtShell, frame dispatch, and React snapshots. */
export class SwView {
  private cachedSnapshot: WriterViewSnapshot | undefined;
  private readonly chromePreferences: WriterViewControllers["chromePreferences"];
  private readonly clipboardWorkflow: WriterViewControllers["clipboardWorkflow"];
  private readonly dialogController = new WriterDialogController();
  private dispatcherSubscription: (() => void) | undefined;
  private readonly fileWorkflow: WriterViewControllers["fileWorkflow"];
  private frame: OfficeFrame<SwView> | undefined;
  private readonly listeners = new Set<() => void>();
  private readonly localStorageWorkflow: WriterViewControllers["localStorageWorkflow"];
  private readonly viewCommandShell: SfxShell;
  private readonly viewProjection: WriterPresentationProjector;
  private readonly wrtShell: SwWrtShell;
  private readonly wrtShellSubscription: () => void;

  /** Creates one persistent view over a persistent document shell. @param docShell - Owning Writer document shell. @param controllerFactory - Injected neutral workflow-controller factory. @returns Nothing. */
  public constructor(
    private readonly docShell: SwDocShell,
    controllerFactory: WriterViewControllerFactory,
  ) {
    this.wrtShell = new SwWrtShell(docShell, this.dialogController);
    const controllers = controllerFactory.Create(
      docShell,
      this.wrtShell,
      /** Invalidates view-only presentation state. @returns Nothing. */ () =>
        this.Invalidate("view"),
    );
    this.chromePreferences = controllers.chromePreferences;
    this.fileWorkflow = controllers.fileWorkflow;
    this.localStorageWorkflow = controllers.localStorageWorkflow;
    this.clipboardWorkflow = controllers.clipboardWorkflow;
    this.viewProjection = controllers.presentationProjector;
    this.viewCommandShell = createCommandShell(this, createWriterViewCommandRegistry(this));
    this.wrtShellSubscription = this.wrtShell.Subscribe(
      /** Converts typed Writer hints into dispatcher dependency invalidation. @param hint - Typed Writer hint. @returns Nothing. */ (
        hint,
      ) => this.Invalidate(...getWriterHintDependencies(hint)),
    );
  }

  /** Attaches this view to its active frame once during session construction. @param frame - Persistent active office frame. @returns Nothing. */
  public AttachFrame(frame: OfficeFrame<SwView>): void {
    if (this.frame !== undefined) throw new Error("SwView is already attached to an OfficeFrame.");
    this.frame = frame;
    this.dispatcherSubscription = frame
      .GetBindings()
      .Subscribe(
        /** Publishes one external-store update after dispatcher invalidation. @returns Nothing. */ () =>
          this.PublishSnapshotInvalidation(),
      );
  }

  /** Returns the active document shell. @returns Persistent SwDocShell. */
  public GetDocShell(): SwDocShell {
    return this.docShell;
  }

  /** Returns the persistent Writer editing shell. @returns SwWrtShell. */
  public GetWrtShell(): SwWrtShell {
    return this.wrtShell;
  }

  /** Returns the view-owned typed child-window request controller. @returns Writer dialog controller. */
  public GetDialogController(): WriterDialogController {
    return this.dialogController;
  }

  /** Returns the SwView command shell for bottom-to-top frame registration. @returns View command shell. */
  public GetCommandShell(): SfxShell {
    return this.viewCommandShell;
  }

  /** Returns the active office frame for browser shortcut adaptation. @returns Attached frame. */
  public GetViewFrame(): OfficeFrame<SwView> {
    if (this.frame === undefined) throw new Error("SwView is not attached to an OfficeFrame.");
    return this.frame;
  }

  /** Returns an immutable external-store snapshot, retaining identity until invalidation. @returns Current view read model. */
  public readonly GetSnapshot =
    /** Projects or reuses the current immutable view snapshot. @returns Current view read model. */
    (): WriterViewSnapshot => {
      if (this.cachedSnapshot !== undefined) return this.cachedSnapshot;
      const document = this.docShell.GetDoc();
      const activeParagraph = this.wrtShell.GetActiveParagraph();
      const projection = this.viewProjection.Project(
        document,
        activeParagraph,
        this.wrtShell.GetCursor(),
        this.docShell.GetDocumentState(),
      );
      this.cachedSnapshot = Object.freeze({
        ...projection,
        isHorizontalRulerVisible: this.chromePreferences.IsHorizontalRulerVisible(),
        isPropertiesSidebarVisible: this.chromePreferences.IsSidebarVisible(),
        isStatusBarVisible: this.chromePreferences.IsStatusBarVisible(),
        isStoragePending: this.docShell.GetMedium().lastOperation.state === "pending",
        mediumOperation: this.docShell.GetMedium().GetLastOperation(),
        viewVersion: this.GetViewFrame().GetBindings().GetVersion(),
      });
      return this.cachedSnapshot;
    };

  /** Subscribes React or another view consumer to versioned invalidation. @param listener - Store listener. @returns Cleanup removing it. */
  public readonly Subscribe =
    /** Registers one external-store listener. @param listener - Store callback. @returns Cleanup removing it. */
    (listener: () => void): (() => void) => {
      this.listeners.add(listener);
      return /** Removes one external-store listener. @returns Whether the listener was present. */ () =>
        this.listeners.delete(listener);
    };

  /** Dispatches a stable Writer command through the active frame shell stack. @param commandId - Stable command identity. @param arguments_ - Typed UI-adapter arguments. @returns Explicit dispatch result. */
  public Execute(commandId: string, arguments_?: unknown): CommandDispatchResult<unknown> {
    return this.GetDispatcher().Execute(commandId, arguments_);
  }

  /** Resolves a browser projection key and focuses the canonical node. @param projectionId - View-only node key. @returns Whether it resolved. */
  public FocusProjectedParagraph(projectionId: string): boolean {
    const node = this.viewProjection.ResolveNode(this.docShell.GetDoc(), projectionId);
    if (node === undefined) return false;
    this.wrtShell.FocusNode(node);
    return true;
  }

  /** Converts browser projection endpoints to canonical SwPositions before entering SwWrtShell. @param selection - View-only selection. @returns Whether the PaM changed. */
  public SetProjectedSelection(selection: WriterCursorSelection): boolean {
    const document = this.docShell.GetDoc();
    const pointNode = this.viewProjection.ResolveNode(document, selection.point.paragraphId);
    const markNode =
      selection.mark === undefined
        ? undefined
        : this.viewProjection.ResolveNode(document, selection.mark.paragraphId);
    if (pointNode === undefined || (selection.mark !== undefined && markNode === undefined))
      return false;
    return this.wrtShell.SetPaM(
      new SwPosition(pointNode, selection.point.offset),
      selection.mark === undefined || markNode === undefined
        ? undefined
        : new SwPosition(markNode, selection.mark.offset),
    );
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
      "writer-paragraph-1",
    );
  }

  /** Selects and atomically opens one ODT through the persistent document shell. @returns Completion after browser feedback. */
  public async OpenOdt(): Promise<void> {
    await this.fileWorkflow.OpenOdt();
  }

  /** Downloads the active document through Writer's ODT filter. @returns Completion after worker export and download start. */
  public async SaveOdt(): Promise<void> {
    await this.fileWorkflow.SaveOdt();
  }

  /** Saves the active identity to its browser-local medium. @returns Completion after acknowledgement. */
  public async SaveLocal(): Promise<void> {
    await this.localStorageWorkflow.Save();
  }

  /** Loads the current document identity from browser-local storage. @returns Completion after optional replacement. */
  public async LoadLocal(): Promise<void> {
    await this.localStorageWorkflow.Load();
  }

  /** Starts the existing plain-text export through the injected browser adapter. @returns Completion after the browser port settles. */
  public ExportText(): Promise<void> {
    return this.fileWorkflow.ExportText();
  }

  /** Copies one DOM-adapted Writer selection. @param arguments_ - Optional sanitized selection. @returns Completion after feedback. */
  public async Copy(arguments_?: unknown): Promise<void> {
    await this.clipboardWorkflow.Copy(arguments_);
  }

  /** Copies then deletes a canonical Writer selection through one Cut command. @param arguments_ - DOM-adapted Cut request. @returns Completion after feedback. */
  public async Cut(arguments_?: unknown): Promise<void> {
    await this.clipboardWorkflow.Cut(arguments_);
  }

  /** Inserts native or asynchronously read clipboard content through one Paste command. @param arguments_ - DOM-adapted range and optional native transfer document. @returns Completion after feedback. */
  public async Paste(arguments_?: unknown): Promise<void> {
    await this.clipboardWorkflow.Paste(arguments_);
  }

  /** Selects the complete Writer body through the persistent SwPaM. @returns Nothing. */
  public RequestSelectAll(): void {
    this.wrtShell.SelectAll();
  }

  /** Returns horizontal-ruler command state. @returns Visibility. */
  public IsHorizontalRulerVisible(): boolean {
    return this.chromePreferences.IsHorizontalRulerVisible();
  }

  /** Returns sidebar command state. @returns Visibility. */
  public IsSidebarVisible(): boolean {
    return this.chromePreferences.IsSidebarVisible();
  }

  /** Returns status-bar command state. @returns Visibility. */
  public IsStatusBarVisible(): boolean {
    return this.chromePreferences.IsStatusBarVisible();
  }

  /** Returns whether a medium operation gates lifecycle commands. @returns Pending state. */
  public IsStoragePending(): boolean {
    return this.docShell.GetMedium().lastOperation.state === "pending";
  }

  /** Toggles horizontal-ruler visibility. @returns Nothing. */
  public ToggleHorizontalRuler(): void {
    this.chromePreferences.ToggleHorizontalRuler();
  }

  /** Toggles sidebar visibility. @returns Nothing. */
  public ToggleSidebar(): void {
    this.chromePreferences.ToggleSidebar();
  }

  /** Toggles status-bar visibility. @returns Nothing. */
  public ToggleStatusBar(): void {
    this.chromePreferences.ToggleStatusBar();
  }

  /** Releases view, dispatcher, and document-shell subscriptions at explicit session close. @returns Nothing. */
  public Close(): void {
    this.wrtShellSubscription();
    this.dispatcherSubscription?.();
    this.frame?.CloseView();
    this.frame = undefined;
    this.wrtShell.Close();
    this.docShell.Close();
    this.listeners.clear();
  }

  /** Returns the attached active frame dispatcher or throws for invalid construction order. @returns SfxDispatcher. */
  private GetDispatcher(): SfxDispatcher {
    if (this.frame === undefined) throw new Error("SwView is not attached to an OfficeFrame.");
    return this.frame.GetDispatcher();
  }

  /** Invalidates command state through the frame dispatcher. @param dependencies - Changed state labels. @returns Nothing. */
  private Invalidate(...dependencies: readonly string[]): void {
    if (this.frame === undefined) {
      this.cachedSnapshot = undefined;
      return;
    }
    this.GetDispatcher().Invalidate(...dependencies);
  }

  /** Clears the cached snapshot and publishes external-store invalidation. @returns Nothing. */
  private PublishSnapshotInvalidation(): void {
    this.cachedSnapshot = undefined;
    for (const listener of this.listeners) listener();
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
