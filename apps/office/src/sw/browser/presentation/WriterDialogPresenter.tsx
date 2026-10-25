/** @fileoverview Presents actual shell-owned Writer dialog requests without adding another dialog model or controller. */
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
      {request?.request.kind !== "page-style" ? null : (
        <WriterPageStyleDialog
          key={request.id}
          unit={unit}
          initialValue={request.request.initialValue}
          onCancel={
            /** Cancels the exact Page Style request and returns document focus. @returns Nothing. */ () => {
              controller.Cancel(request.id);
              focusDocument();
            }
          }
          onSubmit={
            /** Completes the exact Page Style request. @param pageDescriptor - Accepted geometry. @returns Nothing. */ (
              pageDescriptor,
            ) => {
              controller.Complete(request.id, { pageDescriptor });
              focusDocument();
            }
          }
        />
      )}
    </>
  );
}
