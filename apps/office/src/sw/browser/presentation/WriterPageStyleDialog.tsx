/** @fileoverview Renders the bounded browser Page tab from LibreOffice's PageFormatPage. */

import { MetricSpinButton } from "../../../svtools/browser/control/MetricSpinButton";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { WriterDialogHeader } from "./WriterDialogHeader";
import { useEffect, useMemo, useRef, useState } from "react";

import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import {
  validateWriterPageDescriptor,
  type WriterPageDescriptorValue,
} from "../../source/core/layout/pagedesc";
import { Paper } from "../../../i18nutil/inc/paper";
import { SvxPageDescPage } from "../../../cui/source/tabpages/page";
import { getPageFormatDefaultLimits } from "../../../cui/browser/dialog/page-format-defaults";

/** Inputs and completion callbacks for the bounded Writer Page tab. */
export interface WriterPageStyleDialogProps {
  readonly unit?: FieldUnit;
  readonly initialValue: WriterPageDescriptorValue;
  readonly onCancel: () => void;
  readonly onSubmit: (value: WriterPageDescriptorValue) => void;
}

/** Collects the supported Page Style physical geometry with a live upstream-shaped preview. @param props - Initial geometry and completion callbacks. @returns Page Style dialog. */
export function WriterPageStyleDialog({
  initialValue,
  unit = FieldUnit.CM,
  onCancel,
  onSubmit,
}: WriterPageStyleDialogProps): React.JSX.Element {
  const initialControl = useRef<HTMLSelectElement>(null);
  useEffect(
    /** Focuses this mounted page-format control. @returns Nothing. */ () => {
      initialControl.current?.focus();
    },
    [],
  );
  const localization = useBrowserLocalization();
  const [page] = useState(
    /** Creates the original page-geometry and list owners for this request. @returns Page tab. */ () =>
      new SvxPageDescPage(
        initialValue,
        getPageFormatDefaultLimits(),
        /** Resolves original resource context and label through the actual platform localization port. @param context - Source context. @param text - Source label. @returns Translated label or source fallback. */ (
          context,
          text,
        ) => localization.GetText(`${context}.${text}`, text),
      ),
  );
  const [draft, setDraft] = useState(page.GetGeometry());
  const [paper, setPaper] = useState(page.GetPaperSizeBox().get_active_id());
  const ranges = page.GetFieldRanges();
  /** Publishes original geometry and selection after one source event. @returns Nothing. */
  function sync(): void {
    setDraft(page.GetGeometry());
    setPaper(page.GetPaperSizeBox().get_active_id());
    setError(undefined);
  }
  const [error, setError] = useState<string>();
  const previewScale = 150 / Math.max(draft.width, draft.height);
  const preview = useMemo(
    /** Projects the page preview dimensions. @returns Preview CSS dimensions. */ () => ({
      height: draft.height * previewScale,
      width: draft.width * previewScale,
    }),
    [draft.height, draft.width, previewScale],
  );

  /** Delegates a physical axis or margin edit to its original source handler. @param key - Page field. @param twips - Accepted physical length. @returns Nothing. */
  function updateLength(
    key: "width" | "height" | "leftMargin" | "rightMargin" | "topMargin" | "bottomMargin",
    twips: number,
  ): void {
    if (key === "width" || key === "height") page.PaperSizeModify_Impl(key, twips);
    else page.SetMargin(key, twips);
    sync();
  }

  return (
    <div
      aria-label={localization.GetText("writer.page-style.title", "Page Style")}
      aria-modal="true"
      data-writer-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
      onKeyDown={
        /** Cancels the exact active page-style request. @param event - Native key. @returns Nothing. */ (
          event,
        ) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            onCancel();
          }
        }
      }
      onMouseDown={
        /** Retains the active modal control when the background receives a pointer press. @param event - Actual pointer input. @returns Nothing. */ (
          event,
        ) => {
          if (event.target === event.currentTarget) event.preventDefault();
        }
      }
      role="dialog"
    >
      <form
        data-writer-modal-panel="true"
        className="w-full max-w-2xl bg-white"
        onSubmit={
          /** Validates and accepts the draft. @param event - Form submission. @returns Nothing. */ (
            event,
          ) => {
            event.preventDefault();
            try {
              onSubmit(
                validateWriterPageDescriptor({ ...initialValue, ...page.GetAcceptedGeometry() }),
              );
            } catch (caught) {
              setError(caught instanceof Error ? caught.message : "Invalid page geometry.");
            }
          }
        }
      >
        <WriterDialogHeader
          title={localization.GetText("writer.page-style.title", "Page Style")}
          onClose={onCancel}
        />
        <div className="writer-dialog-content">
          <div className="border-b border-slate-200 pb-2 text-sm font-semibold text-indigo-700">
            {localization.GetText("writer.page-style.page-tab", "Page")}
          </div>
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_190px]">
            <div className="grid gap-4">
              <fieldset className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 p-3">
                <legend className="px-1 text-sm font-bold text-slate-700">Paper format</legend>
                <label className="col-span-2 grid gap-1 text-sm font-semibold text-slate-700">
                  Format
                  <select
                    ref={initialControl}
                    aria-label="Paper format"
                    className="rounded-md border border-slate-300 px-3 py-2 font-normal"
                    onChange={
                      /** Applies one paper-format selection. @param event - Select change. @returns Nothing. */ (
                        event,
                      ) => {
                        page.PaperSizeSelect_Impl(Number(event.target.value) as Paper);
                        sync();
                      }
                    }
                    value={paper}
                  >
                    {page
                      .GetPaperSizeBox()
                      .GetEntries()
                      .map(
                        /** Retains the actual source list order and IDs. @param entry - Native paper row. @returns Platform option. */ (
                          entry,
                        ) => (
                          <option key={entry.paper} value={entry.paper}>
                            {entry.label}
                          </option>
                        ),
                      )}
                  </select>
                </label>
                <MetricField
                  unit={unit}
                  label="Width"
                  minimum={ranges.width.minimum}
                  maximum={ranges.width.maximum}
                  value={draft.width}
                  onChange={
                    /** Updates custom width. @param value - Physical twips. @returns Nothing. */ (
                      value,
                    ) => updateLength("width", value)
                  }
                />
                <MetricField
                  unit={unit}
                  label="Height"
                  minimum={ranges.height.minimum}
                  maximum={ranges.height.maximum}
                  value={draft.height}
                  onChange={
                    /** Updates custom height. @param value - Physical twips. @returns Nothing. */ (
                      value,
                    ) => updateLength("height", value)
                  }
                />
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    checked={!draft.landscape}
                    name="orientation"
                    onChange={
                      /** Selects portrait orientation. @returns Nothing. */ () => {
                        page.SwapOrientation_Impl(false);
                        sync();
                      }
                    }
                    type="radio"
                  />
                  Portrait
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    checked={draft.landscape}
                    name="orientation"
                    onChange={
                      /** Selects landscape orientation. @returns Nothing. */ () => {
                        page.SwapOrientation_Impl(true);
                        sync();
                      }
                    }
                    type="radio"
                  />
                  Landscape
                </label>
              </fieldset>
              <fieldset className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 p-3">
                <legend className="px-1 text-sm font-bold text-slate-700">Margins</legend>
                <MetricField
                  unit={unit}
                  label="Left"
                  minimum={ranges.leftMargin.minimum}
                  maximum={ranges.leftMargin.maximum}
                  value={draft.leftMargin}
                  onChange={
                    /** Updates the left margin. @param value - Physical twips. @returns Nothing. */ (
                      value,
                    ) => updateLength("leftMargin", value)
                  }
                />
                <MetricField
                  unit={unit}
                  label="Right"
                  minimum={ranges.rightMargin.minimum}
                  maximum={ranges.rightMargin.maximum}
                  value={draft.rightMargin}
                  onChange={
                    /** Updates the right margin. @param value - Physical twips. @returns Nothing. */ (
                      value,
                    ) => updateLength("rightMargin", value)
                  }
                />
                <MetricField
                  unit={unit}
                  label="Top"
                  minimum={ranges.topMargin.minimum}
                  maximum={ranges.topMargin.maximum}
                  value={draft.topMargin}
                  onChange={
                    /** Updates the top margin. @param value - Physical twips. @returns Nothing. */ (
                      value,
                    ) => updateLength("topMargin", value)
                  }
                />
                <MetricField
                  unit={unit}
                  label="Bottom"
                  minimum={ranges.bottomMargin.minimum}
                  maximum={ranges.bottomMargin.maximum}
                  value={draft.bottomMargin}
                  onChange={
                    /** Updates the bottom margin. @param value - Physical twips. @returns Nothing. */ (
                      value,
                    ) => updateLength("bottomMargin", value)
                  }
                />
              </fieldset>
            </div>
            <div className="grid content-start justify-items-center gap-3 rounded-lg bg-slate-100 p-4">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Preview
              </span>
              <div
                className="relative border border-slate-500 bg-white shadow-md"
                style={{ height: preview.height, width: preview.width }}
              >
                <div
                  className="absolute border border-dashed border-indigo-400 bg-indigo-50/40"
                  style={{
                    bottom: draft.bottomMargin * previewScale,
                    left: draft.leftMargin * previewScale,
                    right: draft.rightMargin * previewScale,
                    top: draft.topMargin * previewScale,
                  }}
                />
              </div>
            </div>
          </div>
          {error === undefined ? null : (
            <p className="text-sm font-semibold text-red-700">{error}</p>
          )}
        </div>
        <div className="writer-dialog-actions">
          <button
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button className="writer-dialog-primary" type="submit">
            OK
          </button>
        </div>
      </form>
    </div>
  );
}

/** Renders one source metric entry over a physical Writer value. @param props - Label,unit,twips and callback. @returns Metric field. */
function MetricField({
  label,
  onChange,
  value,
  unit,
  minimum,
  maximum,
}: Readonly<{
  label: string;
  onChange: (twips: number) => void;
  value: number;
  unit: FieldUnit;
  minimum: number;
  maximum: number;
}>): React.JSX.Element {
  return (
    <label className="grid gap-1 text-sm font-semibold text-slate-700">
      {label}
      <MetricSpinButton
        aria-label={`${label} (${unit === FieldUnit.INCH ? "in" : unit === FieldUnit.CM ? "cm" : FieldUnit[unit].toLowerCase()})`}
        unit={unit}
        value={value}
        minimum={minimum}
        maximum={maximum}
        onValueChange={onChange}
        className="min-w-0 rounded-md border border-slate-300 px-2 py-1.5 font-normal"
      />
    </label>
  );
}
