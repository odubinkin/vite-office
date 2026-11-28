/** @fileoverview Browser hosts for sheet-workflow modal requests. */
import { ScAttrDlg } from "./attrdlg/ScAttrDlg";
import { ScImportAsciiDlg } from "./ScImportAsciiDlg";
import { ScPasteConfirmationDlg } from "./ScPasteConfirmationDlg";
import { ScInsertContentsDlg } from "./ScInsertContentsDlg";
import { ScClipboardFormatDlg } from "./ScClipboardFormatDlg";
import type { Ref } from "react";
import type { ScRange } from "../../inc/address";
import { ScPrintAreasDlg, type ScPrintReferenceInput } from "./ScPrintAreasDlg";
import { ScNameManagerDlg, ScNamePasteDlg } from "./namedlg/ScNameDialogs";
import { ScNameCreateDlg } from "./namedlg/ScNameCreateDlg";
import { ScColRowNameRangesDlg } from "./namedlg/ScColRowNameRangesDlg";
import { ScCalcOptionsDialog } from "./optdlg/ScCalcOptionsDialog";
import { ScNameDefDlg } from "./namedlg/ScNameDefDlg";
import { ScCondFormatDlg } from "./condformat/ScCondFormatDlg";
import { ScCondFormatManagerDlg } from "./condformat/ScCondFormatManagerDlg";
import type { CalcSheetWorkflows } from "../workflows/calc-sheet-workflows";
import { ScMetricInputDlg } from "./ScMetricInputDlg";
import { ScSheetTabDialog } from "./ScSheetTabDialog";
import { ScHFEditDlg } from "./pagedlg/ScHFEditDlg";
import { ScPageStyleDlg } from "./pagedlg/ScPageStyleDlg";
import { ScGoToTabDlg } from "./ScGoToTabDlg";
import { ScProtectSheetDialog } from "./ScProtectSheetDialog";
import { ScMergeCellsDialog } from "./ScMergeCellsDialog";

/** Requests from the existing native sheet workflow controllers. */
interface CalcSheetDialogsProps {
  readonly sheetWorkflows: CalcSheetWorkflows;
  readonly widthDialog: ReturnType<CalcSheetWorkflows["metricDialogs"]["GetSnapshot"]>;
  readonly tabDialog: ReturnType<CalcSheetWorkflows["tabDialogs"]["GetSnapshot"]>;
  readonly headerFooterDialog: ReturnType<
    CalcSheetWorkflows["pageStyles"]["headerFooterDialogs"]["GetSnapshot"]
  >;
  readonly cellFormat: ReturnType<CalcSheetWorkflows["cellFormat"]["dialogs"]["GetSnapshot"]>;
  readonly pageStyleDialog: ReturnType<
    CalcSheetWorkflows["pageStyles"]["pageStyleDialogs"]["GetSnapshot"]
  >;
  readonly protectionDialog: ReturnType<CalcSheetWorkflows["protection"]["dialogs"]["GetSnapshot"]>;
  readonly mergeDialog: ReturnType<CalcSheetWorkflows["merge"]["dialogs"]["GetSnapshot"]>;
  readonly condEditor: ReturnType<CalcSheetWorkflows["conditionals"]["editors"]["GetSnapshot"]>;
  readonly condManager: ReturnType<CalcSheetWorkflows["conditionals"]["managers"]["GetSnapshot"]>;
  readonly nameDialog: ReturnType<CalcSheetWorkflows["nameDialogs"]["GetSnapshot"]>;
  readonly nameManager: ReturnType<CalcSheetWorkflows["nameManagerDialogs"]["GetSnapshot"]>;
  readonly createNames: ReturnType<CalcSheetWorkflows["createNamesDialogs"]["GetSnapshot"]>;
  readonly namePaste: ReturnType<CalcSheetWorkflows["namePasteDialogs"]["GetSnapshot"]>;
  readonly labelRanges: ReturnType<CalcSheetWorkflows["labelRanges"]["dialogs"]["GetSnapshot"]>;
  readonly printDialog: ReturnType<CalcSheetWorkflows["printDialogs"]["GetSnapshot"]>;
  readonly pasteText: ReturnType<CalcSheetWorkflows["clipboard"]["dialogs"]["GetSnapshot"]>;
  readonly optionsDialog: ReturnType<CalcSheetWorkflows["options"]["dialogs"]["GetSnapshot"]>;
  readonly referenceInput: Ref<ScPrintReferenceInput>;
  readonly onReference: (owner: object, range: ScRange | undefined) => void;
  readonly sheetDialog: ReturnType<CalcSheetWorkflows["dialogs"]["GetSnapshot"]>;
}

/** Mounts the currently active source sheet modal. @param props - Source requests. @returns Dialog hosts. */
export function CalcSheetDialogs({
  sheetWorkflows,
  widthDialog,
  pageStyleDialog,
  cellFormat,
  headerFooterDialog,
  mergeDialog,
  protectionDialog,
  tabDialog,
  sheetDialog,
  condEditor,
  condManager,
  nameDialog,
  nameManager,
  namePaste,
  createNames,
  labelRanges,
  optionsDialog,
  pasteText,
  printDialog,
  referenceInput,
  onReference,
}: CalcSheetDialogsProps): React.JSX.Element {
  return (
    <>
      {protectionDialog && (
        <ScProtectSheetDialog
          key={protectionDialog.id}
          request={protectionDialog.request}
          onCancel={
            /** Cancels the current protection dialog. @returns Whether the request was still active. */ () =>
              sheetWorkflows.protection.dialogs.Cancel(protectionDialog.id)
          }
          onSubmit={
            /** Completes the current protection dialog. @param result - Accepted dialog values. @returns Whether the request was still active. */ (
              result,
            ) => sheetWorkflows.protection.dialogs.Complete(protectionDialog.id, result)
          }
        />
      )}
      {mergeDialog && (
        <ScMergeCellsDialog
          key={mergeDialog.id}
          model={mergeDialog.request}
          onCancel={
            /** Cancels the current merge dialog. @returns Whether the request was still active. */ () =>
              sheetWorkflows.merge.dialogs.Cancel(mergeDialog.id)
          }
          onSubmit={
            /** Completes the current merge dialog. @param result - Accepted dialog values. @returns Whether the request was still active. */ (
              result,
            ) => sheetWorkflows.merge.dialogs.Complete(mergeDialog.id, result)
          }
        />
      )}
      {pasteText?.request.kind === "text" && (
        <ScImportAsciiDlg
          key={pasteText.id}
          request={pasteText.request}
          onRespond={(value) => sheetWorkflows.clipboard.dialogs.Complete(pasteText.id, value)}
        />
      )}
      {pasteText?.request.kind === "special" && (
        <ScInsertContentsDlg
          key={pasteText.id}
          initial={pasteText.request.initial}
          onRespond={(value) => sheetWorkflows.clipboard.dialogs.Complete(pasteText.id, value)}
        />
      )}
      {pasteText?.request.kind === "format" && (
        <ScClipboardFormatDlg
          key={pasteText.id}
          onAccept={
            /** Completes the current clipboard dialog. @param value - Accepted dialog values. @returns Whether the request was still active. */ (
              value,
            ) => sheetWorkflows.clipboard.dialogs.Complete(pasteText.id, value)
          }
          onCancel={
            /** Cancels the current clipboard dialog. @returns Whether the request was still active. */ () =>
              sheetWorkflows.clipboard.dialogs.Cancel(pasteText.id)
          }
        />
      )}
      {(pasteText?.request.kind === "replace" || pasteText?.request.kind === "larger") && (
        <ScPasteConfirmationDlg
          key={pasteText.id}
          kind={pasteText.request.kind}
          onRespond={(value) => sheetWorkflows.clipboard.dialogs.Complete(pasteText.id, value)}
        />
      )}
      {optionsDialog && (
        <ScCalcOptionsDialog
          key={optionsDialog.id}
          {...optionsDialog.request}
          onCancel={
            /** Cancels the current options dialog. @returns Whether the request was still active. */ () =>
              sheetWorkflows.options.dialogs.Cancel(optionsDialog.id)
          }
          onAccept={() => sheetWorkflows.options.dialogs.Complete(optionsDialog.id, true)}
        />
      )}
      {labelRanges && (
        <ScColRowNameRangesDlg
          key={labelRanges.id}
          model={labelRanges.request}
          referenceInput={referenceInput}
          onReference={(range) => onReference(labelRanges, range)}
          onCancel={
            /** Cancels the current label ranges dialog. @returns Whether the request was still active. */ () =>
              sheetWorkflows.labelRanges.dialogs.Cancel(labelRanges.id)
          }
          onAccept={() => sheetWorkflows.labelRanges.dialogs.Complete(labelRanges.id, true)}
        />
      )}
      {createNames && (
        <ScNameCreateDlg
          key={createNames.id}
          request={createNames.request}
          onCancel={
            /** Cancels the open create names dialog. @returns Whether the request was still active. */ () =>
              sheetWorkflows.createNamesDialogs.Cancel(createNames.id)
          }
          onRespond={(result) => sheetWorkflows.createNamesDialogs.Complete(createNames.id, result)}
        />
      )}
      {nameManager && (
        <ScNameManagerDlg
          key={nameManager.id}
          model={nameManager.request}
          referenceInput={referenceInput}
          onReference={(range) => onReference(nameManager, range)}
          onCancel={
            /** Cancels the open name manager. @returns Whether the request was still active. */ () =>
              sheetWorkflows.nameManagerDialogs.Cancel(nameManager.id)
          }
          onRespond={(result) => sheetWorkflows.nameManagerDialogs.Complete(nameManager.id, result)}
        />
      )}
      {namePaste && (
        <ScNamePasteDlg
          key={namePaste.id}
          rows={namePaste.request}
          onCancel={
            /** Cancels the open name paste dialog. @returns Whether the request was still active. */ () =>
              sheetWorkflows.namePasteDialogs.Cancel(namePaste.id)
          }
          onRespond={(result) => sheetWorkflows.namePasteDialogs.Complete(namePaste.id, result)}
        />
      )}
      {nameDialog && (
        <ScNameDefDlg
          key={nameDialog.id}
          model={nameDialog.request}
          referenceInput={referenceInput}
          onReference={(range) => onReference(nameDialog, range)}
          onCancel={
            /** Cancels the open name definition dialog. @returns Whether the request was still active. */ () =>
              sheetWorkflows.nameDialogs.Cancel(nameDialog.id)
          }
          onAdd={(data) => sheetWorkflows.AddName(nameDialog.id, data)}
        />
      )}
      {condManager && (
        <ScCondFormatManagerDlg
          key={condManager.id}
          model={condManager.request}
          onCancel={
            /** Cancels the current conditionals dialog. @returns Whether the request was still active. */ () =>
              sheetWorkflows.conditionals.managers.Cancel(condManager.id)
          }
          onResponse={(result) =>
            sheetWorkflows.conditionals.managers.Complete(condManager.id, result)
          }
        />
      )}
      {condEditor && (
        <ScCondFormatDlg
          key={condEditor.id}
          model={condEditor.request}
          referenceInput={referenceInput}
          onReference={(range) => onReference(condEditor, range)}
          onCancel={
            /** Cancels the current conditionals dialog. @returns Whether the request was still active. */ () =>
              sheetWorkflows.conditionals.editors.Cancel(condEditor.id)
          }
          onSubmit={
            /** Completes the current conditionals dialog. @param result - Accepted dialog values. @returns Whether the request was still active. */ (
              result,
            ) => sheetWorkflows.conditionals.editors.Complete(condEditor.id, result)
          }
        />
      )}
      {headerFooterDialog && (
        <ScHFEditDlg
          key={headerFooterDialog.id}
          model={headerFooterDialog.request}
          onCancel={
            /** Cancels the current page styles dialog. @returns Whether the request was still active. */ () =>
              sheetWorkflows.pageStyles.headerFooterDialogs.Cancel(headerFooterDialog.id)
          }
          onSubmit={
            /** Completes the current page styles dialog. @param result - Accepted dialog values. @returns Whether the request was still active. */ (
              result,
            ) =>
              sheetWorkflows.pageStyles.headerFooterDialogs.Complete(headerFooterDialog.id, result)
          }
        />
      )}
      {cellFormat && (
        <ScAttrDlg
          key={cellFormat.id}
          model={cellFormat.request}
          onCancel={
            /** Cancels the active Format Cells request. @returns Nothing. */
            () => sheetWorkflows.cellFormat.dialogs.Cancel(cellFormat.id)
          }
          onSubmit={
            /** Completes the active Format Cells request. @param result - Staged native items. @returns Nothing. */
            (result) => sheetWorkflows.cellFormat.dialogs.Complete(cellFormat.id, result)
          }
        />
      )}
      {pageStyleDialog && (
        <ScPageStyleDlg
          key={pageStyleDialog.id}
          model={pageStyleDialog.request}
          onCancel={
            /** Cancels the current page styles dialog. @returns Whether the request was still active. */ () =>
              sheetWorkflows.pageStyles.pageStyleDialogs.Cancel(pageStyleDialog.id)
          }
          onSubmit={
            /** Completes the current page styles dialog. @param result - Accepted dialog values. @returns Whether the request was still active. */ (
              result,
            ) => sheetWorkflows.pageStyles.pageStyleDialogs.Complete(pageStyleDialog.id, result)
          }
        />
      )}
      {widthDialog === undefined ? null : (
        <ScMetricInputDlg
          key={widthDialog.id}
          model={widthDialog.request}
          onCancel={
            /** Cancels native width request and restores actual grid focus. @returns Nothing. */ () => {
              sheetWorkflows.metricDialogs.Cancel(widthDialog.id);
            }
          }
          onSubmit={
            /** Returns integral native twips to the originating command. @param twips - Native result. @returns Nothing. */ (
              twips,
            ) => {
              sheetWorkflows.metricDialogs.Complete(widthDialog.id, twips);
            }
          }
        />
      )}
      {tabDialog === undefined ? null : (
        <ScSheetTabDialog
          key={tabDialog.id}
          model={tabDialog.request}
          onCancel={
            /** Cancels the active tab request. @returns Nothing. */
            () => {
              sheetWorkflows.tabDialogs.Cancel(tabDialog.id);
            }
          }
          onSubmit={
            /** Accepts the active tab request. @param value - Native widget selection. @returns Nothing. */
            (value) => {
              sheetWorkflows.tabDialogs.Complete(tabDialog.id, value);
            }
          }
        />
      )}
      {sheetDialog === undefined ? null : (
        <ScGoToTabDlg
          key={sheetDialog.id}
          {...sheetDialog.request}
          onCancel={
            /** Cancels only this native dialog and restores document focus. @returns Nothing. */ () => {
              sheetWorkflows.dialogs.Cancel(sheetDialog.id);
            }
          }
          onSubmit={
            /** Returns native selected name to the originating async slot. @param name - Dialog result. @returns Nothing. */ (
              name,
            ) => {
              sheetWorkflows.dialogs.Complete(sheetDialog.id, name);
            }
          }
        />
      )}
      {printDialog && (
        <ScPrintAreasDlg
          key={printDialog.id}
          model={printDialog.request}
          referenceInput={referenceInput}
          onReference={
            /** Keeps the print dialog as the range reference owner. @param range - Picked sheet range. @returns Nothing. */ (
              range,
            ) => onReference(printDialog, range)
          }
          onCancel={
            /** Cancels the open print range dialog. @returns Whether the request was still active. */ () =>
              sheetWorkflows.printDialogs.Cancel(printDialog.id)
          }
          onSubmit={
            /** Completes the open print range dialog. @param request - Accepted dialog values. @returns Whether the request was still active. */ (
              request,
            ) => sheetWorkflows.printDialogs.Complete(printDialog.id, request)
          }
        />
      )}
    </>
  );
}
