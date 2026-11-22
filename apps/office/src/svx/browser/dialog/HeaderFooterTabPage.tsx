/** @fileoverview Browser controls and confirmation for the native Header and Footer format pages. */
import { useEffect, useRef, useState } from "react";
import { MetricSpinButton } from "../../../svtools/browser/control/MetricSpinButton";
import type { FieldUnit } from "../../../tools/inc/fldunit";
import type { SvxHFPageState } from "../../source/dialog/hdft";

/** Physical page for the story layout preview and metric limits. */
interface PageGeometry {
  readonly height: number;
  readonly width: number;
  readonly leftMargin: number;
  readonly rightMargin: number;
  readonly topMargin: number;
  readonly bottomMargin: number;
}

/** The shared browser controls for one page-story format. @param props - Native values, page geometry, and toggle receiver. @returns Header or Footer tab panel contents. */
export function HeaderFooterTabPage({
  state,
  other,
  header,
  originallyEnabled,
  allowSideSharing,
  geometry,
  unit,
  onChange,
  label,
}: Readonly<{
  state: SvxHFPageState;
  other: SvxHFPageState;
  header: boolean;
  originallyEnabled: boolean;
  allowSideSharing: boolean;
  geometry: PageGeometry;
  unit: FieldUnit;
  onChange: (state: SvxHFPageState) => void;
  label: (key: string, fallback: string) => string;
}>): React.JSX.Element {
  const [confirm, setConfirm] = useState(false);
  const confirmation = useRef<HTMLDialogElement>(null);
  const toggle = useRef<HTMLInputElement>(null);
  useEffect(
    /** Opens the native child modal over the page-style notebook. @returns Nothing. */
    () => {
      if (confirm) confirmation.current?.showModal?.();
    },
    [confirm],
  );
  const kind = header ? "header" : "footer";
  const title = header ? label("header", "Header") : label("footer", "Footer");
  const height = geometry.height - geometry.topMargin - geometry.bottomMargin;
  const width = geometry.width - geometry.leftMargin - geometry.rightMargin;
  const minimumBody = Math.floor(height / 5);
  const otherExtent = other.enabled ? other.height + other.spacing : 0;
  const extent = Math.max(0, height - minimumBody - otherExtent);
  const scale = 140 / Math.max(geometry.width, geometry.height);
  const head = header ? state : other;
  const foot = header ? other : state;

  /** Ends the child modal and restores the activation control. @param remove - Accepted deletion. @returns Nothing. */
  function finish(remove: boolean): void {
    confirmation.current?.close?.();
    setConfirm(false);
    if (remove) onChange({ ...state, enabled: false });
    toggle.current?.focus();
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem]">
      <div className="grid gap-2">
        <label className="flex items-center gap-2">
          <input
            ref={toggle}
            type="checkbox"
            checked={state.enabled}
            onChange={
              /** Activates a story or asks before removing an existing one. @param event - Browser checkbox event. @returns Nothing. */
              (event) => {
                const enabled = event.currentTarget.checked;
                if (!enabled && originallyEnabled) setConfirm(true);
                else onChange({ ...state, enabled });
              }
            }
          />
          {header ? label("header-on", "Header on") : label("footer-on", "Footer on")}
        </label>
        <fieldset
          disabled={!state.enabled}
          className="grid gap-2 rounded border border-slate-200 p-3 disabled:opacity-60"
        >
          <legend>{title}</legend>
          {(
            [
              ["shared", label("shared-left-right", "Same content on left and right pages")],
              ["sharedFirst", label("shared-first", "Same content on first page")],
              ["dynamicSpacing", label("dynamic-spacing", "Use dynamic spacing")],
              ["dynamicHeight", label("dynamic-height", "AutoFit height")],
            ] as const
          ).map(
            /** Renders one original sharing or height flag. @param entry - Native field and label. @returns Checkbox. */
            ([key, name]) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state[key]}
                  disabled={key === "shared" && !allowSideSharing}
                  onChange={
                    /** Applies one original toggle. @param event - Browser checkbox event. @returns Nothing. */
                    (event) => onChange({ ...state, [key]: event.currentTarget.checked })
                  }
                />
                {name}
              </label>
            ),
          )}
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["left", label("left-margin", "Left margin"), width - state.right - 57],
                ["right", label("right-margin", "Right margin"), width - state.left - 57],
                ["spacing", label("spacing", "Spacing"), extent - Math.max(57, state.height)],
                [
                  "height",
                  label("height", "Height"),
                  Math.max(minimumBody, extent - state.spacing),
                ],
              ] as const
            ).map(
              /** Shows one native twip field using the document's measurement unit. @param entry - Native control details. @returns Metric field. */
              ([key, name, max]) => (
                <label key={key} className="grid gap-1">
                  {name}
                  <MetricSpinButton
                    aria-label={name}
                    unit={unit}
                    value={state[key]}
                    minimum={0}
                    maximum={Math.max(0, max)}
                    className="min-w-0 rounded border border-slate-300 px-2 py-1"
                    onValueChange={
                      /** Exchanges the normalized native twip value. @param value - Physical size. @returns Nothing. */
                      (value) => onChange({ ...state, [key]: value })
                    }
                  />
                </label>
              ),
            )}
          </div>
        </fieldset>
      </div>
      <div
        className="m-auto relative overflow-hidden border border-slate-400 bg-white"
        aria-label={label("preview", "Preview")}
        style={{ width: geometry.width * scale, height: geometry.height * scale }}
      >
        {head.enabled && (
          <div
            className="absolute bg-indigo-100"
            style={{
              top: geometry.topMargin * scale,
              height: head.height * scale,
              left: (geometry.leftMargin + head.left) * scale,
              right: (geometry.rightMargin + head.right) * scale,
            }}
          />
        )}
        {foot.enabled && (
          <div
            className="absolute bg-indigo-100"
            style={{
              bottom: geometry.bottomMargin * scale,
              height: foot.height * scale,
              left: (geometry.leftMargin + foot.left) * scale,
              right: (geometry.rightMargin + foot.right) * scale,
            }}
          />
        )}
        <div
          className="absolute border border-dashed border-slate-300"
          style={{
            top: (geometry.topMargin + (head.enabled ? head.height + head.spacing : 0)) * scale,
            bottom:
              (geometry.bottomMargin + (foot.enabled ? foot.height + foot.spacing : 0)) * scale,
            left: geometry.leftMargin * scale,
            right: geometry.rightMargin * scale,
          }}
        />
      </div>
      {confirm && (
        <dialog
          ref={confirmation}
          role="alertdialog"
          aria-label={label(`delete-${kind}`, header ? "Delete header?" : "Delete footer?")}
          className="m-auto max-w-sm rounded border border-slate-300 bg-white p-4"
          open={typeof globalThis.HTMLDialogElement?.prototype.showModal !== "function"}
          onCancel={
            /** Cancels only this child confirmation. @param event - Browser cancel event. @returns Nothing. */
            (event) => {
              event.preventDefault();
              event.stopPropagation();
              finish(false);
            }
          }
          onKeyDown={
            /** Keeps Escape inside the active child dialog. @param event - Keyboard event. @returns Nothing. */
            (event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                finish(false);
              }
            }
          }
        >
          <p>
            {header
              ? label("delete-header-question", "Are you sure you want to delete the header?")
              : label("delete-footer-question", "Are you sure you want to delete the footer?")}
          </p>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              className="rounded border px-3 py-1"
              autoFocus
              onClick={/** Retains the existing story. @returns Nothing. */ () => finish(false)}
            >
              {label("no", "No")}
            </button>
            <button
              type="button"
              className="rounded border px-3 py-1"
              onClick={
                /** Confirms removal if Page Style is accepted. @returns Nothing. */ () =>
                  finish(true)
              }
            >
              {label("yes", "Yes")}
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
}
