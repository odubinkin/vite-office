/** @fileoverview Renders the bounded browser Page tab from LibreOffice's PageFormatPage. */
/* eslint-disable react-refresh/only-export-components -- Pure presentation helpers are exported for focused behavior verification. */

import { useMemo, useState } from "react";

import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import {
  validateWriterPageDescriptor,
  WRITER_PAPER_SIZES,
  type WriterPageDescriptorValue,
  type WriterPaperFormat,
} from "../../source/core/layout/pagedesc";

/** Inputs and completion callbacks for the bounded Writer Page tab. */
export interface WriterPageStyleDialogProps {
  readonly initialValue: WriterPageDescriptorValue;
  readonly onCancel: () => void;
  readonly onSubmit: (value: WriterPageDescriptorValue) => void;
}

/** Collects the supported Page Style physical geometry with a live upstream-shaped preview. @param props - Initial geometry and completion callbacks. @returns Page Style dialog. */
export function WriterPageStyleDialog({
  initialValue,
  onCancel,
  onSubmit,
}: WriterPageStyleDialogProps): React.JSX.Element {
  const localization = useBrowserLocalization();
  const [draft, setDraft] = useState(initialValue);
  const [error, setError] = useState<string>();
  const previewScale = 150 / Math.max(draft.width, draft.height);
  const preview = useMemo(
    /** Projects the page preview dimensions. @returns Preview CSS dimensions. */ () => ({
      height: draft.height * previewScale,
      width: draft.width * previewScale,
    }),
    [draft.height, draft.width, previewScale],
  );

  /** Updates one metric field and marks the paper size custom. @param key - Page field. @param centimetres - Entered length. @returns Nothing. */
  function updateLength(key: keyof WriterPageDescriptorValue, centimetres: number): void {
    setDraft({ ...draft, [key]: Math.round((centimetres * 1440) / 2.54), paperFormat: "custom" });
    setError(undefined);
  }

  return (
    <div
      aria-label={localization.GetText("writer.page-style.title", "Page Style")}
      aria-modal="true"
      data-writer-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
      role="dialog"
    >
      <form
        data-writer-modal-panel="true"
        className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-2xl"
        onSubmit={
          /** Validates and accepts the draft. @param event - Form submission. @returns Nothing. */ (
            event,
          ) => {
            event.preventDefault();
            try {
              onSubmit(validateWriterPageDescriptor(draft));
            } catch (caught) {
              setError(caught instanceof Error ? caught.message : "Invalid page geometry.");
            }
          }
        }
      >
        <h2 className="text-lg font-bold text-slate-950">
          {localization.GetText("writer.page-style.title", "Page Style")}
        </h2>
        <div className="mt-1 border-b border-slate-200 pb-2 text-sm font-semibold text-indigo-700">
          {localization.GetText("writer.page-style.page-tab", "Page")}
        </div>
        <div className="mt-4 grid gap-6 md:grid-cols-[minmax(0,1fr)_190px]">
          <div className="grid gap-4">
            <fieldset className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 p-3">
              <legend className="px-1 text-sm font-bold text-slate-700">Paper format</legend>
              <label className="col-span-2 grid gap-1 text-sm font-semibold text-slate-700">
                Format
                <select
                  aria-label="Paper format"
                  className="rounded-md border border-slate-300 px-3 py-2 font-normal"
                  onChange={
                    /** Applies one paper-format selection. @param event - Select change. @returns Nothing. */ (
                      event,
                    ) => {
                      const format = event.target.value as WriterPaperFormat;
                      const size = format === "custom" ? undefined : WRITER_PAPER_SIZES[format];
                      setDraft(
                        size === undefined
                          ? { ...draft, paperFormat: format }
                          : {
                              ...draft,
                              height: draft.landscape ? size.width : size.height,
                              paperFormat: format,
                              width: draft.landscape ? size.height : size.width,
                            },
                      );
                      setError(undefined);
                    }
                  }
                  value={draft.paperFormat}
                >
                  <option value="A4">A4</option>
                  <option value="Letter">Letter</option>
                  <option value="custom">Custom</option>
                </select>
              </label>
              <MetricField
                label="Width"
                value={draft.width}
                onChange={
                  /** Updates custom width. @param value - Centimetres. @returns Nothing. */ (
                    value,
                  ) => updateLength("width", value)
                }
              />
              <MetricField
                label="Height"
                value={draft.height}
                onChange={
                  /** Updates custom height. @param value - Centimetres. @returns Nothing. */ (
                    value,
                  ) => updateLength("height", value)
                }
              />
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  checked={!draft.landscape}
                  name="orientation"
                  onChange={
                    /** Selects portrait orientation. @returns Nothing. */ () =>
                      setDraft(swapOrientation(draft, false))
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
                    /** Selects landscape orientation. @returns Nothing. */ () =>
                      setDraft(swapOrientation(draft, true))
                  }
                  type="radio"
                />
                Landscape
              </label>
            </fieldset>
            <fieldset className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 p-3">
              <legend className="px-1 text-sm font-bold text-slate-700">Margins</legend>
              <MetricField
                label="Left"
                value={draft.leftMargin}
                onChange={
                  /** Updates the left margin. @param value - Centimetres. @returns Nothing. */ (
                    value,
                  ) => updateLength("leftMargin", value)
                }
              />
              <MetricField
                label="Right"
                value={draft.rightMargin}
                onChange={
                  /** Updates the right margin. @param value - Centimetres. @returns Nothing. */ (
                    value,
                  ) => updateLength("rightMargin", value)
                }
              />
              <MetricField
                label="Top"
                value={draft.topMargin}
                onChange={
                  /** Updates the top margin. @param value - Centimetres. @returns Nothing. */ (
                    value,
                  ) => updateLength("topMargin", value)
                }
              />
              <MetricField
                label="Bottom"
                value={draft.bottomMargin}
                onChange={
                  /** Updates the bottom margin. @param value - Centimetres. @returns Nothing. */ (
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
          <p className="mt-3 text-sm font-semibold text-red-700">{error}</p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-md bg-indigo-700 px-4 py-2 text-sm font-semibold text-white"
            type="submit"
          >
            OK
          </button>
        </div>
      </form>
    </div>
  );
}

/** Renders one centimetre input backed by a Writer twip value. @param props - Field label, twip value, and callback. @returns Metric input. */
function MetricField({
  label,
  onChange,
  value,
}: Readonly<{
  label: string;
  onChange: (value: number) => void;
  value: number;
}>): React.JSX.Element {
  return (
    <label className="grid gap-1 text-sm font-semibold text-slate-700">
      {label}
      <span className="flex items-center gap-1">
        <input
          aria-label={`${label} (cm)`}
          className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1.5 font-normal"
          min="0"
          onChange={
            /** Reports one changed metric value. @param event - Number input change. @returns Nothing. */ (
              event,
            ) => onChange(Number(event.target.value))
          }
          step="0.01"
          type="number"
          value={Number(((value * 2.54) / 1440).toFixed(2))}
        />
        <span className="text-xs font-normal">cm</span>
      </span>
    </label>
  );
}

/** Swaps physical dimensions when the requested orientation changes. @param value - Current page value. @param landscape - Requested orientation. @returns Oriented page value. */
export function swapOrientation(
  value: WriterPageDescriptorValue,
  landscape: boolean,
): WriterPageDescriptorValue {
  if (value.landscape === landscape) return value;
  return { ...value, height: value.width, landscape, width: value.height };
}
