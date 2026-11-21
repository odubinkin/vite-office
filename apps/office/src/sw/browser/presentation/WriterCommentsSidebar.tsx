/** @fileoverview Browser comment cards registered with the view's native annotation manager. */
import { useLayoutEffect, useRef } from "react";
import type { SwFormatField } from "../../inc/fmtfld";
import { RES_TXTATR_ANNOTATION } from "../../inc/hintids";
import type { SwDoc } from "../../source/core/doc/doc";
import type { SwView } from "../../source/uibase/uiview/view";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import { WriterCommentEditor } from "./writer-comment-editor";

/** One anchored comment card and its mounted editor. @param props - Field and owning view. @returns Comment card. */
function WriterCommentCard({
  format,
  view,
}: {
  readonly format: SwFormatField;
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

/** Renders sidebar notes in their model-anchor order when the document contains annotations. @param document - Current Writer model. @param view - The model's active view. @returns Sidebar or undefined. */
export function RenderWriterComments(document: SwDoc, view: SwView): React.JSX.Element | undefined {
  const comments: SwFormatField[] = [];
  for (const node of document.GetNodes().entries()) {
    const hints = node.GetTextNode()?.GetpSwpHints();
    if (!hints) continue;
    for (
      let index = hints.GetFirstPosSortedByWhichAndStart(RES_TXTATR_ANNOTATION);
      index < hints.Count();
      index++
    ) {
      const hint = hints.GetSortedByWhichAndStart(index);
      if (hint.Which() !== RES_TXTATR_ANNOTATION) break;
      const format = hints.GetTextAttrForCharAt(hint.GetStart(), RES_TXTATR_ANNOTATION)?.GetAttr();
      if (format) comments.push(format);
    }
  }
  if (comments.length === 0) return undefined;
  return (
    <aside aria-label="Comments" className="sticky top-0 w-64 shrink-0 space-y-2 px-2">
      {comments.map(
        /** Mounts the annotation editor for the original anchored field. @param format - Actual field format. @returns Note. */ (
          format,
        ) => (
          <WriterCommentCard key={format.GetField().GetData().id} format={format} view={view} />
        ),
      )}
    </aside>
  );
}
