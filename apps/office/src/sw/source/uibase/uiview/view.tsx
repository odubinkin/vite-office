/**
 * @fileoverview Renders the Writer view as a React projection of a persistent SwView session.
 */

import { useCallback, useSyncExternalStore } from "react";

import type { WriterParagraphTextRange } from "../../core/doc/DocumentContentOperationsManager";
import type {
  WriterCharacterFormat,
  WriterParagraphAlignment,
  WriterParagraphListKind,
  WriterParagraphStyle,
} from "../../core/doc/writer";
import { readWriterClipboardPaste, createWriterClipboardSelection } from "../dochdl/swdtflvr";
import { WriterPlainTextEditor } from "../docvw/edtwin";
import { WriterWorkspaceChrome } from "../app/mainwn";
import { WriterParagraphFormattingToolbar } from "../ribbar/inputwin";
import { useWriterCommandShortcuts } from "../shells/textsh";
import { WriterParagraphProperties } from "../sidebar/WriterInspectorTextPanel";
import { getWriterCollapsedParagraphCaret, getWriterSameParagraphSelection } from "../wrtsh/select";
import { WriterMenuBar } from "../../../uiconfig/swriter/menubar/menubar";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { WriterCommandToolbar } from "../../../uiconfig/swriter/toolbar/standardbar";
import type {
  SwView,
  WriterCutCommandArguments,
  WriterPasteCommandArguments,
} from "./view-session";

/** Describes the persistent view selected by the application frame. */
export interface WriterWorkbenchProps {
  /** Whether Writer is the current suite and may receive browser shortcuts. */
  readonly isActive: boolean;
  /** Persistent Writer view created by the module composition root. */
  readonly view: SwView;
}

/**
 * Projects immutable SwView snapshots and forwards UI intent to stable command IDs.
 *
 * @param props - Active state and persistent Writer view.
 * @param props.isActive - Whether browser shortcuts may dispatch.
 * @param props.view - External-store view that outlives React remounts.
 * @returns Writer workspace presentation.
 */
export function WriterWorkbench({ isActive, view }: WriterWorkbenchProps): React.JSX.Element {
  const snapshot = useSyncExternalStore(view.Subscribe, view.GetSnapshot, view.GetSnapshot);
  const wrtShell = view.GetWrtShell();

  /** Resolves DOM-only selection data before dispatching a shell command. @param commandId - Stable Writer command. @returns Typed command arguments or undefined. */
  const resolveCommandArguments = useCallback(
    /** Resolves browser-only arguments for one command. @param commandId - Stable Writer command. @returns Adapted arguments or undefined. */
    function resolveWriterCommandArguments(commandId: string): unknown {
      const selection = globalThis.getSelection();
      if (
        commandId === WRITER_COMMAND_IDS.bold ||
        commandId === WRITER_COMMAND_IDS.italic ||
        commandId === WRITER_COMMAND_IDS.underline
      )
        return { range: getWriterSameParagraphSelection(selection) };
      if (commandId === WRITER_COMMAND_IDS.copy)
        return { selection: createWriterClipboardSelection(selection) };
      if (commandId === WRITER_COMMAND_IDS.cut) return createWriterCutCommandArguments(selection);
      if (commandId === WRITER_COMMAND_IDS.paste)
        return { range: getWriterPasteRange(selection, wrtShell.GetActiveParagraph()) };
      return undefined;
    },
    [wrtShell],
  );

  /** Executes one stable command through the frame shell stack. @param commandId - Writer command identity. @param arguments_ - Optional DOM-adapted arguments. @returns Nothing. */
  const executeCommand = useCallback(
    /** Dispatches one Writer command. @param commandId - Stable command ID. @param arguments_ - Optional adapted arguments. @returns Nothing. */
    function executeWriterCommand(commandId: string, arguments_?: unknown): void {
      view.Execute(commandId, arguments_ ?? resolveCommandArguments(commandId));
    },
    [resolveCommandArguments, view],
  );

  useWriterCommandShortcuts({
    dispatcher: view.GetViewFrame().GetDispatcher(),
    isActive,
    resolveArguments: resolveCommandArguments,
  });

  /** Maps a direct character format to its stable command identity. @param format - Requested Writer format. @returns Nothing. */
  function executeCharacterFormat(format: WriterCharacterFormat): void {
    executeCommand(
      {
        bold: WRITER_COMMAND_IDS.bold,
        italic: WRITER_COMMAND_IDS.italic,
        underline: WRITER_COMMAND_IDS.underline,
      }[format],
    );
  }

  /** Maps paragraph alignment to its stable command identity. @param alignment - Requested alignment. @returns Nothing. */
  function executeAlignment(alignment: WriterParagraphAlignment): void {
    executeCommand(
      {
        center: WRITER_COMMAND_IDS.alignCenter,
        justify: WRITER_COMMAND_IDS.alignJustify,
        left: WRITER_COMMAND_IDS.alignLeft,
        right: WRITER_COMMAND_IDS.alignRight,
      }[alignment],
    );
  }

  /** Maps paragraph style to its stable command identity. @param style - Requested style. @returns Nothing. */
  function executeStyle(style: WriterParagraphStyle): void {
    executeCommand(
      style === "default"
        ? WRITER_COMMAND_IDS.defaultParagraphStyle
        : WRITER_COMMAND_IDS.headingOne,
    );
  }

  /** Maps default-list state to its stable command identity. @param kind - Requested list kind. @returns Nothing. */
  function executeListKind(kind: WriterParagraphListKind): void {
    executeCommand(
      {
        bullet: WRITER_COMMAND_IDS.unorderedList,
        none: WRITER_COMMAND_IDS.removeBullets,
        numbered: WRITER_COMMAND_IDS.orderedList,
      }[kind],
    );
  }

  /** Maps a list-level request to its stable command identity. @param command - Promote or Demote request. @returns Nothing. */
  function executeListLevel(command: "demote" | "promote"): void {
    executeCommand(command === "demote" ? WRITER_COMMAND_IDS.demote : WRITER_COMMAND_IDS.promote);
  }

  /** Creates a UI callback that ignores presentation events and dispatches only a stable command ID. @param commandId - Stable Writer command. @returns Event-independent command callback. */
  function createCommandHandler(commandId: string): () => void {
    return /** Executes the captured command through the active view. @returns Nothing. */ function executeUiCommand(): void {
      executeCommand(commandId);
    };
  }

  /** Dispatches a native Cut after its clipboard payload was prepared. @param range - Same-paragraph selection range. @returns Nothing. */
  function executeNativeCut(range: WriterParagraphTextRange): void {
    executeCommand(WRITER_COMMAND_IDS.cut, { clipboardHandled: true, range });
  }

  /** Dispatches a native Paste after browser clipboard parsing. @param range - Replacement range. @param clipboardData - Native clipboard payload. @returns Nothing. */
  function executeNativePaste(range: WriterParagraphTextRange, clipboardData: DataTransfer): void {
    const paste = readWriterClipboardPaste(clipboardData);
    executeCommand(WRITER_COMMAND_IDS.paste, {
      clipboardHandled: true,
      range,
      ...(paste === undefined ? {} : { runs: paste.runs }),
    } satisfies WriterPasteCommandArguments);
  }

  return (
    <div hidden={!isActive}>
      <WriterWorkspaceChrome
        documentTitle={snapshot.document.document.title}
        formattingToolbar={
          <WriterParagraphFormattingToolbar
            alignment={snapshot.activeParagraph.alignment}
            characterAttributes={snapshot.pendingCharacterAttributes}
            listKind={snapshot.activeParagraph.list.kind}
            listLevel={snapshot.activeParagraph.list.level}
            onAlignmentChange={executeAlignment}
            onCharacterFormatChange={executeCharacterFormat}
            onListKindChange={executeListKind}
            onListLevelChange={executeListLevel}
            onStyleChange={executeStyle}
            style={snapshot.activeParagraph.style}
          />
        }
        isHorizontalRulerVisible={snapshot.isHorizontalRulerVisible}
        isPropertiesSidebarVisible={snapshot.isPropertiesSidebarVisible}
        isStatusBarVisible={snapshot.isStatusBarVisible}
        menuBar={
          <WriterMenuBar
            alignment={snapshot.activeParagraph.alignment}
            canRedo={view.QueryState(WRITER_COMMAND_IDS.redo).enabled}
            canUndo={view.QueryState(WRITER_COMMAND_IDS.undo).enabled}
            characterAttributes={snapshot.pendingCharacterAttributes}
            isHorizontalRulerVisible={snapshot.isHorizontalRulerVisible}
            isSidebarVisible={snapshot.isPropertiesSidebarVisible}
            isStatusBarVisible={snapshot.isStatusBarVisible}
            isStoragePending={!view.QueryState(WRITER_COMMAND_IDS.saveOdt).enabled}
            listKind={snapshot.activeParagraph.list.kind}
            listLevel={snapshot.activeParagraph.list.level}
            onAlignmentChange={executeAlignment}
            onCharacterFormatChange={executeCharacterFormat}
            onCopy={createCommandHandler(WRITER_COMMAND_IDS.copy)}
            onCut={createCommandHandler(WRITER_COMMAND_IDS.cut)}
            onDownload={createCommandHandler(WRITER_COMMAND_IDS.exportText)}
            onHorizontalRulerVisibilityChange={createCommandHandler(
              WRITER_COMMAND_IDS.toggleHorizontalRuler,
            )}
            onListKindChange={executeListKind}
            onListLevelChange={executeListLevel}
            onLoad={createCommandHandler(WRITER_COMMAND_IDS.openLocal)}
            onNew={createCommandHandler(WRITER_COMMAND_IDS.newDocument)}
            onOpenOdt={createCommandHandler(WRITER_COMMAND_IDS.openOdt)}
            onPaste={createCommandHandler(WRITER_COMMAND_IDS.paste)}
            onRedo={createCommandHandler(WRITER_COMMAND_IDS.redo)}
            onSave={createCommandHandler(WRITER_COMMAND_IDS.saveLocal)}
            onSaveOdt={createCommandHandler(WRITER_COMMAND_IDS.saveOdt)}
            onSelectAll={createCommandHandler(WRITER_COMMAND_IDS.selectAll)}
            onSidebarVisibilityChange={createCommandHandler(WRITER_COMMAND_IDS.toggleSidebar)}
            onStatusBarVisibilityChange={createCommandHandler(WRITER_COMMAND_IDS.toggleStatusBar)}
            onStyleChange={executeStyle}
            onUndo={createCommandHandler(WRITER_COMMAND_IDS.undo)}
            style={snapshot.activeParagraph.style}
          />
        }
        propertiesSidebar={
          <WriterParagraphProperties
            alignment={snapshot.activeParagraph.alignment}
            listKind={snapshot.activeParagraph.list.kind}
            paragraphNumber={snapshot.activeParagraphIndex + 1}
            style={snapshot.activeParagraph.style}
          />
        }
        status={snapshot.storageStatus}
        toolbar={
          <WriterCommandToolbar
            canRedo={view.QueryState(WRITER_COMMAND_IDS.redo).enabled}
            canUndo={view.QueryState(WRITER_COMMAND_IDS.undo).enabled}
            isStoragePending={!view.QueryState(WRITER_COMMAND_IDS.saveOdt).enabled}
            onCopy={createCommandHandler(WRITER_COMMAND_IDS.copy)}
            onCut={createCommandHandler(WRITER_COMMAND_IDS.cut)}
            onOpenOdt={createCommandHandler(WRITER_COMMAND_IDS.openOdt)}
            onPaste={createCommandHandler(WRITER_COMMAND_IDS.paste)}
            onRedo={createCommandHandler(WRITER_COMMAND_IDS.redo)}
            onSaveOdt={createCommandHandler(WRITER_COMMAND_IDS.saveOdt)}
            onUndo={createCommandHandler(WRITER_COMMAND_IDS.undo)}
          />
        }
      >
        <WriterPlainTextEditor
          activeParagraphId={snapshot.activeParagraph.id}
          focusParagraphId={snapshot.focusParagraphId}
          focusParagraphOffset={snapshot.focusParagraphOffset}
          focusRequestId={snapshot.focusRequestId}
          onParagraphBreak={wrtShell.SplitParagraph.bind(wrtShell)}
          onParagraphFocus={wrtShell.SetCursor.bind(wrtShell)}
          onParagraphMerge={wrtShell.MergeParagraphWithPrevious.bind(wrtShell)}
          onParagraphMergeNext={wrtShell.MergeParagraphWithNext.bind(wrtShell)}
          onSelectAll={createCommandHandler(WRITER_COMMAND_IDS.selectAll)}
          onTextChange={wrtShell.InsertText.bind(wrtShell)}
          onTextCut={executeNativeCut}
          onTextPaste={executeNativePaste}
          paragraphs={snapshot.document.paragraphs}
          selectAllRequestId={snapshot.selectAllRequestId}
        />
      </WriterWorkspaceChrome>
    </div>
  );
}

/** Resolves explicit Paste targeting from DOM selection or the active shell paragraph. @param selection - Current DOM selection. @param activeParagraph - Shell-selected fallback paragraph. @returns Same-paragraph model range. */
function getWriterPasteRange(
  selection: Selection | null,
  activeParagraph: Readonly<{ id: string; text: string }>,
): WriterParagraphTextRange {
  const selectedRange = getWriterSameParagraphSelection(selection);
  if (selectedRange !== undefined) return selectedRange;
  const caret = getWriterCollapsedParagraphCaret(selection);
  return caret === undefined
    ? {
        end: activeParagraph.text.length,
        paragraphId: activeParagraph.id,
        start: activeParagraph.text.length,
      }
    : { end: caret.offset, paragraphId: caret.paragraphId, start: caret.offset };
}

/** Creates exact-optional Cut arguments from the browser selection. @param selection - Current DOM selection. @returns Sanitized command arguments. */
function createWriterCutCommandArguments(selection: Selection | null): WriterCutCommandArguments {
  const range = getWriterSameParagraphSelection(selection);
  const clipboardSelection = createWriterClipboardSelection(selection);
  return {
    ...(range === undefined ? {} : { range }),
    ...(clipboardSelection === undefined ? {} : { selection: clipboardSelection }),
  };
}
