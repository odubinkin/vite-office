/** @fileoverview Browser hosts for sheet-workflow modal requests. */
import type { CalcSheetWorkflows } from "../workflows/calc-sheet-workflows";
import { ScMetricInputDlg } from "./ScMetricInputDlg";
import { ScSheetTabDialog } from "./ScSheetTabDialog";
import { ScPageStyleDlg } from "./pagedlg/ScPageStyleDlg";
import { ScGoToTabDlg } from "./ScGoToTabDlg";

/** Requests from the existing native sheet workflow controllers. */
interface CalcSheetDialogsProps {
  readonly sheetWorkflows: CalcSheetWorkflows;
  readonly widthDialog: ReturnType<CalcSheetWorkflows["metricDialogs"]["GetSnapshot"]>;
  readonly tabDialog: ReturnType<CalcSheetWorkflows["tabDialogs"]["GetSnapshot"]>;
  readonly pageStyleDialog: ReturnType<CalcSheetWorkflows["pageStyleDialogs"]["GetSnapshot"]>;
  readonly sheetDialog: ReturnType<CalcSheetWorkflows["dialogs"]["GetSnapshot"]>;
}

/** Mounts the currently active source sheet modal. @param props - Source requests. @returns Dialog hosts. */
export function CalcSheetDialogs({
  sheetWorkflows,
  widthDialog,
  pageStyleDialog,
  tabDialog,
  sheetDialog,
}: CalcSheetDialogsProps): React.JSX.Element {
  return (
    <>
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
