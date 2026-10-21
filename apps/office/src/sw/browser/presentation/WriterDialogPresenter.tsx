/** @fileoverview Presents actual shell-owned Writer dialog requests without adding another dialog model or controller. */
import type {
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
}: Readonly<{
  controller: WriterDialogController;
  request: WriterDialogSnapshot;
  unit: FieldUnit;
}>): React.JSX.Element {
  return (
    <>
      {request?.request.kind !== "hyperlink" ? null : (
        <WriterHyperlinkDialog
          {...(request.request.initialHyperlink === undefined
            ? {}
            : { initialHyperlink: request.request.initialHyperlink })}
          onCancel={
            /** Cancels the exact shell-owned dialog request. @returns Nothing. */ () => {
              controller.Cancel(request.id);
            }
          }
          onSubmit={
            /** Completes the exact shell-owned dialog request. @param hyperlink - Link metadata. @param text - Optional inserted text. @returns Nothing. */
            (hyperlink, text) => {
              controller.Complete(request.id, {
                hyperlink,
                text,
              });
            }
          }
        />
      )}
      {request?.request.kind !== "bookmark" ? null : (
        <WriterBookmarkDialog
          names={request.request.names}
          {...(request.request.selectedName === undefined
            ? {}
            : { selectedName: request.request.selectedName })}
          onCancel={
            /** Cancels the bookmark request. @returns Nothing. */
            () => {
              controller.Cancel(request.id);
            }
          }
          onSubmit={
            /** Applies one bookmark choice. @param result - Accepted operation. @returns Nothing. */
            (result) => {
              controller.Complete(request.id, result);
            }
          }
        />
      )}
      {request?.request.kind !== "insert-break" ? null : (
        <WriterInsertBreakDialog
          onCancel={
            /** Cancels Insert Break. @returns Nothing. */
            () => {
              controller.Cancel(request.id);
            }
          }
          onSubmit={
            /** Inserts a hard page break. @returns Nothing. */
            () => {
              controller.Complete(request.id, { breakKind: "page" });
            }
          }
        />
      )}
      {request?.request.kind !== "page-style" ? null : (
        <WriterPageStyleDialog
          unit={unit}
          initialValue={request.request.initialValue}
          onCancel={
            /** Cancels the exact Page Style request. @returns Nothing. */ () =>
              controller.Cancel(request.id)
          }
          onSubmit={
            /** Completes the exact Page Style request. @param pageDescriptor - Accepted geometry. @returns Nothing. */ (
              pageDescriptor,
            ) => {
              controller.Complete(request.id, { pageDescriptor });
            }
          }
        />
      )}
    </>
  );
}
