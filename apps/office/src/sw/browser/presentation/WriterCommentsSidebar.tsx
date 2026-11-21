/** @fileoverview Browser comment cards registered with the view's native annotation manager. */
import { useLayoutEffect, useRef } from "react";
import type { SwFormatField } from "../../inc/fmtfld";
import { RES_TXTATR_ANNOTATION } from "../../inc/hintids";
import { SwPosition } from "../../source/core/crsr/pam";
import type { SwView } from "../../source/uibase/uiview/view";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import { WriterCommentEditor } from "./writer-comment-editor";

/** One anchored comment card and its mounted editor. @param props - Field and owning view. @returns Comment card. */
function WriterCommentCard({
  format,
  view,
  focusDocument,
  visible,
}: {
  readonly format: SwFormatField;
  readonly focusDocument: () => void;
  readonly view: SwView;
  readonly visible: boolean;
}) {
  const input = useRef<HTMLDivElement>(null);
  const editor = useRef<WriterCommentEditor | null>(null);
  const localization = useBrowserLocalization();
  const field = format.GetField();
  const data = field.GetData();
  const noteLabel = localization.GetText("writer.comments.comment", "Comment");
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
          return input.current?.ownerDocument.activeElement === input.current;
        },
        GrabFocusToDocument: focusDocument,
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
    <article hidden={!visible} className="rounded border border-amber-300 bg-amber-50 p-2">
      {data.author && <div className="mb-1 text-sm font-medium text-slate-800">{data.author}</div>}
      {field.IsResolved() && (
        <div className="text-xs text-slate-600">
          {localization.GetText("writer.comments.resolved", "Resolved")}
        </div>
      )}
      <div
        ref={input}
        aria-label={data.author ? `${noteLabel} — ${data.author}` : noteLabel}
        className="min-h-16 w-full whitespace-pre-wrap break-words rounded border border-transparent bg-transparent p-1 text-sm text-slate-900 outline-offset-1 focus:border-amber-400"
        data-writer-editing-host="annotation"
        role="textbox"
        aria-multiline="true"
        aria-readonly={view.GetWrtShell().GetViewOptions().IsReadonly()}
        contentEditable={!view.GetWrtShell().GetViewOptions().IsReadonly()}
        tabIndex={0}
        onFocus={
          /** Activates the model anchor when the user focuses the comment editor. @returns Nothing. */ () => {
            const hint = format.GetTextField();
            const node = hint?.GetTextNode();
            if (!hint || !node || !view.GetPostItMgr().SetActiveSidebarWin(format)) return;
            const anchor = new SwPosition(node, hint.GetStart());
            try {
              view.GetWrtShell().SetCursor(anchor);
            } finally {
              anchor.Dispose();
            }
          }
        }
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
      {comments.map(
        /** Mounts the annotation editor for the original anchored field. @param format - Actual field format. @returns Note. */ (
          format,
        ) => (
          <WriterCommentCard
            key={format.GetField().GetPostItId()}
            format={format}
            view={view}
            focusDocument={focusDocument}
            visible={manager.IsVisible(format)}
          />
        ),
      )}
    </aside>
  );
}
