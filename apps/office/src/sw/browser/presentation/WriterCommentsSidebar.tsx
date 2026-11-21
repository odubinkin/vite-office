/** @fileoverview Browser comment cards registered with the view's native annotation manager. */
import { useLayoutEffect, useRef } from "react";
import { Ellipsis } from "lucide-react";
import type { SwFormatField } from "../../inc/fmtfld";
import { RES_TXTATR_ANNOTATION } from "../../inc/hintids";
import { SwPosition } from "../../source/core/crsr/pam";
import type { SwView } from "../../source/uibase/uiview/view";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import { useToolboxPopup } from "../../../svx/browser/tbxctrls/use-toolbox-popup";
import { WriterCommentEditor } from "./writer-comment-editor";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";

/** One anchored comment card and its mounted editor. @param props - Field and owning view. @returns Comment card. */
function WriterCommentCard({
  format,
  view,
  focusDocument,
  visible,
  threadResolved,
}: {
  readonly format: SwFormatField;
  readonly focusDocument: () => void;
  readonly view: SwView;
  readonly visible: boolean;
  readonly threadResolved: boolean;
}) {
  const card = useRef<HTMLElement>(null);
  const input = useRef<HTMLDivElement>(null);
  const editor = useRef<WriterCommentEditor | null>(null);
  const localization = useBrowserLocalization();
  const { ref: menu, open, toggle, close } = useToolboxPopup();
  const field = format.GetField();
  const data = field.GetData();
  const readOnly = view.GetWrtShell().GetViewOptions().IsReadonly();
  const noteLabel = localization.GetText("writer.comments.comment", "Comment");
  const manager = view.GetPostItMgr();
  /** Activates this comment and places the Writer cursor at its anchor. @returns Nothing. */
  function activate(): void {
    const hint = format.GetTextField();
    const node = hint?.GetTextNode();
    if (!hint || !node || !manager.SetActiveSidebarWin(format)) return;
    const anchor = new SwPosition(node, hint.GetStart());
    try {
      view.GetWrtShell().SetCursor(anchor);
    } finally {
      anchor.Dispose();
    }
  }
  /** Dispatches a card action in its annotation shell and returns input to Writer. @param command - Command from the menu. @returns Nothing. */
  function execute(command: string): void {
    close();
    activate();
    view.Execute(command);
    manager.ClearActiveField();
    focusDocument();
  }
  useLayoutEffect(
    /** Binds this mounted text surface to its native field, edit document and comment window. @returns Release callback. */ () => {
      if (!input.current) return;
      const current = new WriterCommentEditor(
        field,
        input.current,
        view,
        /** Invalidates the active note formatting state. @returns Nothing. */ () =>
          view.GetPostItMgr().SelectionChanged(format),
      );
      editor.current = current;
      const release = view.GetPostItMgr().RegisterSidebarWin(format, {
        editor: current.getImpl(),
        view: current.GetSearchView(),
        /** Applies the shell request through the comment document and its history. @param items - Prepared edit items. @returns Whether changed. */ ApplyAttributes(
          items,
        ) {
          return current.ApplyAttributes(items);
        },
        /** Selects the entire annotation. @returns Nothing. */ SelectAll() {
          current.SelectAll();
        },
        /** Makes a continued match visible when a browser dialog owns focus. @returns Nothing. */ SearchHighlight() {
          current.MakeVisible();
        },
        /** Reveals the matched note in the browser. @returns Nothing. */ MakeVisible() {
          current.MakeVisible();
        },
        /** Checks whether this comment owns browser focus. @returns Whether focused. */ HasFocus() {
          return card.current?.contains(card.current.ownerDocument.activeElement) ?? false;
        },
        GrabFocusToDocument: focusDocument,
        /** Publishes the original resolution change through annotation history. @param value - Whether resolved. @returns Nothing. */ SetResolved(
          value,
        ) {
          current.SetResolved(value);
        },
      });
      return /** Releases the anchored editor before its text surface unmounts. @returns Nothing. */ () => {
        release();
        editor.current = null;
        current.Dispose();
      };
    },
    [field, focusDocument, format, view],
  );
  useLayoutEffect(
    /** Completes pending annotation focus after a hidden card is shown. @returns Nothing. */ () => {
      if (visible) view.GetPostItMgr().SidebarWinShown(format);
    },
    [format, view, visible],
  );
  useLayoutEffect(
    /** Synchronizes this note after Writer undoes or redoes an edit. @returns Nothing. */ () =>
      editor.current?.SyncContent(),
  );
  return (
    <article
      ref={card}
      hidden={!visible}
      className="rounded border border-amber-300 bg-amber-50 p-2"
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <div>
          {data.author && <div className="text-sm font-medium text-slate-800">{data.author}</div>}
          {field.IsResolved() && (
            <div className="text-xs text-slate-600">
              {localization.GetText("writer.comments.resolved", "Resolved")}
            </div>
          )}
        </div>
        {!readOnly && (
          <details ref={menu}>
            <summary
              aria-label={localization.GetText("writer.comments.actions", "Comment actions")}
              className="grid size-6 cursor-pointer list-none place-items-center rounded hover:bg-amber-100"
              onClick={
                /** Opens and closes the comment action popup. @param event - Summary activation. @returns Nothing. */
                (event) => {
                  event.preventDefault();
                  toggle();
                }
              }
            >
              <Ellipsis aria-hidden="true" size={16} />
            </summary>
            {open && (
              <div
                ref={
                  /** Places the mounted menu above the editor and other sidebars. @param panel - Popup element. @returns Nothing. */
                  (panel) => {
                    if (!panel?.showPopover) return;
                    panel.popover = "manual";
                    panel.showPopover();
                  }
                }
                className="inset-auto z-50 m-0 min-w-32 rounded border border-slate-300 bg-white p-1 shadow-lg"
              >
                <button
                  type="button"
                  className="w-full rounded px-2 py-1 text-left text-sm hover:bg-slate-100"
                  onClick={
                    /** Toggles resolution of the selected comment. @returns Nothing. */
                    () => execute(WRITER_COMMAND_IDS.resolveComment)
                  }
                >
                  {field.IsResolved()
                    ? localization.GetText("writer.comments.unresolve", "Unresolve")
                    : localization.GetText("writer.comments.resolve", "Resolve")}
                </button>
                <button
                  type="button"
                  className="w-full rounded px-2 py-1 text-left text-sm hover:bg-slate-100"
                  onClick={
                    /** Toggles resolution of the selected thread. @returns Nothing. */
                    () => execute(WRITER_COMMAND_IDS.resolveCommentThread)
                  }
                >
                  {threadResolved
                    ? localization.GetText("writer.comments.unresolveThread", "Unresolve Thread")
                    : localization.GetText("writer.comments.resolveThread", "Resolve Thread")}
                </button>
                {(
                  [
                    [
                      WRITER_COMMAND_IDS.deleteComment,
                      localization.GetText("writer.comments.delete", "Delete Comment"),
                    ],
                    [
                      WRITER_COMMAND_IDS.deleteCommentThread,
                      localization.GetText("writer.comments.deleteThread", "Delete Comment Thread"),
                    ],
                  ] as const
                ).map(
                  /** Renders native deletion actions in popup order. @param action - Command and its localized label. @returns Menu button. */
                  ([command, label]) => (
                    <button
                      key={command}
                      type="button"
                      className="w-full rounded px-2 py-1 text-left text-sm hover:bg-slate-100"
                      onClick={
                        /** Dispatches this deletion command. @returns Nothing. */
                        () => execute(command)
                      }
                    >
                      {label}
                    </button>
                  ),
                )}
              </div>
            )}
          </details>
        )}
      </div>
      <div
        ref={input}
        aria-label={data.author ? `${noteLabel} — ${data.author}` : noteLabel}
        className="min-h-16 w-full whitespace-pre-wrap break-words rounded border border-transparent bg-transparent p-1 text-sm text-slate-900 outline-offset-1 focus:border-amber-400"
        data-writer-editing-host="annotation"
        role="textbox"
        aria-multiline="true"
        aria-readonly={readOnly}
        contentEditable={!readOnly}
        tabIndex={0}
        onFocus={activate}
        onKeyDown={
          /** Returns to the body after the last adjacent annotation point. @param event - Sidebar key. @returns Nothing. */ (
            event,
          ) => {
            if (
              event.nativeEvent.isComposing ||
              (event.key !== "Escape" &&
                !((event.ctrlKey || event.metaKey) && ["PageUp", "PageDown"].includes(event.key)))
            ) {
              editor.current?.HandleKeyDown(event.nativeEvent);
              return;
            }
            const hint = format.GetTextField();
            const node = hint?.GetTextNode();
            if (!hint || !node) return;
            event.preventDefault();
            event.stopPropagation();
            const hints = node.GetpSwpHints();
            let offset = hint.GetStart() + 1;
            while (hints?.GetTextAttrForCharAt(offset, RES_TXTATR_ANNOTATION)) offset++;
            const position = new SwPosition(node, offset);
            try {
              view.GetPostItMgr().ClearActiveField();
              view.GetWrtShell().SetCursor(position);
              focusDocument();
            } finally {
              position.Dispose();
            }
          }
        }
        onBlur={
          /** Captures the final caret when focus moves to the modeless search dialog. @returns Nothing. */ () =>
            editor.current?.ReadSelection()
        }
        onSelect={
          /** Captures user selection for Find and Replace. @returns Nothing. */ () =>
            editor.current?.ReadSelection()
        }
      />
    </article>
  );
}

/** Renders the mounted comments in model order. @param props - Workbench-owned sidebar inputs. @returns Sidebar. */
export function WriterCommentsSidebar({
  comments,
  view,
  focusDocument,
}: {
  readonly comments: readonly SwFormatField[];
  readonly view: SwView;
  readonly focusDocument: () => void;
}): React.JSX.Element {
  const manager = view.GetPostItMgr();
  return (
    <aside
      aria-label="Comments"
      hidden={
        !comments.some(
          /** Leaves the comment column out of layout if no card is shown. @param format - Comment field. @returns Whether visible. */
          (format) => manager.IsVisible(format),
        )
      }
      className="sticky top-0 w-64 shrink-0 space-y-2 px-2"
    >
      {manager.GetThreads(comments).map(
        /** Keeps consecutive follow windows in one visual thread. @param thread - Ordered annotation fields. @returns Thread cards. */
        (thread) => {
          const resolved = thread.every(
            /** Reads the resolution of a thread member. @param format - Anchored field. @returns Whether resolved. */
            (format) => format.GetField().IsResolved(),
          );
          return (
            <div key={thread[0]?.GetField().GetPostItId()}>
              {thread.map(
                /** Mounts the annotation editor for the original anchored field. @param format - Actual field format. @returns Note. */
                (format) => (
                  <WriterCommentCard
                    key={format.GetField().GetPostItId()}
                    format={format}
                    view={view}
                    focusDocument={focusDocument}
                    visible={manager.IsVisible(format)}
                    threadResolved={resolved}
                  />
                ),
              )}
            </div>
          );
        },
      )}
    </aside>
  );
}
