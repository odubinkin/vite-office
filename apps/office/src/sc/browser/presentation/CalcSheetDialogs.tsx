/** @fileoverview Browser hosts for sheet-workflow modal requests. */
import type { Ref } from "react";
import type { ScRange } from "../../inc/address";
import type { ScPrintReferenceInput } from "./ScPrintAreasDlg";
import { ScNameManagerDlg, ScNamePasteDlg } from "./namedlg/ScNameDialogs";
import { ScNameCreateDlg } from "./namedlg/ScNameCreateDlg";
import { ScNameDefDlg } from "./namedlg/ScNameDefDlg";
import { ScCondFormatDlg } from "./condformat/ScCondFormatDlg";
import { ScCondFormatManagerDlg } from "./condformat/ScCondFormatManagerDlg";
import type { CalcSheetWorkflows } from "../workflows/calc-sheet-workflows";
import { ScMetricInputDlg } from "./ScMetricInputDlg";
import { ScSheetTabDialog } from "./ScSheetTabDialog";
import { ScHFEditDlg } from "./pagedlg/ScHFEditDlg";
import { ScPageStyleDlg } from "./pagedlg/ScPageStyleDlg";
import { ScGoToTabDlg } from "./ScGoToTabDlg";

/** Requests from the existing native sheet workflow controllers. */
interface CalcSheetDialogsProps {
  readonly sheetWorkflows: CalcSheetWorkflows;
  readonly widthDialog: ReturnType<CalcSheetWorkflows["metricDialogs"]["GetSnapshot"]>;
  readonly tabDialog: ReturnType<CalcSheetWorkflows["tabDialogs"]["GetSnapshot"]>;
  readonly headerFooterDialog: ReturnType<CalcSheetWorkflows["headerFooterDialogs"]["GetSnapshot"]>;
  readonly pageStyleDialog: ReturnType<CalcSheetWorkflows["pageStyleDialogs"]["GetSnapshot"]>;
  readonly condEditor: ReturnType<CalcSheetWorkflows["conditionals"]["editors"]["GetSnapshot"]>;
  readonly condManager: ReturnType<CalcSheetWorkflows["conditionals"]["managers"]["GetSnapshot"]>;
  readonly nameDialog: ReturnType<CalcSheetWorkflows["nameDialogs"]["GetSnapshot"]>;
  readonly nameManager: ReturnType<CalcSheetWorkflows["nameManagerDialogs"]["GetSnapshot"]>;
  readonly createNames: ReturnType<CalcSheetWorkflows["createNamesDialogs"]["GetSnapshot"]>;
  readonly namePaste: ReturnType<CalcSheetWorkflows["namePasteDialogs"]["GetSnapshot"]>;
  readonly referenceInput: Ref<ScPrintReferenceInput>;
  readonly onReference: (owner: object, range: ScRange | undefined) => void;
  readonly sheetDialog: ReturnType<CalcSheetWorkflows["dialogs"]["GetSnapshot"]>;
}

/** Mounts the currently active source sheet modal. @param props - Source requests. @returns Dialog hosts. */
export function CalcSheetDialogs({
  sheetWorkflows,
  widthDialog,
  pageStyleDialog,
  headerFooterDialog,
  tabDialog,
  sheetDialog,
  condEditor,
  condManager,
  nameDialog,
  nameManager,
  namePaste,
  createNames,
  referenceInput,
  onReference,
}: CalcSheetDialogsProps): React.JSX.Element {
  return (
    <>
      {createNames && (
        <ScNameCreateDlg
          key={createNames.id}
          request={createNames.request}
          onCancel={() => sheetWorkflows.createNamesDialogs.Cancel(createNames.id)}
          onRespond={(result) => sheetWorkflows.createNamesDialogs.Complete(createNames.id, result)}
        />
      )}
      {nameManager && (
        <ScNameManagerDlg
          key={nameManager.id}
          model={nameManager.request}
          referenceInput={referenceInput}
          onReference={(range) => onReference(nameManager, range)}
          onCancel={() => sheetWorkflows.nameManagerDialogs.Cancel(nameManager.id)}
          onRespond={(result) => sheetWorkflows.nameManagerDialogs.Complete(nameManager.id, result)}
        />
      )}
      {namePaste && (
        <ScNamePasteDlg
          key={namePaste.id}
          rows={namePaste.request}
          onCancel={() => sheetWorkflows.namePasteDialogs.Cancel(namePaste.id)}
          onRespond={(result) => sheetWorkflows.namePasteDialogs.Complete(namePaste.id, result)}
        />
      )}
      {nameDialog && (
        <ScNameDefDlg
          key={nameDialog.id}
          model={nameDialog.request}
          referenceInput={referenceInput}
          onReference={(range) => onReference(nameDialog, range)}
          onCancel={() => sheetWorkflows.nameDialogs.Cancel(nameDialog.id)}
          onAdd={(data) => sheetWorkflows.AddName(nameDialog.id, data)}
        />
      )}
      {condManager && (
        <ScCondFormatManagerDlg
          key={condManager.id}
          model={condManager.request}
          onCancel={() => sheetWorkflows.conditionals.managers.Cancel(condManager.id)}
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
          onCancel={() => sheetWorkflows.conditionals.editors.Cancel(condEditor.id)}
          onSubmit={(result) => sheetWorkflows.conditionals.editors.Complete(condEditor.id, result)}
        />
      )}
      {headerFooterDialog && (
        <ScHFEditDlg
          key={headerFooterDialog.id}
          model={headerFooterDialog.request}
          onCancel={() => sheetWorkflows.headerFooterDialogs.Cancel(headerFooterDialog.id)}
          onSubmit={(result) =>
            sheetWorkflows.headerFooterDialogs.Complete(headerFooterDialog.id, result)
          }
        />
      )}
      {pageStyleDialog && (
        <ScPageStyleDlg
          key={pageStyleDialog.id}
          model={pageStyleDialog.request}
          onCancel={() => sheetWorkflows.pageStyleDialogs.Cancel(pageStyleDialog.id)}
          onSubmit={(result) =>
            sheetWorkflows.pageStyleDialogs.Complete(pageStyleDialog.id, result)
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
    </>
  );
}
