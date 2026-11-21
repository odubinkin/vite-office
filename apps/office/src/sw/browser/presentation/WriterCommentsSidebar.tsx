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
}: {
  readonly format: SwFormatField;
  readonly focusDocument: () => void;
  readonly view: SwView;
}) {
  const input = useRef<HTMLTextAreaElement>(null);
  const editor = useRef<WriterCommentEditor | null>(null);
  const localization = useBrowserLocalization();
  const field = format.GetField();
  const data = field.GetData();
  const noteLabel = localization.GetText("writer.comments.comment", "Comment");
  useLayoutEffect(
    /** Binds this mounted textarea to its native field, edit document and comment window. @returns Release callback. */ () => {
      if (!input.current) return;
      const current = new WriterCommentEditor(field, input.current);
      editor.current = current;
      const release = view.GetPostItMgr().RegisterSidebarWin(format, {
        editor: current.getImpl(),
        view: current.GetSearchView(),
        /** Makes a continued match visible when a browser dialog owns focus. @returns Nothing. */ SearchHighlight() {
          current.MakeVisible();
        },
        /** Reveals the matched note in the browser. @returns Nothing. */ MakeVisible() {
          current.MakeVisible();
        },
      });
      return /** Releases the anchored editor before its textarea unmounts. @returns Nothing. */ () => {
        release();
        editor.current = null;
        current.Dispose();
      };
    },
    [field, format, view],
  );
  useLayoutEffect(
    /** Synchronizes this note after Writer undoes or redoes an edit. @returns Nothing. */ () =>
      editor.current?.SyncContent(),
  );
  return (
    <article className="rounded border border-amber-300 bg-amber-50 p-2">
      {data.author && <div className="mb-1 text-sm font-medium text-slate-800">{data.author}</div>}
      <textarea
        ref={input}
        aria-label={data.author ? `${noteLabel} — ${data.author}` : noteLabel}
        className="w-full resize-y rounded border border-transparent bg-transparent p-1 text-sm text-slate-900 outline-offset-1 focus:border-amber-400"
        defaultValue={field.GetPar2()}
        rows={3}
        readOnly={view.GetWrtShell().GetViewOptions().IsReadonly()}
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
            )
              return;
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
        onChange={
          /** Commits the native textarea edit. @returns Nothing. */ () =>
            editor.current?.ReadInput()
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
  return (
    <aside aria-label="Comments" className="sticky top-0 w-64 shrink-0 space-y-2 px-2">
      {comments.map(
        /** Mounts the annotation editor for the original anchored field. @param format - Actual field format. @returns Note. */ (
          format,
        ) => (
          <WriterCommentCard
            key={format.GetField().GetPostItId()}
            format={format}
            view={view}
            focusDocument={focusDocument}
          />
        ),
      )}
    </aside>
  );
}
