/** @fileoverview Presents actual shell-owned Writer dialog requests without adding another dialog model or controller. */
import { useId, useLayoutEffect, useRef } from "react";
import { CircleHelp } from "lucide-react";
import { WriterDialogHeader } from "./WriterDialogHeader";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import { NewStyleDialog } from "../../../sfx2/browser/presentation/NewStyleDialog";
import type {
  WriterBookmarkDialogResult,
  WriterDialogController,
  WriterDialogSnapshot,
} from "../../source/uibase/dialog/writer-dialog-controller";
import type { FieldUnit } from "../../../tools/inc/fldunit";
import { WriterHyperlinkDialog } from "./WriterHyperlinkDialog";
import { WriterBookmarkDialog } from "./WriterBookmarkDialog";
import { WriterInsertBreakDialog } from "./WriterInsertBreakDialog";
import { WriterPageStyleDialog } from "./WriterPageStyleDialog";

import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { WriterCharacterDialog } from "./WriterCharacterDialog";

/** Forwards original request identity and completion payloads;the paragraph presenter stays with its formatting controls. @param props - Actual controller,snapshot and module metric. @returns Active dialog or no dialog. */
export function WriterDialogPresenter({
  controller,
  request,
  unit,
  bookmarkNames,
  onBookmarkOperation,
  focusDocument,
}: Readonly<{
  controller: WriterDialogController;
  request: WriterDialogSnapshot;
  unit: FieldUnit;
  bookmarkNames: readonly string[];
  onBookmarkOperation: (result: WriterBookmarkDialogResult) => void;
  focusDocument: () => void;
}>): React.JSX.Element {
  const localization = useBrowserLocalization();
  const characterRequest = request?.request.kind === "character" ? request.request : undefined;
  return (
    <>
      {request?.request.kind !== "new-style" ? null : (
        <NewStyleDialog
          getText={
            /** Keeps framework localization outside the Sfx presentation module. @param key - Source string identity. @param fallback - Native English string. @returns Localized text. */
            (key, fallback) => localization.GetText(key, fallback)
          }
          header={
            <WriterDialogHeader
              title={localization.GetText("sfx.new-style.title", "New Style from Selection")}
              onClose={
                /** Cancels the actual request from shared dialog chrome. @returns Nothing. */
                () => {
                  controller.Cancel(request.id);
                }
              }
            />
          }
          key={request.id}
          names={request.request.names}
          reservedNames={request.request.reservedNames}
          onCancel={
            /** Cancels the original asynchronous document request. @returns Nothing. */
            () => {
              controller.Cancel(request.id);
            }
          }
          onSubmit={
            /** Completes with native GetName output. @param name - Accepted display name. @returns Nothing. */
            (name) => {
              controller.Complete(request.id, { name });
            }
          }
        />
      )}

      {request?.request.kind !== "hyperlink" ? null : (
        <WriterHyperlinkDialog
          key={request.id}
          {...(request.request.initialHyperlink === undefined
            ? {}
            : { initialHyperlink: request.request.initialHyperlink })}
          onCancel={
            /** Cancels the exact shell-owned dialog request and returns document focus. @returns Nothing. */ () => {
              controller.Cancel(request.id);
              focusDocument();
            }
          }
          onSubmit={
            /** Completes the exact shell-owned dialog request. @param hyperlink - Link metadata. @param text - Optional inserted text. @returns Nothing. */
            (hyperlink, text) => {
              controller.Complete(request.id, {
                hyperlink,
                text,
              });
              focusDocument();
            }
          }
        />
      )}
      {request?.request.kind !== "bookmark" ? null : (
        <WriterBookmarkDialog
          key={request.id}
          names={bookmarkNames}
          onOperation={onBookmarkOperation}
          {...(request.request.selectedName === undefined
            ? {}
            : { selectedName: request.request.selectedName })}
          onCancel={
            /** Cancels the bookmark request and returns focus to its document client. @returns Nothing. */
            () => {
              controller.Cancel(request.id);
              focusDocument();
            }
          }
          onSubmit={
            /** Applies one bookmark choice. @param result - Accepted operation. @returns Nothing. */
            (result) => {
              controller.Complete(request.id, result);
              focusDocument();
            }
          }
        />
      )}
      {request?.request.kind !== "insert-break" ? null : (
        <WriterInsertBreakDialog
          key={request.id}
          onCancel={
            /** Cancels Insert Break. @returns Nothing. */
            () => {
              controller.Cancel(request.id);
              focusDocument();
            }
          }
          onSubmit={
            /** Inserts a hard page break. @returns Nothing. */
            () => {
              controller.Complete(request.id, { breakKind: "page" });
              focusDocument();
            }
          }
        />
      )}
      {!request || !characterRequest ? null : (
        <WriterCharacterDialog
          key={request.id}
          input={characterRequest.input}
          mode={characterRequest.mode}
          unit={unit}
          initialPage={characterRequest.initialPage}
          onCancel={
            /** Cancels the request and restores the bulk command's document client. @returns Nothing. */ () => {
              controller.Cancel(request.id);
              if (
                characterRequest.mode === "standard" ||
                characterRequest.commandUrl === WRITER_COMMAND_IDS.formatAllNotes
              )
                focusDocument();
            }
          }
          onSubmit={
            /** Returns the native tab-page output set to the comment manager. @param attributes - Owned set. @returns Nothing. */
            (attributes) => {
              if (!controller.Complete(request.id, { attributes })) attributes.Dispose();
              if (
                characterRequest.mode === "standard" ||
                characterRequest.commandUrl === WRITER_COMMAND_IDS.formatAllNotes
              )
                focusDocument();
            }
          }
        />
      )}
      {request?.request.kind !== "delete-comments" ? null : (
        <WriterDeleteCommentsQuery
          key={request.id}
          author={request.request.author}
          onAnswer={
            /** Returns both the native query response and checkbox state. @param confirmed - Whether Yes was chosen. @param dontShowAgain - Common preference override. @returns Nothing. */
            (confirmed, dontShowAgain) => {
              controller.Complete(request.id, { confirmed, dontShowAgain });
              focusDocument();
            }
          }
        />
      )}
      {request?.request.kind !== "page-style" ? null : (
        <WriterPageStyleDialog
          key={request.id}
          unit={unit}
          initialValue={request.request.initialValue}
          pageInput={request.request.pageInput}
          onCancel={
            /** Cancels the exact Page Style request and returns document focus. @returns Nothing. */ () => {
              controller.Cancel(request.id);
              focusDocument();
            }
          }
          onSubmit={
            /** Completes the exact Page Style request. @param pageDescriptor - Accepted geometry. @param pageItems - Owned native fill deltas. @returns Nothing. */ (
              pageDescriptor,
              pageItems,
            ) => {
              if (
                !controller.Complete(request.id, {
                  pageDescriptor,
                  ...(pageItems && { pageItems }),
                })
              )
                pageItems?.Dispose();
              focusDocument();
            }
          }
        />
      )}
    </>
  );
}

/** Presents the pinned CUI query structure for Writer comment deletion. @param props - Author filter and answer receiver. @returns Modal question. */
function WriterDeleteCommentsQuery({
  author,
  onAnswer,
}: Readonly<{
  author: string | undefined;
  onAnswer: (confirmed: boolean, dontShowAgain: boolean) => void;
}>): React.JSX.Element {
  const localization = useBrowserLocalization();
  const titleId = useId();
  const descriptionId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const no = useRef<HTMLButtonElement>(null);
  const dontShow = useRef<HTMLInputElement>(null);
  const title = localization.GetText("writer.comments.confirmDeleteTitle", "Confirm delete");
  const description =
    author === undefined
      ? localization.GetText(
          "writer.comments.confirmDeleteAll",
          "Are you sure you want to delete all comments?",
        )
      : localization
          .GetText(
            "writer.comments.confirmDeleteAuthor",
            "Are you sure you want to delete all comments by %AUTHOR?",
          )
          .replace(
            "%AUTHOR",
            /** Substitutes the author name literally. @returns Annotation author. */ () => author,
          );
  useLayoutEffect(
    /** Opens the platform modal and places focus on No. @returns Nothing. */ () => {
      const element = dialog.current;
      if (!element) return;
      if (typeof element.showModal === "function") element.showModal();
      else element.open = true;
      no.current?.focus();
    },
    [],
  );
  /** Closes the native modal before returning the selected answer. @param confirmed - Whether Yes was chosen. @returns Nothing. */
  function answer(confirmed: boolean): void {
    const element = dialog.current;
    if (element?.open) {
      if (typeof element.close === "function") element.close();
      else element.open = false;
    }
    onAnswer(confirmed, dontShow.current?.checked === true);
  }
  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="m-auto w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-950/40"
      onCancel={
        /** Routes Escape as a negative answer. @param event - Native cancel event. @returns Nothing. */
        (event) => {
          event.preventDefault();
          answer(false);
        }
      }
    >
      <div className="writer-dialog-content grid-cols-[auto_1fr] gap-3">
        <CircleHelp className="mt-1 shrink-0 text-slate-600" aria-hidden="true" />
        <div>
          <h2 id={titleId} className="font-semibold">
            {title}
          </h2>
          <p id={descriptionId} className="mt-2 text-sm">
            {description}
          </p>
          <label className="mt-4 flex items-center gap-2 text-sm">
            <input type="checkbox" ref={dontShow} />
            {localization.GetText("cui.query-dialog.dont-show-again", "Do not show again")}
          </label>
        </div>
      </div>
      <div className="writer-dialog-actions">
        <button
          type="button"
          ref={no}
          onClick={/** Declines deletion. @returns Nothing. */ () => answer(false)}
        >
          {localization.GetText("cui.query-dialog.no", "No")}
        </button>
        <button
          type="button"
          className="writer-dialog-danger"
          onClick={/** Accepts deletion. @returns Nothing. */ () => answer(true)}
        >
          {localization.GetText("cui.query-dialog.yes", "Yes")}
        </button>
      </div>
    </dialog>
  );
}
