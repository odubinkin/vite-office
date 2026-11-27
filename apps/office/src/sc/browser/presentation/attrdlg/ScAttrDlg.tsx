/** @fileoverview Async browser presentation of the native Calc Format Cells notebook. */
import { useId, useLayoutEffect, useRef, useState } from "react";
import { DialogHeader } from "../../../../framework/browser/presentation/DialogHeader";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import {
  cellFormatPages,
  alignmentWhich,
  borderWhich,
  fontPageItems,
  fontEffectsWhich,
  type NumberFormatChange,
  type ScAttrDlg as ScAttrDlgModel,
  type ScAttrDlgResult,
} from "../../../source/ui/attrdlg/attrdlg";
import { ATTR_PROTECTION } from "../../../inc/scitems";
import { CellBordersTabPage } from "./CellBordersTabPage";
import { FontTabPage } from "./FontTabPage";
import { FontEffectsTabPage } from "./FontEffectsTabPage";
import { NumberFormatTabPage } from "./NumberFormatTabPage";
import { AreaTabPage } from "../../../../cui/browser/tabpages/AreaTabPage";
import { FillStyle } from "../../../../offapi/com/sun/star/drawing/FillStyle";
import { addRecentColor } from "../../../../svx/browser/tbxctrls/palette-manager";
import {
  AlignmentTabPage,
  AsianTypographyTabPage,
  CellProtectionTabPage,
} from "./CellAttributePages";

/** Owns the native modal's output acknowledgement. */
interface Props {
  readonly model: ScAttrDlgModel;
  readonly onCancel: () => void;
  readonly onSubmit: (result: ScAttrDlgResult) => void;
}

/** Renders admitted native pages, including per-page Reset and one effective item-set response.
 * @param props - Dialog request and completion ports.
 * @param props.model - Native snapshot and formatter.
 * @param props.onCancel - Cancels without modifying the selection.
 * @param props.onSubmit - Applies the complete staged item set.
 * @returns Format Cells dialog.
 */
export function ScAttrDlg({ model, onCancel, onSubmit }: Props): React.JSX.Element {
  const [tab, setTab] = useState(0);
  const [numbers, setNumbers] = useState<NumberFormatChange>();
  const [revision, setRevision] = useState(0);
  const [resetNumber, setResetNumber] = useState(0);
  const [resetBorder, setResetBorder] = useState(0);
  const [resetFont, setResetFont] = useState(0);
  const [resetBackground, setResetBackground] = useState(0);
  const [backgroundVisited, setBackgroundVisited] = useState(false);
  const [frameEdited, setFrameEdited] = useState(false);
  const id = useId();
  const tabs = useRef<HTMLDivElement>(null);
  useLayoutEffect(
    /** Focuses the original notebook's selected tab. @returns Nothing. */
    () => tabs.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus(),
    [tab],
  );

  /** Adopts each changed value into the single pending output set. @param items - Owned typed values. @returns Nothing. */
  function stage(items: readonly SfxPoolItem[]): void {
    for (const item of items) model.output.Put(item, true);
    setRevision(revision + 1);
  }

  /** Renders pending frame changes and leaves conversion to the source page's FillItemSet. @returns Nothing. */
  function frameChanged(): void {
    setFrameEdited(true);
    setRevision(revision + 1);
  }

  /** Exchanges the active solid Color page with the browser profile on leave or acceptance. @returns Nothing. */
  function rememberBackgroundColor(): void {
    const area = model.background.GetAreaPage();
    const color = area.GetColor();
    if (area.GetFillStyle() === FillStyle.SOLID && color)
      addRecentColor(color, area.GetColorName());
  }

  /** Opens the notebook page and records the first native Background visit. @param index - Selected page. @returns Nothing. */
  function selectTab(index: number): void {
    if (tab !== index && cellFormatPages[tab]?.[0] === "background") rememberBackgroundColor();
    if (cellFormatPages[index]?.[0] === "background") setBackgroundVisited(true);
    setTab(index);
  }

  /** Refreshes the native Area palette and preview after editing. @returns Nothing. */
  function backgroundChanged(): void {
    setRevision(revision + 1);
  }

  /** Uses the dialog's existing local Area labels. @param _key - Resource identity. @param fallback - Visible label. @returns Label. */
  function backgroundLabel(_key: string, fallback: string): string {
    return fallback;
  }

  /** Restores the active source page from its input values. @returns Nothing. */
  function reset(): void {
    switch (cellFormatPages[tab]?.[0]) {
      case "numbers":
        setNumbers(undefined);
        setResetNumber(resetNumber + 1);
        break;
      case "font":
        for (const which of fontPageItems()) model.output.ClearItem(which);
        setResetFont(resetFont + 1);
        break;
      case "fonteffects":
        for (const which of fontEffectsWhich) model.output.ClearItem(which);
        break;
      case "borders":
        for (const which of borderWhich) model.output.ClearItem(which);
        model.borders.Reset();
        setFrameEdited(false);
        setResetBorder(resetBorder + 1);
        break;
      case "alignment":
        for (const which of alignmentWhich) model.output.ClearItem(which);
        break;
      case "asiantypography":
        model.asianTypography.Reset();
        break;
      case "background":
        model.background.Reset();
        setResetBackground(resetBackground + 1);
        break;
      case "cellprotection":
        model.output.ClearItem(ATTR_PROTECTION);
        break;
    }
    setRevision(revision + 1);
  }

  const invalid = numbers !== undefined && !model.numbers.Describe(numbers.code, numbers.language);
  return (
    <div
      role="dialog"
      aria-label="Format Cells"
      aria-modal="true"
      className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
      onKeyDown={
        /** Cancels the active dialog on Escape. @param event - Browser control event. @returns Nothing. */ (
          event,
        ) => {
          if (event.key !== "Escape") return;
          event.preventDefault();
          event.stopPropagation();
          onCancel();
        }
      }
    >
      <form
        data-office-modal-panel="true"
        className="office-dialog-form flex max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={
          /** Submits the valid pending cell item set. @param event - Browser control event. @returns Nothing. */ (
            event,
          ) => {
            event.preventDefault();
            if (invalid) return;
            const items = model.output.Clone();
            if (frameEdited) model.borders.FillItemSet(items);
            if (backgroundVisited) {
              if (cellFormatPages[tab]?.[0] === "background") rememberBackgroundColor();
              model.background.FillItemSet(items);
            }
            onSubmit({ items, ...(numbers ? { format: numbers } : {}) });
          }
        }
      >
        <DialogHeader title="Format Cells" onClose={onCancel} />
        <div
          ref={tabs}
          role="tablist"
          aria-label="Format Cells tabs"
          className="flex flex-wrap gap-1 border-b border-slate-200 px-4 pt-2"
          onKeyDown={
            /** Moves between native notebook tabs using the keyboard. @param event - Browser control event. @returns Nothing. */ (
              event,
            ) => {
              const count = cellFormatPages.length;
              const next =
                event.key === "ArrowRight"
                  ? (tab + 1) % count
                  : event.key === "ArrowLeft"
                    ? (tab + count - 1) % count
                    : event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? count - 1
                        : undefined;
              if (next === undefined) return;
              event.preventDefault();
              selectTab(next);
            }
          }
        >
          {cellFormatPages.map(
            /** Projects each available page into the tab strip. @param entry - Original row data. @param index - Source position. @returns Tab element. */ (
              [page, label],
              index,
            ) => (
              <button
                id={id + "-tab-" + page}
                key={page}
                type="button"
                role="tab"
                aria-selected={tab === index}
                aria-controls={id + "-" + page}
                tabIndex={tab === index ? 0 : -1}
                className={
                  "rounded-t px-3 py-2 text-sm " +
                  (tab === index
                    ? "bg-indigo-50 font-semibold text-indigo-900"
                    : "text-slate-700 hover:bg-slate-100")
                }
                onClick={
                  /** Selects the clicked source page. @returns Nothing. */ () => selectTab(index)
                }
              >
                {label}
              </button>
            ),
          )}
        </div>
        <div className="min-h-0 min-w-0 flex-1 overflow-auto px-4 py-3">
          {cellFormatPages.map(
            /** Keeps each page state during notebook navigation. @param entry - Original row data. @param index - Source position. @returns Page panel. */ (
              [page],
              index,
            ) => (
              <div
                role="tabpanel"
                key={page}
                hidden={tab !== index}
                id={id + "-" + page}
                aria-labelledby={id + "-tab-" + page}
              >
                {page === "numbers" ? (
                  <NumberFormatTabPage
                    key={resetNumber}
                    model={model}
                    edit={numbers}
                    setEdit={setNumbers}
                  />
                ) : page === "font" ? (
                  <FontTabPage key={resetFont} model={model} onChange={stage} />
                ) : page === "fonteffects" ? (
                  <FontEffectsTabPage model={model} onChange={stage} />
                ) : page === "borders" ? (
                  <CellBordersTabPage
                    model={model}
                    onChange={stage}
                    resetKey={resetBorder}
                    onChangeFrame={frameChanged}
                  />
                ) : page === "alignment" ? (
                  <AlignmentTabPage model={model} onChange={stage} />
                ) : page === "asiantypography" ? (
                  <AsianTypographyTabPage
                    model={model.asianTypography}
                    onChange={
                      /** Stages the native checkbox state. @param slot - Native paragraph slot. @param checked - Control state. @returns Nothing. */
                      (slot, checked) => {
                        model.asianTypography.SetValue(slot, checked);
                        setRevision(revision + 1);
                      }
                    }
                  />
                ) : page === "background" ? (
                  backgroundVisited && (
                    <AreaTabPage
                      key={resetBackground}
                      page={model.background.GetAreaPage()}
                      changed={backgroundChanged}
                      label={backgroundLabel}
                    />
                  )
                ) : (
                  <CellProtectionTabPage model={model} onChange={stage} />
                )}
              </div>
            ),
          )}
        </div>
        <div className="flex items-center gap-2 border-t border-slate-200 px-4 py-3">
          <button
            type="button"
            className="rounded border border-slate-300 px-3 py-1 text-sm"
            onClick={reset}
          >
            Reset
          </button>
          {invalid && (
            <output aria-live="polite" className="text-sm text-red-700">
              Invalid format code
            </output>
          )}
          <button
            type="button"
            className="ml-auto rounded border border-slate-300 px-3 py-1 text-sm"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded bg-indigo-700 px-4 py-1 text-sm text-white disabled:opacity-50"
            disabled={invalid}
          >
            OK
          </button>
        </div>
      </form>
    </div>
  );
}
